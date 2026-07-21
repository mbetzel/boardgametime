import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@boardgametime/db';
import { RegisterRequest, LoginRequest, AuthResponse, UserDTO } from '@boardgametime/types';
import { hashPassword, comparePassword, signToken, verifyToken } from '../services/authService';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) => {
    const { username, email, password, avatarUrl } = request.body || {};

    if (!username || !email || !password) {
      return reply.status(400).send({ message: 'Username, email, and password are required.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return reply.status(409).send({ message: 'User with this email or username already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        avatarUrl,
      },
    });

    const userDto: UserDTO = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    const token = signToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    const response: AuthResponse = {
      user: userDto,
      token,
    };

    return reply.status(201).send(response);
  });

  fastify.post('/login', async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return reply.status(400).send({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return reply.status(401).send({ message: 'Invalid credentials.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return reply.status(401).send({ message: 'Invalid credentials.' });
    }

    const userDto: UserDTO = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    const token = signToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    const response: AuthResponse = {
      user: userDto,
      token,
    };

    return reply.send(response);
  });

  fastify.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Missing or invalid authorization header.' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        return reply.status(404).send({ message: 'User not found.' });
      }

      const userDto: UserDTO = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };

      return reply.send(userDto);
    } catch {
      return reply.status(401).send({ message: 'Invalid token.' });
    }
  });
}
