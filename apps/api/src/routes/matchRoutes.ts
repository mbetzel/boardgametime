import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@boardgametime/db';
import { SubmitActionRequest, MatchDTO, MatchEventDTO, PlayMode, MatchStatus } from '@boardgametime/types';
import { KingdomsGameEngine, KingdomsAction } from '@boardgametime/game-kingdoms';
import { verifyToken } from '../services/authService';
import { getSocketServer } from '../sockets/socketServer';

const kingdomsEngine = new KingdomsGameEngine();

function getAuthUser(request: FastifyRequest) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

function mapMatchToDTO(match: any): MatchDTO {
  return {
    id: match.id,
    gameId: match.gameId,
    mode: match.mode as PlayMode,
    status: match.status as MatchStatus,
    currentTurnPlayerId: match.currentTurnPlayerId,
    stateSnapshot: match.stateSnapshot,
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
  // Get active matches for current user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    let auth;
    try {
      auth = getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const matches = await prisma.match.findMany({
      where: {
        status: 'IN_PROGRESS',
        players: {
          some: {
            userId: auth.sub,
          },
        },
      },
      include: {
        players: {
          include: { user: true },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return reply.send(matches.map(mapMatchToDTO));
  });

  // Get match state
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      getAuthUser(request);
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

    return reply.send(mapMatchToDTO(match));
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
    } else {
      newState = { ...currentState };
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

    const matchDto = mapMatchToDTO(updatedMatch);

    const io = getSocketServer();
    if (io) {
      io.of('/matches').to(id).emit('action_applied', eventDto);
      io.of('/matches').to(id).emit('match_updated', matchDto);
    }

    return reply.send(matchDto);
  });

  // Get event log
  fastify.get('/:id/events', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { id } = request.params;
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
}
