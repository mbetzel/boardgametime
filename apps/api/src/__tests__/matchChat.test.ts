import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildApp } from '../server';
import { FastifyInstance } from 'fastify';
import { prisma } from '@boardgametime/db';
import { signToken } from '../services/authService';

describe('Match Chat REST & Authorization System', () => {
  let app: FastifyInstance;
  let playerToken: string;
  let nonPlayerToken: string;

  const playerUser = {
    id: 'user-player-1',
    username: 'player_one',
    email: 'player1@example.com',
  };

  const nonPlayerUser = {
    id: 'user-outsider-9',
    username: 'outsider_bill',
    email: 'outsider@example.com',
  };

  const mockMatch = {
    id: 'match-chat-test-101',
    gameId: 'kingdoms',
    mode: 'REALTIME',
    status: 'IN_PROGRESS',
    currentTurnPlayerId: 'user-player-1',
    stateSnapshot: {},
    turnStartStateSnapshot: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    players: [
      {
        id: 'mp-1',
        matchId: 'match-chat-test-101',
        userId: 'user-player-1',
        seatIndex: 0,
        user: playerUser,
      },
    ],
  };

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
    playerToken = signToken({ sub: playerUser.id, email: playerUser.email, username: playerUser.username });
    nonPlayerToken = signToken({ sub: nonPlayerUser.id, email: nonPlayerUser.email, username: nonPlayerUser.username });
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthorized access with 401 when getting messages without token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/matches/match-chat-test-101/messages',
    });

    expect(res.statusCode).toBe(401);
  });

  it('rejects non-match player with 403 Forbidden on GET /api/matches/:id/messages', async () => {
    vi.spyOn(prisma.match, 'findUnique').mockResolvedValueOnce(mockMatch as any);

    const res = await app.inject({
      method: 'GET',
      url: '/api/matches/match-chat-test-101/messages',
      headers: {
        authorization: `Bearer ${nonPlayerToken}`,
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.message).toContain('Forbidden');
  });

  it('allows match player to fetch chat messages on GET /api/matches/:id/messages', async () => {
    const mockMessages = [
      {
        id: 'msg-1',
        matchId: 'match-chat-test-101',
        senderId: 'user-player-1',
        text: 'Good luck!',
        createdAt: new Date('2026-07-29T10:00:00Z'),
        sender: playerUser,
      },
    ];

    vi.spyOn(prisma.match, 'findUnique').mockResolvedValueOnce(mockMatch as any);
    vi.spyOn(prisma.matchChatMessage, 'findMany').mockResolvedValueOnce(mockMessages as any);

    const res = await app.inject({
      method: 'GET',
      url: '/api/matches/match-chat-test-101/messages',
      headers: {
        authorization: `Bearer ${playerToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].text).toBe('Good luck!');
    expect(body[0].senderUsername).toBe('player_one');
  });

  it('rejects non-match player with 403 Forbidden on POST /api/matches/:id/messages', async () => {
    vi.spyOn(prisma.match, 'findUnique').mockResolvedValueOnce(mockMatch as any);

    const res = await app.inject({
      method: 'POST',
      url: '/api/matches/match-chat-test-101/messages',
      headers: {
        authorization: `Bearer ${nonPlayerToken}`,
      },
      payload: {
        text: 'Sneaking into chat!',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.message).toContain('Forbidden');
  });

  it('allows match player to post a message on POST /api/matches/:id/messages', async () => {
    const createdMsg = {
      id: 'msg-2',
      matchId: 'match-chat-test-101',
      senderId: 'user-player-1',
      text: 'Have fun!',
      createdAt: new Date('2026-07-29T10:05:00Z'),
      sender: playerUser,
    };

    vi.spyOn(prisma.match, 'findUnique').mockResolvedValueOnce(mockMatch as any);
    vi.spyOn(prisma.matchChatMessage, 'create').mockResolvedValueOnce(createdMsg as any);

    const res = await app.inject({
      method: 'POST',
      url: '/api/matches/match-chat-test-101/messages',
      headers: {
        authorization: `Bearer ${playerToken}`,
      },
      payload: {
        text: '  Have fun!  ',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.text).toBe('Have fun!');
    expect(body.senderUsername).toBe('player_one');
  });

  it('sanitizes script tags and HTML injections to prevent XSS attacks', async () => {
    const createdMsg = {
      id: 'msg-3',
      matchId: 'match-chat-test-101',
      senderId: 'user-player-1',
      text: '&lt;script&gt;alert(1)&lt;/script&gt;',
      createdAt: new Date(),
      sender: playerUser,
    };

    vi.spyOn(prisma.match, 'findUnique').mockResolvedValueOnce(mockMatch as any);
    (vi.spyOn(prisma.matchChatMessage, 'create') as any).mockImplementationOnce(async (args: any) => {
      expect(args.data.text).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      return createdMsg;
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/matches/match-chat-test-101/messages',
      headers: {
        authorization: `Bearer ${playerToken}`,
      },
      payload: {
        text: '<script>alert("XSS")</script>',
      },
    });

    expect(res.statusCode).toBe(201);
  });
});
