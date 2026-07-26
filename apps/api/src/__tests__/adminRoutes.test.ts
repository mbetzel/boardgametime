import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildApp } from '../server';
import { FastifyInstance } from 'fastify';
import { signToken } from '../services/authService';
import { prisma } from '@boardgametime/db';

describe('Admin Routes Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/admin/stats returns 401 when no token is provided', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/stats',
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.message).toContain('Missing or invalid authorization header');
  });

  it('GET /api/admin/stats returns 403 when user is not an admin', async () => {
    const userToken = signToken({
      sub: 'regular-user-id',
      email: 'user@example.com',
      username: 'regularuser',
      role: 'USER',
    });

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'regular-user-id',
      username: 'regularuser',
      email: 'user@example.com',
      passwordHash: 'hash',
      avatarUrl: null,
      role: 'USER',
      gameTurnReminders: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/stats',
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });

    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.body);
    expect(body.message).toContain('Forbidden');
  });

  it('GET /api/admin/stats returns 200 with complete metrics when user is admin', async () => {
    const adminToken = signToken({
      sub: 'admin-user-id',
      email: 'admin@boardgameti.me',
      username: 'admin',
      role: 'ADMIN',
    });

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'admin-user-id',
      username: 'admin',
      email: 'admin@boardgameti.me',
      passwordHash: 'hash',
      avatarUrl: null,
      role: 'ADMIN',
      gameTurnReminders: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    vi.spyOn(prisma.match, 'count').mockResolvedValue(5 as any);
    vi.spyOn(prisma.user, 'count').mockResolvedValue(10 as any);
    vi.spyOn(prisma.lobby, 'count').mockResolvedValue(2 as any);
    vi.spyOn(prisma.matchEvent, 'count').mockResolvedValue(50 as any);
    vi.spyOn(prisma, '$queryRaw').mockResolvedValue([{ 1: 1 }] as any);

    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/stats',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('activeGames');
    expect(body).toHaveProperty('completedGames');
    expect(body).toHaveProperty('totalUserAccounts');
    expect(body).toHaveProperty('activeUsers');
    expect(body).toHaveProperty('systemHealth');
    expect(body.systemHealth).toHaveProperty('status');
    expect(body.systemHealth).toHaveProperty('memoryUsageMb');
  });

  it('GET /api/admin/users returns detailed user list for admin', async () => {
    const adminToken = signToken({
      sub: 'admin-user-id',
      email: 'admin@boardgameti.me',
      username: 'admin',
      role: 'ADMIN',
    });

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'admin-user-id',
      username: 'admin',
      email: 'admin@boardgameti.me',
      role: 'ADMIN',
    } as any);

    vi.spyOn(prisma.user, 'findMany').mockResolvedValueOnce([
      {
        id: 'admin-user-id',
        username: 'admin',
        email: 'admin@boardgameti.me',
        role: 'ADMIN',
        avatarUrl: null,
        gameTurnReminders: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as any);

    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/users',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0]).toHaveProperty('isOnline');
    expect(body[0].username).toBe('admin');
  });

  it('GET /api/admin/matches returns detailed match list for admin', async () => {
    const adminToken = signToken({
      sub: 'admin-user-id',
      email: 'admin@boardgameti.me',
      username: 'admin',
      role: 'ADMIN',
    });

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'admin-user-id',
      username: 'admin',
      email: 'admin@boardgameti.me',
      role: 'ADMIN',
    } as any);

    vi.spyOn(prisma.match, 'findMany').mockResolvedValueOnce([
      {
        id: 'match-1',
        gameId: 'kingdoms',
        mode: 'REALTIME',
        status: 'IN_PROGRESS',
        currentTurnPlayerId: 'admin-user-id',
        players: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as any);

    const response = await app.inject({
      method: 'GET',
      url: '/api/admin/matches?status=IN_PROGRESS',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].id).toBe('match-1');
  });
});
