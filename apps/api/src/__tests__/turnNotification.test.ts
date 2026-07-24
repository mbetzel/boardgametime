import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateTurnEmailHtml, sendTurnEmail } from '../services/emailService';
import { presenceManager } from '../services/presenceManager';
import { notifyNextPlayerIfInactive, TURN_EMAIL_COOLDOWN_MS } from '../services/notificationService';
import { prisma } from '@boardgametime/db';

describe('Turn Email Notification System', () => {
  beforeEach(() => {
    presenceManager.clear();
  });

  describe('emailService', () => {
    it('generates email subject, HTML, and text correctly', () => {
      const { subject, html, text } = generateTurnEmailHtml({
        to: 'player2@example.com',
        username: 'PlayerTwo',
        matchId: 'match-xyz-123',
        gameTitle: 'Kingdoms',
        opponentUsername: 'PlayerOne',
        playMode: 'ASYNC',
      });

      expect(subject).toBe("It's your turn in Kingdoms! 🎲");
      expect(text).toContain('Hello PlayerTwo');
      expect(text).toContain('match-xyz-123');
      expect(html).toContain("It's your turn, PlayerTwo!");
      expect(html).toContain('vs <strong>PlayerOne</strong>');
      expect(html).toContain('http://localhost:3000/matches/match-xyz-123');
    });

    it('sends email using console logger by default', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await sendTurnEmail({
        to: 'test@example.com',
        username: 'TestUser',
        matchId: 'match-123',
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('console');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('presenceManager', () => {
    it('tracks connected user sockets and room presence correctly', () => {
      const userId = 'user-uuid-1';
      const matchId = 'match-uuid-1';
      const socketId = 'socket-abc-123';

      expect(presenceManager.isUserConnected(userId)).toBe(false);
      expect(presenceManager.isUserActiveInMatch(userId, matchId)).toBe(false);

      presenceManager.registerSocket(userId, socketId);
      expect(presenceManager.isUserConnected(userId)).toBe(true);
      expect(presenceManager.isUserActiveInMatch(userId, matchId)).toBe(false);

      presenceManager.joinMatchRoom(userId, matchId, socketId);
      expect(presenceManager.isUserActiveInMatch(userId, matchId)).toBe(true);

      presenceManager.leaveMatchRoom(userId, matchId, socketId);
      expect(presenceManager.isUserActiveInMatch(userId, matchId)).toBe(false);

      presenceManager.unregisterSocket(userId, socketId);
      expect(presenceManager.isUserConnected(userId)).toBe(false);
    });
  });

  describe('notificationService', () => {
    it('suppresses turn email if target player is active in the match room', async () => {
      const userId = 'active-user-123';
      const matchId = 'match-active-123';
      const socketId = 'sock-1';

      presenceManager.registerSocket(userId, socketId);
      presenceManager.joinMatchRoom(userId, matchId, socketId);

      const result = await notifyNextPlayerIfInactive(matchId, userId);
      expect(result).toBeNull();
    });

    it('suppresses turn email if target player does not exist or has invalid match', async () => {
      const result = await notifyNextPlayerIfInactive('non-existent-match-id', 'non-existent-user-id');
      expect(result).toBeNull();
    });
  });
});
