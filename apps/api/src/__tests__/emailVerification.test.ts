import { describe, it, expect, beforeEach, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { prisma } from '@boardgametime/db';
import { authRoutes } from '../routes/authRoutes';
import * as emailService from '../services/emailService';
import { hashPassword } from '../services/authService';

describe('Email Verification Flow & Account Security', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.ready();
    vi.restoreAllMocks();

    // Clean up test users safely if DB is connected
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['verify_test@example.com', 'resend_test@example.com', 'expired_test@example.com'],
        },
      },
    }).catch(() => {});
  });

  it('1. Registration creates an unverified user with verification token and sends email', async () => {
    const spySendVerification = vi.spyOn(emailService, 'sendVerificationEmail').mockResolvedValue({
      success: true,
      provider: 'test',
    });

    const mockUser = {
      id: 'verify-user-uuid-123',
      username: 'verify_user_01',
      email: 'verify_test@example.com',
      passwordHash: 'hashed_password',
      avatarUrl: null,
      role: 'USER',
      gameTurnReminders: true,
      isEmailVerified: false,
      emailVerificationToken: 'mock_verification_token_123',
      emailVerificationExpires: new Date(Date.now() + 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        username: 'verify_user_01',
        email: 'verify_test@example.com',
        password: 'Password123!',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.requiresVerification).toBe(true);
    expect(body.token).toBeUndefined(); // Should NOT issue session token prior to verification

    expect(spySendVerification).toHaveBeenCalled();
  });

  it('2. Unverified user login is rejected with 403 Forbidden', async () => {
    const passwordHash = await hashPassword('Password123!');
    const unverifiedUser = {
      id: 'verify-user-uuid-123',
      username: 'verify_user_01',
      email: 'verify_test@example.com',
      passwordHash,
      avatarUrl: null,
      role: 'USER',
      gameTurnReminders: true,
      isEmailVerified: false,
      emailVerificationToken: 'mock_token',
      emailVerificationExpires: new Date(Date.now() + 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(unverifiedUser as any);

    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'verify_test@example.com',
        password: 'Password123!',
      },
    });

    expect(loginRes.statusCode).toBe(403);
    const body = JSON.parse(loginRes.body);
    expect(body.requiresVerification).toBe(true);
    expect(body.message).toContain('not been verified');
  });

  it('3. GET /verify-email activates user and issues session JWT token', async () => {
    const unverifiedUser = {
      id: 'verify-user-uuid-123',
      username: 'verify_user_01',
      email: 'verify_test@example.com',
      passwordHash: 'hash',
      avatarUrl: null,
      role: 'USER',
      gameTurnReminders: true,
      isEmailVerified: false,
      emailVerificationToken: 'valid_token_123',
      emailVerificationExpires: new Date(Date.now() + 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const verifiedUser = {
      ...unverifiedUser,
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    };

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(unverifiedUser as any);
    vi.spyOn(prisma.user, 'update').mockResolvedValue(verifiedUser as any);

    const verifyRes = await app.inject({
      method: 'GET',
      url: '/api/auth/verify-email?token=valid_token_123',
    });

    expect(verifyRes.statusCode).toBe(200);
    const body = JSON.parse(verifyRes.body);
    expect(body.success).toBe(true);
    expect(body.token).toBeTruthy(); // Issued session token
    expect(body.user.isEmailVerified).toBe(true);
  });

  it('4. Resend verification invalidates old token and sends new token', async () => {
    const spySendVerification = vi.spyOn(emailService, 'sendVerificationEmail').mockResolvedValue({
      success: true,
      provider: 'test',
    });

    const unverifiedUser = {
      id: 'resend-user-uuid-123',
      username: 'resend_user_01',
      email: 'resend_test@example.com',
      passwordHash: 'hash',
      avatarUrl: null,
      role: 'USER',
      gameTurnReminders: true,
      isEmailVerified: false,
      emailVerificationToken: 'old_token_123',
      emailVerificationExpires: new Date(Date.now() + 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(unverifiedUser as any);
    vi.spyOn(prisma.user, 'update').mockResolvedValue({
      ...unverifiedUser,
      emailVerificationToken: 'new_token_456',
    } as any);

    const resendRes = await app.inject({
      method: 'POST',
      url: '/api/auth/resend-verification',
      payload: {
        email: 'resend_test@example.com',
      },
    });

    expect(resendRes.statusCode).toBe(200);
    const body = JSON.parse(resendRes.body);
    expect(body.success).toBe(true);
    expect(spySendVerification).toHaveBeenCalled();
  });

  it('5. Re-registering an unverified account (abandoned signup) refreshes token and updates password', async () => {
    const spySendVerification = vi.spyOn(emailService, 'sendVerificationEmail').mockResolvedValue({
      success: true,
      provider: 'test',
    });

    const existingUnverifiedUser = {
      id: 'abandoned-user-uuid-123',
      username: 'verify_user_01',
      email: 'verify_test@example.com',
      passwordHash: 'old_hash',
      avatarUrl: null,
      role: 'USER',
      gameTurnReminders: true,
      isEmailVerified: false,
      emailVerificationToken: 'old_token_123',
      emailVerificationExpires: new Date(Date.now() + 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedUser = {
      ...existingUnverifiedUser,
      emailVerificationToken: 'new_fresh_token_789',
    };

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(existingUnverifiedUser as any);
    vi.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser as any);

    const reRegisterRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        username: 'verify_user_01',
        email: 'verify_test@example.com',
        password: 'NewPassword123!',
      },
    });

    expect(reRegisterRes.statusCode).toBe(200);
    const body = JSON.parse(reRegisterRes.body);
    expect(body.requiresVerification).toBe(true);
    expect(spySendVerification).toHaveBeenCalled();
  });

  it('6. Expired verification token is rejected', async () => {
    const expiredUser = {
      id: 'expired-user-uuid-123',
      username: 'expired_user',
      email: 'expired_test@example.com',
      passwordHash: 'hash',
      role: 'USER',
      gameTurnReminders: true,
      isEmailVerified: false,
      emailVerificationToken: 'expired_token_123',
      emailVerificationExpires: new Date(Date.now() - 3600000), // 1 hour in past
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(expiredUser as any);

    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/verify-email?token=expired_token_123',
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.message).toContain('expired');
  });
});
