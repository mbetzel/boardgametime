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
}
