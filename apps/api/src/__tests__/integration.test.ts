import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildApp } from '../server';
import { FastifyInstance } from 'fastify';
import { prisma } from '@boardgametime/db';
import { hashPassword } from '../services/authService';
import { KingdomsGameEngine } from '@boardgametime/game-kingdoms';

describe('API Integration Workflows', () => {
  let app: FastifyInstance;
  let userToken: string;
  let userId: string;
  let lobbyId: string;
  let matchId: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. User Registration - POST /api/auth/register', async () => {
    const mockUser = {
      id: 'usr-alice-123',
      username: 'integration_alice',
      email: 'alice_int@example.com',
      passwordHash: 'hashed_password_123',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(null);
    vi.spyOn(prisma.user, 'create').mockResolvedValueOnce(mockUser as any);

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        username: 'integration_alice',
        email: 'alice_int@example.com',
        password: 'Password123!',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('token');
    expect(body.user.username).toBe('integration_alice');
    expect(body.user.email).toBe('alice_int@example.com');

    userToken = body.token;
    userId = body.user.id;
  });

  it('2. User Login - POST /api/auth/login', async () => {
    const password = 'Password123!';
    const passwordHash = await hashPassword(password);

    const mockUser = {
      id: 'usr-alice-123',
      username: 'integration_alice',
      email: 'alice_int@example.com',
      passwordHash,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(mockUser as any);

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'alice_int@example.com',
        password: 'Password123!',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('token');
    expect(body.user.id).toBe('usr-alice-123');
  });

  it('3. Lobby Creation - POST /api/lobbies', async () => {
    const mockLobby = {
      id: 'lby-kingdoms-01',
      code: 'KING01',
      gameId: 'kingdoms',
      hostId: userId || 'usr-alice-123',
      mode: 'REALTIME',
      visibility: 'PUBLIC',
      status: 'WAITING',
      minPlayers: 2,
      maxPlayers: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [
        {
          id: 'lp-1',
          lobbyId: 'lby-kingdoms-01',
          userId: userId || 'usr-alice-123',
          isReady: true,
          joinedAt: new Date(),
          user: {
            id: userId || 'usr-alice-123',
            username: 'integration_alice',
            avatarUrl: null,
          },
        },
      ],
    };

    vi.spyOn(prisma.lobby, 'create').mockResolvedValueOnce(mockLobby as any);

    const res = await app.inject({
      method: 'POST',
      url: '/api/lobbies',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      payload: {
        gameId: 'kingdoms',
        mode: 'REALTIME',
        visibility: 'PUBLIC',
        maxPlayers: 4,
        minPlayers: 2,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.id).toBe('lby-kingdoms-01');
    expect(body.gameId).toBe('kingdoms');
    expect(body.hostId).toBe(userId || 'usr-alice-123');

    lobbyId = body.id;
  });

  it('4. Match Start - POST /api/lobbies/:id/start', async () => {
    const mockLobby = {
      id: lobbyId || 'lby-kingdoms-01',
      code: 'KING01',
      gameId: 'kingdoms',
      hostId: userId || 'usr-alice-123',
      mode: 'REALTIME',
      visibility: 'PUBLIC',
      status: 'WAITING',
      minPlayers: 2,
      maxPlayers: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [
        {
          id: 'lp-1',
          lobbyId: lobbyId || 'lby-kingdoms-01',
          userId: userId || 'usr-alice-123',
          isReady: true,
          joinedAt: new Date(),
          user: { id: userId || 'usr-alice-123', username: 'integration_alice', avatarUrl: null },
        },
        {
          id: 'lp-2',
          lobbyId: lobbyId || 'lby-kingdoms-01',
          userId: 'usr-bob-456',
          isReady: true,
          joinedAt: new Date(),
          user: { id: 'usr-bob-456', username: 'integration_bob', avatarUrl: null },
        },
      ],
    };

    const kingdomsEngine = new KingdomsGameEngine();
    const initialState = kingdomsEngine.createInitialState([userId || 'usr-alice-123', 'usr-bob-456']);

    const mockMatch = {
      id: 'match-123-abc',
      gameId: 'kingdoms',
      mode: 'REALTIME',
      status: 'IN_PROGRESS',
      currentTurnPlayerId: userId || 'usr-alice-123',
      stateSnapshot: initialState,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [
        {
          id: 'mp-1',
          matchId: 'match-123-abc',
          userId: userId || 'usr-alice-123',
          seatIndex: 0,
          user: { id: userId || 'usr-alice-123', username: 'integration_alice', avatarUrl: null },
        },
        {
          id: 'mp-2',
          matchId: 'match-123-abc',
          userId: 'usr-bob-456',
          seatIndex: 1,
          user: { id: 'usr-bob-456', username: 'integration_bob', avatarUrl: null },
        },
      ],
    };

    const mockUpdatedLobby = { ...mockLobby, status: 'IN_GAME' };

    vi.spyOn(prisma.lobby, 'findUnique')
      .mockResolvedValueOnce(mockLobby as any)
      .mockResolvedValueOnce(mockUpdatedLobby as any);
    vi.spyOn(prisma.match, 'create').mockResolvedValueOnce(mockMatch as any);
    vi.spyOn(prisma.lobby, 'update').mockResolvedValueOnce(mockUpdatedLobby as any);

    const res = await app.inject({
      method: 'POST',
      url: `/api/lobbies/${lobbyId || 'lby-kingdoms-01'}/start`,
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('matchId');
    expect(body.match.status).toBe('IN_PROGRESS');

    matchId = body.matchId;
  });

  it('5. Turn Action Submission - POST /api/matches/:id/action', async () => {
    const kingdomsEngine = new KingdomsGameEngine();
    const initialState = kingdomsEngine.createInitialState([userId || 'usr-alice-123', 'usr-bob-456']);

    const mockMatch = {
      id: matchId || 'match-123-abc',
      gameId: 'kingdoms',
      mode: 'REALTIME',
      status: 'IN_PROGRESS',
      currentTurnPlayerId: userId || 'usr-alice-123',
      stateSnapshot: initialState,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [
        {
          id: 'mp-1',
          matchId: matchId || 'match-123-abc',
          userId: userId || 'usr-alice-123',
          seatIndex: 0,
          user: { id: userId || 'usr-alice-123', username: 'integration_alice', avatarUrl: null },
        },
        {
          id: 'mp-2',
          matchId: matchId || 'match-123-abc',
          userId: 'usr-bob-456',
          seatIndex: 1,
          user: { id: 'usr-bob-456', username: 'integration_bob', avatarUrl: null },
        },
      ],
    };

    const mockEventRecord = {
      id: BigInt(1),
      matchId: matchId || 'match-123-abc',
      sequenceNum: 1,
      playerId: userId || 'usr-alice-123',
      actionType: 'PLACE_CASTLE',
      actionPayload: { row: 0, col: 0, rank: 1 },
      createdAt: new Date(),
    };

    const actionResult = kingdomsEngine.applyAction(initialState, {
      type: 'PLACE_CASTLE',
      playerId: userId || 'usr-alice-123',
      row: 0,
      col: 0,
      rank: 1,
    });

    const mockUpdatedMatch = {
      ...mockMatch,
      stateSnapshot: actionResult.newState,
      currentTurnPlayerId: actionResult.newState.activePlayerId,
    };

    vi.spyOn(prisma.match, 'findUnique').mockResolvedValueOnce(mockMatch as any);
    vi.spyOn(prisma.matchEvent, 'count').mockResolvedValueOnce(0);
    vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([mockEventRecord, mockUpdatedMatch] as any);

    const res = await app.inject({
      method: 'POST',
      url: `/api/matches/${matchId || 'match-123-abc'}/action`,
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      payload: {
        actionType: 'PLACE_CASTLE',
        actionPayload: {
          row: 0,
          col: 0,
          rank: 1,
        },
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.id).toBe(matchId || 'match-123-abc');
    expect(body.status).toBe('IN_PROGRESS');
  });

  it('6. User Active Matches - GET /api/matches', async () => {
    const mockMatch = {
      id: matchId || 'match-123-abc',
      gameId: 'kingdoms',
      mode: 'REALTIME',
      status: 'IN_PROGRESS',
      currentTurnPlayerId: userId || 'usr-alice-123',
      stateSnapshot: { epoch: 1 },
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [
        {
          id: 'mp-1',
          matchId: matchId || 'match-123-abc',
          userId: userId || 'usr-alice-123',
          seatIndex: 0,
          user: { id: userId || 'usr-alice-123', username: 'integration_alice', avatarUrl: null },
        },
      ],
    };

    const findManySpy = vi.spyOn(prisma.match, 'findMany').mockResolvedValue([mockMatch] as any);

    const res = await app.inject({
      method: 'GET',
      url: '/api/matches',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].id).toBe(matchId || 'match-123-abc');
    expect(body[0].players[0].username).toBe('integration_alice');
    expect(findManySpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'IN_PROGRESS' }),
      })
    );

    await app.inject({
      method: 'GET',
      url: '/api/matches?status=ALL',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    expect(findManySpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({ status: expect.anything() }),
      })
    );
  });
});
