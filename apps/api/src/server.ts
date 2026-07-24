import Fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv';
import path from 'path';
import { authRoutes } from './routes/authRoutes';
import { lobbyRoutes } from './routes/lobbyRoutes';
import { matchRoutes } from './routes/matchRoutes';
import { initSocketServer } from './sockets/socketServer';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'boardgametime-secret-key';

export function buildApp(): FastifyInstance {
  const fastify = Fastify({ logger: true });

  // Register CORS with specific origin checker
  const defaultAllowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://boardgameti.me',
  ];

  const customAllowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [];

  const allowedOrigins = [...defaultAllowedOrigins, ...customAllowedOrigins];

  fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return cb(null, true);

      // Check explicit allowed origins list
      if (allowedOrigins.includes(origin)) return cb(null, true);

      try {
        const hostname = new URL(origin).hostname;
        // Allow subdomains of boardgameti.me and GCP Cloud Run / App Engine domains
        if (
          hostname === 'boardgameti.me' ||
          hostname.endsWith('.boardgameti.me') ||
          hostname.endsWith('.run.app') ||
          hostname.endsWith('.appspot.com')
        ) {
          return cb(null, true);
        }
      } catch {
        // invalid URL format
      }

      return cb(null, false);
    },
    credentials: true,
  });

  // Register JWT
  fastify.register(fastifyJwt, {
    secret: JWT_SECRET,
  });

  // Health check route
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'boardgametime-api', timestamp: new Date().toISOString() };
  });

  // Register REST routes
  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(lobbyRoutes, { prefix: '/api/lobbies' });
  fastify.register(matchRoutes, { prefix: '/api/matches' });

  return fastify;
}

export async function startServer() {
  const app = buildApp();
  const port = Number(process.env.PORT) || 4000;

  try {
    // Initialize Socket.IO server on underlying HTTP server
    initSocketServer(app.server);

    await app.listen({ port, host: '0.0.0.0' });
    console.log(`API Server running on port ${port}`);
    return app;
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
