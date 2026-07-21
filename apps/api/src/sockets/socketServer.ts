import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { prisma } from '@boardgametime/db';
import { KingdomsGameEngine, KingdomsAction } from '@boardgametime/game-kingdoms';
import { MatchDTO, MatchEventDTO } from '@boardgametime/types';

let ioInstance: Server | null = null;
const kingdomsEngine = new KingdomsGameEngine();

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance = io;

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
    socket.on('join_match', (matchId: string) => {
      socket.join(matchId);
    });

    socket.on('leave_match', (matchId: string) => {
      socket.leave(matchId);
    });

    socket.on('game_action', async (data: { matchId: string; actionType: string; actionPayload: unknown; userId?: string }) => {
      const { matchId, actionType, actionPayload, userId } = data;
      try {
        const match = await prisma.match.findUnique({
          where: { id: matchId },
          include: { players: { include: { user: true } } },
        });

        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        const actingUserId = userId || match.currentTurnPlayerId;
        if (!actingUserId) {
          socket.emit('error', { message: 'Invalid player for turn' });
          return;
        }

        const currentState = match.stateSnapshot as any;
        const action: KingdomsAction = {
          type: actionType as any,
          playerId: actingUserId,
          ...(typeof actionPayload === 'object' && actionPayload !== null ? actionPayload : {}),
        } as KingdomsAction;

        const { newState } = kingdomsEngine.applyAction(currentState, action);

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

        const matchDto: MatchDTO = {
          id: updatedMatch.id,
          gameId: updatedMatch.gameId,
          mode: updatedMatch.mode as any,
          status: updatedMatch.status as any,
          currentTurnPlayerId: updatedMatch.currentTurnPlayerId,
          stateSnapshot: updatedMatch.stateSnapshot,
          players: updatedMatch.players.map((p) => ({
            id: p.id,
            matchId: p.matchId,
            userId: p.userId,
            username: p.user.username,
            seatIndex: p.seatIndex,
            avatarUrl: p.user.avatarUrl,
          })),
          createdAt: updatedMatch.createdAt.toISOString(),
          updatedAt: updatedMatch.updatedAt.toISOString(),
        };

        matchesNs.to(matchId).emit('action_applied', matchEventDto);
        matchesNs.to(matchId).emit('match_updated', matchDto);
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
