import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@boardgametime/db';
import { AdminStatsDTO, SystemHealthDTO } from '@boardgametime/types';
import { verifyToken } from '../services/authService';
import { presenceManager } from '../services/presenceManager';

export async function adminRoutes(fastify: FastifyInstance) {
  // Pre-handler hook / helper to verify admin role
  const verifyAdminRole = async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.status(401).send({ message: 'Missing or invalid authorization header.' });
      return null;
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        reply.status(404).send({ message: 'User not found.' });
        return null;
      }

      if (user.role !== 'ADMIN') {
        reply.status(403).send({ message: 'Forbidden: Admin privilege required.' });
        return null;
      }

      return user;
    } catch {
      reply.status(401).send({ message: 'Invalid or expired token.' });
      return null;
    }
  };

  fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    const adminUser = await verifyAdminRole(request, reply);
    if (!adminUser) return;

    // Database Latency & Health Check
    let dbStatus: 'connected' | 'disconnected' = 'connected';
    let dbLatencyMs = 0;
    const dbStartTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStartTime;
    } catch {
      dbStatus = 'disconnected';
      dbLatencyMs = -1;
    }

    // Parallel metric queries
    const [
      activeGames,
      completedGames,
      abandonedGames,
      totalUserAccounts,
      totalLobbies,
      waitingLobbies,
      totalMatchEvents,
    ] = await Promise.all([
      prisma.match.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.match.count({ where: { status: 'COMPLETED' } }),
      prisma.match.count({ where: { status: 'ABANDONED' } }),
      prisma.user.count(),
      prisma.lobby.count(),
      prisma.lobby.count({ where: { status: 'WAITING' } }),
      prisma.matchEvent.count(),
    ]);

    const mem = process.memoryUsage();
    const memoryUsageMb = {
      rss: Math.round(mem.rss / (1024 * 1024) * 100) / 100,
      heapTotal: Math.round(mem.heapTotal / (1024 * 1024) * 100) / 100,
      heapUsed: Math.round(mem.heapUsed / (1024 * 1024) * 100) / 100,
    };

    const systemHealth: SystemHealthDTO = {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb,
      databaseStatus: dbStatus,
      databaseLatencyMs: Math.max(0, dbLatencyMs),
      timestamp: new Date().toISOString(),
    };

    const stats: AdminStatsDTO = {
      activeGames,
      completedGames,
      abandonedGames,
      totalUserAccounts,
      activeUsers: presenceManager.getConnectedUserCount(),
      totalLobbies,
      waitingLobbies,
      totalMatchEvents,
      systemHealth,
    };

    return reply.send(stats);
  });

  // GET /api/admin/users - List users with online status
  fastify.get('/users', async (request: FastifyRequest<{ Querystring: { online?: string } }>, reply: FastifyReply) => {
    const adminUser = await verifyAdminRole(request, reply);
    if (!adminUser) return;

    const { online } = request.query || {};
    const onlineOnly = online === 'true' || online === '1';

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        gameTurnReminders: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const userDetails = users
      .map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: (u.role as any) || 'USER',
        avatarUrl: u.avatarUrl,
        isOnline: presenceManager.isUserConnected(u.id),
        gameTurnReminders: u.gameTurnReminders,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      }))
      .filter((u) => (!onlineOnly || u.isOnline));

    return reply.send(userDetails);
  });

  // GET /api/admin/matches - Detailed list of matches
  fastify.get('/matches', async (request: FastifyRequest<{ Querystring: { status?: string } }>, reply: FastifyReply) => {
    const adminUser = await verifyAdminRole(request, reply);
    if (!adminUser) return;

    const { status } = request.query || {};
    const whereCondition = status ? { status } : {};

    const matches = await prisma.match.findMany({
      where: whereCondition,
      orderBy: { updatedAt: 'desc' },
      include: {
        players: {
          include: {
            user: {
              select: { username: true, avatarUrl: true },
            },
          },
          orderBy: { seatIndex: 'asc' },
        },
      },
    });

    const matchDetails = matches.map((m) => ({
      id: m.id,
      gameId: m.gameId,
      mode: m.mode as any,
      status: m.status as any,
      currentTurnPlayerId: m.currentTurnPlayerId,
      players: m.players.map((p) => ({
        userId: p.userId,
        username: p.user.username,
        seatIndex: p.seatIndex,
        avatarUrl: p.user.avatarUrl,
      })),
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));

    return reply.send(matchDetails);
  });

  // GET /api/admin/lobbies - Detailed list of lobbies
  fastify.get('/lobbies', async (request: FastifyRequest<{ Querystring: { status?: string } }>, reply: FastifyReply) => {
    const adminUser = await verifyAdminRole(request, reply);
    if (!adminUser) return;

    const { status } = request.query || {};
    const whereCondition = status ? { status } : {};

    const lobbies = await prisma.lobby.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        host: {
          select: { username: true },
        },
        _count: {
          select: { players: true },
        },
      },
    });

    const lobbyDetails = lobbies.map((l) => ({
      id: l.id,
      code: l.code,
      gameId: l.gameId,
      mode: l.mode as any,
      visibility: l.visibility as any,
      status: l.status as any,
      hostId: l.hostId,
      hostUsername: l.host.username,
      playersCount: l._count.players,
      maxPlayers: l.maxPlayers,
      minPlayers: l.minPlayers,
      createdAt: l.createdAt.toISOString(),
    }));

    return reply.send(lobbyDetails);
  });

  // GET /api/admin/events - Recent game action logs
  fastify.get('/events', async (request: FastifyRequest, reply: FastifyReply) => {
    const adminUser = await verifyAdminRole(request, reply);
    if (!adminUser) return;

    const events = await prisma.matchEvent.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        player: {
          select: { username: true },
        },
      },
    });

    const eventDetails = events.map((e) => ({
      id: typeof e.id === 'bigint' ? e.id.toString() : e.id,
      matchId: e.matchId,
      sequenceNum: e.sequenceNum,
      playerId: e.playerId,
      playerUsername: e.player.username,
      actionType: e.actionType,
      actionPayload: e.actionPayload,
      createdAt: e.createdAt.toISOString(),
    }));

    return reply.send(eventDetails);
  });
}
