import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildApp } from '../server';
import { FastifyInstance } from 'fastify';
import { prisma } from '@boardgametime/db';

describe('API Server Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns status ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('boardgametime-api');
  });

  it('POST /api/auth/register returns 400 for missing fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it('POST /api/auth/login returns 400 for missing fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it('GET /api/lobbies returns array of active lobbies', async () => {
    vi.spyOn(prisma.lobby, 'findMany').mockResolvedValueOnce([]);

    const response = await app.inject({
      method: 'GET',
      url: '/api/lobbies',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });
});
