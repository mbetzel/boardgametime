import { prisma } from '@boardgametime/db';
import { presenceManager } from './presenceManager';
import { sendTurnEmail, EmailServiceResult } from './emailService';

export const TURN_EMAIL_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown

export async function notifyNextPlayerIfInactive(
  matchId: string,
  targetUserId: string | null
): Promise<EmailServiceResult | null> {
  if (!matchId || !targetUserId) {
    return null;
  }

  // 1. Check if user is active in the match room via presence manager
  const isActiveInMatch = presenceManager.isUserActiveInMatch(targetUserId, matchId);
  if (isActiveInMatch) {
    // User is active in the match room right now, no need to email!
    return null;
  }

  // 2. Load match and player data
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      players: {
        include: { user: true },
      },
    },
  });

  if (!match || match.status !== 'IN_PROGRESS') {
    return null;
  }

  const targetMatchPlayer = match.players.find((p) => p.userId === targetUserId);
  if (!targetMatchPlayer || !targetMatchPlayer.user || !targetMatchPlayer.user.email) {
    return null;
  }

  const user = targetMatchPlayer.user;

  // 3. Check user email notification preferences
  if (user.gameTurnReminders === false) {
    return null;
  }

  // 4. Check cooldown rate limiting
  if (targetMatchPlayer.lastTurnEmailSentAt) {
    const timeSinceLastEmail = Date.now() - new Date(targetMatchPlayer.lastTurnEmailSentAt).getTime();
    if (timeSinceLastEmail < TURN_EMAIL_COOLDOWN_MS) {
      // Cooldown active, skip duplicate email
      return null;
    }
  }

  // 5. Find opponent username for rich email content
  const opponent = match.players.find((p) => p.userId !== targetUserId);
  const opponentUsername = opponent?.user?.username || undefined;

  const gameTitle = match.gameId === 'kingdoms' ? 'Kingdoms' : match.gameId;

  // 6. Send Email
  const result = await sendTurnEmail({
    to: user.email,
    username: user.username,
    matchId: match.id,
    gameTitle,
    opponentUsername,
    playMode: match.mode,
  });

  if (result.success) {
    // 7. Update lastTurnEmailSentAt timestamp
    await prisma.matchPlayer.update({
      where: { id: targetMatchPlayer.id },
      data: { lastTurnEmailSentAt: new Date() },
    });
  }

  return result;
}
