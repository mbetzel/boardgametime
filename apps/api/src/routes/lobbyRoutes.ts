import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@boardgametime/db';
import {
  CreateLobbyRequest,
  JoinLobbyRequest,
  ToggleReadyRequest,
  LobbyDTO,
  PlayMode,
  LobbyVisibility,
  LobbyStatus,
} from '@boardgametime/types';
import { KingdomsGameEngine } from '@boardgametime/game-kingdoms';
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

function generateCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function mapLobbyToDTO(lobby: any): LobbyDTO {
  return {
    id: lobby.id,
    code: lobby.code,
    hostId: lobby.hostId,
    gameId: lobby.gameId,
    mode: lobby.mode as PlayMode,
    visibility: lobby.visibility as LobbyVisibility,
    status: lobby.status as LobbyStatus,
    minPlayers: lobby.minPlayers,
    maxPlayers: lobby.maxPlayers,
    players: (lobby.players || []).map((p: any) => ({
      id: p.id,
      lobbyId: p.lobbyId,
      userId: p.userId,
      username: p.user?.username || '',
      avatarUrl: p.user?.avatarUrl || null,
      isReady: p.isReady,
      joinedAt: p.joinedAt ? new Date(p.joinedAt).toISOString() : undefined,
    })),
    createdAt: lobby.createdAt.toISOString(),
    updatedAt: lobby.updatedAt ? lobby.updatedAt.toISOString() : undefined,
  };
}

export async function lobbyRoutes(fastify: FastifyInstance) {
  // List lobbies
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const lobbies = await prisma.lobby.findMany({
      where: { status: 'WAITING', visibility: 'PUBLIC' },
      include: {
        players: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const dtos = lobbies.map(mapLobbyToDTO);
    return reply.send(dtos);
  });

  // Create lobby
  fastify.post('/', async (request: FastifyRequest<{ Body: CreateLobbyRequest }>, reply: FastifyReply) => {
    let auth;
    try {
      auth = getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { gameId = 'kingdoms', mode = 'REALTIME', visibility = 'PUBLIC', maxPlayers = 4, minPlayers = 2 } =
      request.body || {};

    const code = generateCode();

    const lobby = await prisma.lobby.create({
      data: {
        code,
        gameId,
        hostId: auth.sub,
        mode,
        visibility,
        maxPlayers,
        minPlayers,
        players: {
          create: {
            userId: auth.sub,
            isReady: true,
          },
        },
      },
      include: {
        players: {
          include: { user: true },
        },
      },
    });

    const dto = mapLobbyToDTO(lobby);

    const io = getSocketServer();
    if (io) {
      io.of('/lobbies').emit('lobby_updated', dto);
    }

    return reply.status(201).send(dto);
  });

  // Join lobby
  fastify.post('/:id/join', async (request: FastifyRequest<{ Params: { id: string }; Body: JoinLobbyRequest }>, reply: FastifyReply) => {
    let auth;
    try {
      auth = getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { id } = request.params;
    const { code } = request.body || {};

    const lobby = await prisma.lobby.findUnique({
      where: { id },
      include: { players: { include: { user: true } } },
    });

    if (!lobby) {
      return reply.status(404).send({ message: 'Lobby not found.' });
    }

    if (lobby.status !== 'WAITING') {
      return reply.status(400).send({ message: 'Lobby is not open for joining.' });
    }

    if (lobby.players.length >= lobby.maxPlayers) {
      return reply.status(400).send({ message: 'Lobby is full.' });
    }

    if (lobby.visibility === 'PRIVATE' && lobby.code !== code) {
      return reply.status(403).send({ message: 'Invalid lobby code.' });
    }

    const existingPlayer = lobby.players.find((p) => p.userId === auth.sub);
    if (!existingPlayer) {
      await prisma.lobbyPlayer.create({
        data: {
          lobbyId: id,
          userId: auth.sub,
          isReady: false,
        },
      });
    }

    const updatedLobby = await prisma.lobby.findUnique({
      where: { id },
      include: { players: { include: { user: true } } },
    });

    const dto = mapLobbyToDTO(updatedLobby);

    const io = getSocketServer();
    if (io) {
      io.of('/lobbies').to(id).emit('lobby_updated', dto);
      io.of('/lobbies').emit('lobby_updated', dto);
    }

    return reply.send(dto);
  });

  // Ready toggle
  fastify.post('/:id/ready', async (request: FastifyRequest<{ Params: { id: string }; Body: ToggleReadyRequest }>, reply: FastifyReply) => {
    let auth;
    try {
      auth = getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { id } = request.params;
    const { isReady } = request.body || {};

    const lobbyPlayer = await prisma.lobbyPlayer.findUnique({
      where: {
        lobbyId_userId: {
          lobbyId: id,
          userId: auth.sub,
        },
      },
    });

    if (!lobbyPlayer) {
      return reply.status(404).send({ message: 'Player is not in this lobby.' });
    }

    await prisma.lobbyPlayer.update({
      where: { id: lobbyPlayer.id },
      data: { isReady: Boolean(isReady) },
    });

    const updatedLobby = await prisma.lobby.findUnique({
      where: { id },
      include: { players: { include: { user: true } } },
    });

    const dto = mapLobbyToDTO(updatedLobby);

    const io = getSocketServer();
    if (io) {
      io.of('/lobbies').to(id).emit('lobby_updated', dto);
    }

    return reply.send(dto);
  });

  // Start game
  fastify.post('/:id/start', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    let auth;
    try {
      auth = getAuthUser(request);
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const { id } = request.params;

    const lobby = await prisma.lobby.findUnique({
      where: { id },
      include: { players: { include: { user: true } } },
    });

    if (!lobby) {
      return reply.status(404).send({ message: 'Lobby not found.' });
    }

    if (lobby.hostId !== auth.sub) {
      return reply.status(403).send({ message: 'Only host can start the game.' });
    }

    if (lobby.status !== 'WAITING') {
      return reply.status(400).send({ message: 'Lobby has already started or ended.' });
    }

    if (lobby.players.length < lobby.minPlayers) {
      return reply.status(400).send({ message: `Need at least ${lobby.minPlayers} players to start.` });
    }

    const playerIds = lobby.players.map((p) => p.userId);
    let initialState: any;

    if (lobby.gameId === 'kingdoms') {
      initialState = kingdomsEngine.createInitialState(playerIds);
    } else {
      initialState = { playerIds, turnOrder: playerIds, activePlayerId: playerIds[0] };
    }

    // Create Match and MatchPlayers
    const match = await prisma.match.create({
      data: {
        gameId: lobby.gameId,
        mode: lobby.mode,
        status: 'IN_PROGRESS',
        currentTurnPlayerId: initialState.activePlayerId || playerIds[0],
        stateSnapshot: initialState,
        players: {
          create: lobby.players.map((p, idx) => ({
            userId: p.userId,
            seatIndex: idx,
          })),
        },
      },
      include: { players: { include: { user: true } } },
    });

    // Update lobby status to IN_GAME
    await prisma.lobby.update({
      where: { id },
      data: { status: 'IN_GAME' },
    });

    const updatedLobby = await prisma.lobby.findUnique({
      where: { id },
      include: { players: { include: { user: true } } },
    });

    const lobbyDto = mapLobbyToDTO(updatedLobby);

    const io = getSocketServer();
    if (io) {
      io.of('/lobbies').to(id).emit('lobby_updated', lobbyDto);
      io.of('/lobbies').to(id).emit('match_started', { matchId: match.id });
    }

    return reply.send({
      matchId: match.id,
      match: {
        id: match.id,
        gameId: match.gameId,
        mode: match.mode,
        status: match.status,
        currentTurnPlayerId: match.currentTurnPlayerId,
        stateSnapshot: match.stateSnapshot,
        players: match.players.map((p) => ({
          id: p.id,
          matchId: p.matchId,
          userId: p.userId,
          username: p.user.username,
          seatIndex: p.seatIndex,
          avatarUrl: p.user.avatarUrl,
        })),
        createdAt: match.createdAt.toISOString(),
        updatedAt: match.updatedAt.toISOString(),
      },
    });
  });
}
