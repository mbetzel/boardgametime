import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@boardgametime/db';
import { RegisterRequest, LoginRequest, AuthResponse, UserDTO, UpdateEmailRequest, UpdatePasswordRequest, UpdateEmailPreferencesRequest } from '@boardgametime/types';
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
      authProvider: 'credentials',
      isOAuth: false,
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
    const identifier = email || (request.body as any)?.username;

    if (!identifier || !password) {
      return reply.status(400).send({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
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
      authProvider: 'credentials',
      isOAuth: false,
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
        gameTurnReminders: user.gameTurnReminders,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        authProvider: user.passwordHash ? 'credentials' : 'google',
        isOAuth: !user.passwordHash,
        preferences: {
          gameTurnReminders: user.gameTurnReminders,
          matchUpdates: true,
          newsletter: false,
        },
      };

      return reply.send(userDto);
    } catch {
      return reply.status(401).send({ message: 'Invalid token.' });
    }
  });

  fastify.get('/preferences', async (request: FastifyRequest, reply: FastifyReply) => {
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

      return reply.send({
        gameTurnReminders: user.gameTurnReminders,
        matchUpdates: true,
        newsletter: false,
      });
    } catch {
      return reply.status(401).send({ message: 'Invalid token.' });
    }
  });

  fastify.put('/preferences', async (request: FastifyRequest<{ Body: UpdateEmailPreferencesRequest }>, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Missing or invalid authorization header.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return reply.status(401).send({ message: 'Invalid token.' });
    }

    const { gameTurnReminders } = request.body || {};

    const updatedUser = await prisma.user.update({
      where: { id: decoded.sub },
      data: {
        ...(typeof gameTurnReminders === 'boolean' ? { gameTurnReminders } : {}),
      },
    });

    return reply.send({
      gameTurnReminders: updatedUser.gameTurnReminders,
      matchUpdates: true,
      newsletter: false,
    });
  });

  fastify.put('/email', async (request: FastifyRequest<{ Body: UpdateEmailRequest }>, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Missing or invalid authorization header.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return reply.status(401).send({ message: 'Invalid token.' });
    }

    const { email } = request.body || {};
    if (!email || !email.includes('@')) {
      return reply.status(400).send({ message: 'A valid email address is required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== decoded.sub) {
      return reply.status(409).send({ message: 'An account with this email already exists.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.sub },
      data: { email },
    });

    const userDto: UserDTO = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
      authProvider: updatedUser.passwordHash ? 'credentials' : 'google',
      isOAuth: !updatedUser.passwordHash,
    };

    return reply.send(userDto);
  });

  fastify.put('/password', async (request: FastifyRequest<{ Body: UpdatePasswordRequest }>, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Missing or invalid authorization header.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return reply.status(401).send({ message: 'Invalid token.' });
    }

    const { currentPassword, newPassword } = request.body || {};
    if (!newPassword || newPassword.length < 6) {
      return reply.status(400).send({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      return reply.status(404).send({ message: 'User not found.' });
    }

    if (!user.passwordHash) {
      return reply.status(400).send({ message: 'Password changes are not applicable for Google / OAuth login accounts.' });
    }

    if (currentPassword) {
      const isMatch = await comparePassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return reply.status(401).send({ message: 'Current password is incorrect.' });
      }
    }

    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: decoded.sub },
      data: { passwordHash: newPasswordHash },
    });

    return reply.send({ message: 'Password updated successfully.' });
  });
}
