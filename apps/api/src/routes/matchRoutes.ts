import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@boardgametime/db';
import { SubmitActionRequest, MatchDTO, MatchEventDTO, MatchChatMessageDTO, PlayMode, MatchStatus } from '@boardgametime/types';
import { KingdomsGameEngine, KingdomsAction } from '@boardgametime/game-kingdoms';
import { DungeonsDiceDangerGameEngine, DungeonsDiceDangerAction } from '@boardgametime/game-dungeons-dice-danger';
import { verifyToken } from '../services/authService';
import { getSocketServer } from '../sockets/socketServer';
import { notifyNextPlayerIfInactive } from '../services/notificationService';
import { sanitizeChatMessageInput } from '../services/chatSanitizer';

const kingdomsEngine = new KingdomsGameEngine();
const dungeonsDiceDangerEngine = new DungeonsDiceDangerGameEngine();

function getAuthUser(request: FastifyRequest) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

export function mapMatchToDTO(match: any, requestingUserId?: string): MatchDTO {
  let state = match.stateSnapshot as any;
  if (state && requestingUserId) {
    if (match.gameId === 'kingdoms') {
      state = kingdomsEngine.sanitizeStateForPlayer(state, requestingUserId);
    } else if (match.gameId === 'dungeons-dice-danger') {
      state = dungeonsDiceDangerEngine.sanitizeStateForPlayer(state, requestingUserId);
    }
  }
  const hasPendingTurn = !!match.turnStartStateSnapshot || !!state?.pendingTurnConfirmation || !!state?.pendingPlacement;
  return {
    id: match.id,
    gameId: match.gameId,
    mode: match.mode as PlayMode,
    status: match.status as MatchStatus,
    currentTurnPlayerId: match.currentTurnPlayerId,
    stateSnapshot: state,
    turnStartStateSnapshot: match.turnStartStateSnapshot || null,
    hasPendingTurn,
    players: (match.players || []).map((p: any) => ({
      id: p.id,
      matchId: p.matchId,
      userId: p.userId,
      username: p.user?.username || '',
      seatIndex: p.seatIndex,
      avatarUrl: p.user?.avatarUrl || null,
    })),
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
  };
}

export async function matchRoutes(fastify: FastifyInstance) {
  // Get matches for current user
  fastify.get('/', async (request: FastifyRequest<{ Querystring: { status?: string } }>, reply: FastifyReply) => {
    let auth;
    try {
      auth = getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { status = 'IN_PROGRESS' } = (request.query as { status?: string }) || {};

    const whereClause: any = {
      players: {
        some: {
          userId: auth.sub,
        },
      },
    };

    if (status.toUpperCase() !== 'ALL') {
      whereClause.status = status.toUpperCase();
    }

    const matches = await prisma.match.findMany({
      where: whereClause,
      include: {
        players: {
          include: { user: true },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return reply.send(matches.map((m) => mapMatchToDTO(m, auth.sub)));
  });

  // Get match state
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    let auth;
    try {
      auth = getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { id } = request.params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        players: {
          include: { user: true },
        },
      },
    });

    if (!match) {
      return reply.status(404).send({ message: 'Match not found.' });
    }

    const isPlayerInMatch = match.players.some((p) => p.userId === auth.sub);
    if (!isPlayerInMatch) {
      return reply.status(403).send({ message: 'Forbidden. You are not a player in this match.' });
    }

    return reply.send(mapMatchToDTO(match, auth.sub));
  });

  // Submit action
  fastify.post('/:id/action', async (request: FastifyRequest<{ Params: { id: string }; Body: SubmitActionRequest }>, reply: FastifyReply) => {
    let auth;
    try {
      auth = getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { id } = request.params;
    const { actionType, actionPayload } = request.body || {};

    if (!actionType) {
      return reply.status(400).send({ message: 'actionType is required.' });
    }

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        players: {
          include: { user: true },
        },
      },
    });

    if (!match) {
      return reply.status(404).send({ message: 'Match not found.' });
    }

    if (match.status !== 'IN_PROGRESS') {
      return reply.status(400).send({ message: 'Match is already completed or abandoned.' });
    }

    const isPlayerInMatch = match.players.some((p) => p.userId === auth.sub);
    if (!isPlayerInMatch) {
      return reply.status(403).send({ message: 'Player is not in this match.' });
    }

    const currentState = match.stateSnapshot as any;
    let newState: any;
    let turnStartSnapshotToSave: any = match.turnStartStateSnapshot;

    if (actionType === 'CANCEL_TURN') {
      if (match.turnStartStateSnapshot) {
        if (match.gameId === 'kingdoms') {
          const result = kingdomsEngine.applyAction(currentState, { type: 'CANCEL_TURN', playerId: auth.sub });
          newState = result.newState;
          if (!newState.pendingDrawnTile) {
            turnStartSnapshotToSave = null;
          }
        } else if (match.gameId === 'dungeons-dice-danger') {
          const result = dungeonsDiceDangerEngine.applyAction(currentState, { type: 'CANCEL_TURN', playerId: auth.sub });
          newState = result.newState;
          turnStartSnapshotToSave = null;
        } else {
          newState = match.turnStartStateSnapshot;
          turnStartSnapshotToSave = null;
        }
      } else {
        newState = currentState;
      }
    } else {
      if (match.gameId === 'kingdoms') {
        const action: KingdomsAction = {
          type: actionType as any,
          playerId: auth.sub,
          ...(typeof actionPayload === 'object' && actionPayload !== null ? actionPayload : {}),
        } as KingdomsAction;

        try {
          const result = kingdomsEngine.applyAction(currentState, action);
          newState = result.newState;
        } catch (err: any) {
          return reply.status(400).send({ message: err.message || 'Invalid game action.' });
        }
      } else if (match.gameId === 'dungeons-dice-danger') {
        const action: DungeonsDiceDangerAction = {
          type: actionType as any,
          playerId: auth.sub,
          ...(typeof actionPayload === 'object' && actionPayload !== null ? actionPayload : {}),
        } as DungeonsDiceDangerAction;

        try {
          const result = dungeonsDiceDangerEngine.applyAction(currentState, action);
          newState = result.newState;
        } catch (err: any) {
          return reply.status(400).send({ message: err.message || 'Invalid game action.' });
        }
      } else {
        newState = { ...currentState };
      }

      if (actionType === 'CONFIRM_TURN') {
        turnStartSnapshotToSave = null;
      } else if (!turnStartSnapshotToSave && actionType !== 'PASS') {
        turnStartSnapshotToSave = currentState;
      }
    }

    // Sequence num calculation & DB transaction
    const eventCount = await prisma.matchEvent.count({ where: { matchId: id } });
    const sequenceNum = eventCount + 1;

    const [eventRecord, updatedMatch] = await prisma.$transaction([
      prisma.matchEvent.create({
        data: {
          matchId: id,
          sequenceNum,
          playerId: auth.sub,
          actionType,
          actionPayload: actionPayload as any,
        },
      }),
      prisma.match.update({
        where: { id },
        data: {
          stateSnapshot: newState,
          turnStartStateSnapshot: turnStartSnapshotToSave,
          currentTurnPlayerId: newState.activePlayerId || null,
          status: newState.isComplete ? 'COMPLETED' : 'IN_PROGRESS',
        },
        include: {
          players: {
            include: { user: true },
          },
        },
      }),
    ]);

    const eventDto: MatchEventDTO = {
      id: eventRecord.id.toString(),
      matchId: id,
      sequenceNum: eventRecord.sequenceNum,
      playerId: eventRecord.playerId,
      actionType: eventRecord.actionType,
      actionPayload: eventRecord.actionPayload,
      createdAt: eventRecord.createdAt.toISOString(),
    };

    const matchDto = mapMatchToDTO(updatedMatch, auth.sub);

    const io = getSocketServer();
    if (io) {
      io.of('/matches').to(id).emit('action_applied', eventDto);
      io.of('/matches').to(id).emit('match_updated', matchDto);
    }

    if (updatedMatch.currentTurnPlayerId && updatedMatch.currentTurnPlayerId !== auth.sub) {
      notifyNextPlayerIfInactive(id, updatedMatch.currentTurnPlayerId).catch((err) => {
        console.error('[MatchRoutes] Turn email notification error:', err);
      });
    }

    return reply.send(matchDto);
  });

  // Get event log
  fastify.get('/:id/events', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    let auth;
    try {
      auth = getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { id } = request.params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: { players: true },
    });

    if (!match) {
      return reply.status(404).send({ message: 'Match not found.' });
    }

    const isPlayerInMatch = match.players.some((p) => p.userId === auth.sub);
    if (!isPlayerInMatch) {
      return reply.status(403).send({ message: 'Forbidden. You are not a player in this match.' });
    }

    const events = await prisma.matchEvent.findMany({
      where: { matchId: id },
      orderBy: { sequenceNum: 'asc' },
    });

    const eventDtos: MatchEventDTO[] = events.map((e) => ({
      id: e.id.toString(),
      matchId: e.matchId,
      sequenceNum: e.sequenceNum,
      playerId: e.playerId,
      actionType: e.actionType,
      actionPayload: e.actionPayload,
      createdAt: e.createdAt.toISOString(),
    }));

    return reply.send(eventDtos);
  });

  // Get chat messages history
  fastify.get('/:id/messages', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    let auth;
    try {
      auth = getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { id } = request.params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: { players: true },
    });

    if (!match) {
      return reply.status(404).send({ message: 'Match not found.' });
    }

    const isPlayerInMatch = match.players.some((p) => p.userId === auth.sub);
    if (!isPlayerInMatch) {
      return reply.status(403).send({ message: 'Forbidden. You are not a player in this match.' });
    }

    const messages = await prisma.matchChatMessage.findMany({
      where: { matchId: id },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    });

    const dtos: MatchChatMessageDTO[] = messages.map((m) => ({
      id: m.id,
      matchId: m.matchId,
      senderId: m.senderId,
      senderUsername: m.sender.username,
      senderAvatarUrl: m.sender.avatarUrl,
      text: m.text,
      createdAt: m.createdAt.toISOString(),
    }));

    return reply.send(dtos);
  });

  // Post a chat message via REST
  fastify.post('/:id/messages', async (request: FastifyRequest<{ Params: { id: string }; Body: { text: string } }>, reply: FastifyReply) => {
    let auth;
    try {
      auth = getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { id } = request.params;
    const { text } = (request.body as { text: string }) || {};

    const { valid, sanitizedText, error } = sanitizeChatMessageInput(text);
    if (!valid) {
      return reply.status(400).send({ message: error || 'Invalid chat message text.' });
    }

    const match = await prisma.match.findUnique({
      where: { id },
      include: { players: true },
    });

    if (!match) {
      return reply.status(404).send({ message: 'Match not found.' });
    }

    const isPlayerInMatch = match.players.some((p) => p.userId === auth.sub);
    if (!isPlayerInMatch) {
      return reply.status(403).send({ message: 'Forbidden. You are not a player in this match.' });
    }

    const message = await prisma.matchChatMessage.create({
      data: {
        matchId: id,
        senderId: auth.sub,
        text: sanitizedText,
      },
      include: { sender: true },
    });

    const dto: MatchChatMessageDTO = {
      id: message.id,
      matchId: message.matchId,
      senderId: message.senderId,
      senderUsername: message.sender.username,
      senderAvatarUrl: message.sender.avatarUrl,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
    };

    const io = getSocketServer();
    if (io) {
      io.of('/matches').to(id).emit('chat_message', dto);
    }

    return reply.status(201).send(dto);
  });
}
