import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { prisma } from '@boardgametime/db';
import { KingdomsGameEngine, KingdomsAction } from '@boardgametime/game-kingdoms';
import { DungeonsDiceDangerGameEngine, DungeonsDiceDangerAction } from '@boardgametime/game-dungeons-dice-danger';
import { MatchDTO, MatchEventDTO, MatchChatMessageDTO } from '@boardgametime/types';
import { verifyToken } from '../services/authService';
import { presenceManager } from '../services/presenceManager';
import { notifyNextPlayerIfInactive } from '../services/notificationService';
import { mapMatchToDTO } from '../routes/matchRoutes';

let ioInstance: Server | null = null;
const kingdomsEngine = new KingdomsGameEngine();
const dungeonsDiceDangerEngine = new DungeonsDiceDangerGameEngine();

export function initSocketServer(httpServer: HttpServer): Server {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://boardgameti.me',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
  ];

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        try {
          const hostname = new URL(origin).hostname;
          if (
            hostname === 'boardgameti.me' ||
            hostname.endsWith('.boardgameti.me') ||
            hostname.endsWith('.run.app') ||
            hostname.endsWith('.appspot.com')
          ) {
            return callback(null, true);
          }
        } catch {
          // invalid origin format
        }
        return callback(null, false);
      },
      methods: ['GET', 'POST'],
    },
  });

  ioInstance = io;

  // Socket Authentication Middleware
  io.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization
        ? socket.handshake.headers.authorization.replace('Bearer ', '')
        : null);

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyToken(token);
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // Lobbies Namespace
  const lobbiesNs = io.of('/lobbies');
  lobbiesNs.on('connection', (socket: Socket) => {
    socket.on('join_room', (lobbyId: string) => {
      socket.join(lobbyId);
    });

    socket.on('leave_room', (lobbyId: string) => {
      socket.leave(lobbyId);
    });
  });

  // Matches Namespace
  const matchesNs = io.of('/matches');
  matchesNs.on('connection', (socket: Socket) => {
    const authUser = (socket as any).user;
    const userId = authUser?.sub;

    if (userId) {
      presenceManager.registerSocket(userId, socket.id);
    }

    socket.on('join_match', (matchId: string) => {
      socket.join(matchId);
      if (userId) {
        presenceManager.joinMatchRoom(userId, matchId, socket.id);
      }
    });

    socket.on('leave_match', (matchId: string) => {
      socket.leave(matchId);
      if (userId) {
        presenceManager.leaveMatchRoom(userId, matchId, socket.id);
      }
    });

    socket.on('disconnect', () => {
      if (userId) {
        presenceManager.unregisterSocket(userId, socket.id);
      }
    });

    socket.on('send_chat_message', async (data: { matchId: string; text: string }) => {
      const { matchId, text } = data || {};
      if (!userId) {
        socket.emit('error', { message: 'Unauthorized connection' });
        return;
      }

      if (!text || typeof text !== 'string' || !text.trim()) {
        socket.emit('error', { message: 'Message text is required.' });
        return;
      }

      try {
        const match = await prisma.match.findUnique({
          where: { id: matchId },
          include: { players: true },
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const isPlayerInMatch = match.players.some((p) => p.userId === userId);
        if (!isPlayerInMatch) {
          socket.emit('error', { message: 'Forbidden. Player is not in this match.' });
          return;
        }

        const trimmedText = text.trim().slice(0, 500);

        const messageRecord = await prisma.matchChatMessage.create({
          data: {
            matchId,
            senderId: userId,
            text: trimmedText,
          },
          include: { sender: true },
        });

        const chatMessageDto: MatchChatMessageDTO = {
          id: messageRecord.id,
          matchId: messageRecord.matchId,
          senderId: messageRecord.senderId,
          senderUsername: messageRecord.sender.username,
          senderAvatarUrl: messageRecord.sender.avatarUrl,
          text: messageRecord.text,
          createdAt: messageRecord.createdAt.toISOString(),
        };

        matchesNs.to(matchId).emit('chat_message', chatMessageDto);
      } catch (err: any) {
        socket.emit('error', { message: err.message || 'Error sending chat message' });
      }
    });

    socket.on('game_action', async (data: { matchId: string; actionType: string; actionPayload: unknown }) => {
      const { matchId, actionType, actionPayload } = data;
      if (!userId) {
        socket.emit('error', { message: 'Unauthorized connection' });
        return;
      }

      const actingUserId = userId;

      try {
        const match = await prisma.match.findUnique({
          where: { id: matchId },
          include: { players: { include: { user: true } } },
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const isPlayerInMatch = match.players.some((p) => p.userId === actingUserId);
        if (!isPlayerInMatch) {
          socket.emit('error', { message: 'Forbidden. Player is not in this match.' });
          return;
        }

        const currentState = match.stateSnapshot as any;
        let newState: any;
        let turnStartSnapshotToSave: any = match.turnStartStateSnapshot;

        if (actionType === 'CANCEL_TURN') {
          if (match.turnStartStateSnapshot) {
            if (match.gameId === 'kingdoms') {
              const result = kingdomsEngine.applyAction(currentState, { type: 'CANCEL_TURN', playerId: actingUserId });
              newState = result.newState;
              if (!newState.pendingDrawnTile) {
                turnStartSnapshotToSave = null;
              }
            } else if (match.gameId === 'dungeons-dice-danger') {
              const result = dungeonsDiceDangerEngine.applyAction(currentState, { type: 'CANCEL_TURN', playerId: actingUserId });
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
              playerId: actingUserId,
              ...(typeof actionPayload === 'object' && actionPayload !== null ? actionPayload : {}),
            } as KingdomsAction;

            const result = kingdomsEngine.applyAction(currentState, action);
            newState = result.newState;
          } else if (match.gameId === 'dungeons-dice-danger') {
            const action: DungeonsDiceDangerAction = {
              type: actionType as any,
              playerId: actingUserId,
              ...(typeof actionPayload === 'object' && actionPayload !== null ? actionPayload : {}),
            } as DungeonsDiceDangerAction;

            const result = dungeonsDiceDangerEngine.applyAction(currentState, action);
            newState = result.newState;
          } else {
            newState = { ...currentState };
          }

          if (actionType === 'CONFIRM_TURN') {
            turnStartSnapshotToSave = null;
          } else if (!turnStartSnapshotToSave && actionType !== 'PASS') {
            turnStartSnapshotToSave = currentState;
          }
        }

        // Get count of existing events
        const eventCount = await prisma.matchEvent.count({ where: { matchId } });
        const sequenceNum = eventCount + 1;

        // Perform DB transaction
        const [eventRecord, updatedMatch] = await prisma.$transaction([
          prisma.matchEvent.create({
            data: {
              matchId,
              sequenceNum,
              playerId: actingUserId,
              actionType,
              actionPayload: actionPayload as any,
            },
          }),
          prisma.match.update({
            where: { id: matchId },
            data: {
              stateSnapshot: newState as any,
              turnStartStateSnapshot: turnStartSnapshotToSave as any,
              currentTurnPlayerId: newState.activePlayerId || null,
              status: newState.isComplete ? 'COMPLETED' : 'IN_PROGRESS',
            },
            include: { players: { include: { user: true } } },
          }),
        ]);

        const matchEventDto: MatchEventDTO = {
          id: eventRecord.id.toString(),
          matchId,
          sequenceNum: eventRecord.sequenceNum,
          playerId: eventRecord.playerId,
          actionType: eventRecord.actionType,
          actionPayload: eventRecord.actionPayload,
          createdAt: eventRecord.createdAt.toISOString(),
        };

        const matchDto = mapMatchToDTO(updatedMatch, actingUserId);

        matchesNs.to(matchId).emit('action_applied', matchEventDto);
        matchesNs.to(matchId).emit('match_updated', matchDto);

        // Trigger email notification check for inactive turn player
        if (updatedMatch.currentTurnPlayerId && updatedMatch.currentTurnPlayerId !== actingUserId) {
          notifyNextPlayerIfInactive(matchId, updatedMatch.currentTurnPlayerId).catch((err) => {
            console.error('[SocketServer] Turn email notification error:', err);
          });
        }
      } catch (err: any) {
        socket.emit('error', { message: err.message || 'Error processing action' });
      }
    });
  });

  return io;
}

export function getSocketServer(): Server | null {
  return ioInstance;
}
