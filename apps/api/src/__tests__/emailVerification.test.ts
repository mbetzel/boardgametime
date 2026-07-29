import { describe, it, expect, beforeEach, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { prisma } from '@boardgametime/db';
import { authRoutes } from '../routes/authRoutes';
import * as emailService from '../services/emailService';

describe('Email Verification Flow & Account Security', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.ready();

    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['verify_test@example.com', 'resend_test@example.com', 'expired_test@example.com'],
        },
      },
    });
  });

  it('1. Registration creates an unverified user with verification token and sends email', async () => {
    const spySendVerification = vi.spyOn(emailService, 'sendVerificationEmail');

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

    // Verify DB state
    const createdUser = await prisma.user.findUnique({
      where: { email: 'verify_test@example.com' },
    });
    expect(createdUser).not.toBeNull();
    expect(createdUser?.isEmailVerified).toBe(false);
    expect(createdUser?.emailVerificationToken).toBeTruthy();
    expect(createdUser?.emailVerificationExpires).toBeTruthy();

    expect(spySendVerification).toHaveBeenCalledWith({
      to: 'verify_test@example.com',
      username: 'verify_user_01',
      token: createdUser?.emailVerificationToken,
    });
  });

  it('2. Unverified user login is rejected with 403 Forbidden', async () => {
    // Create unverified user
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        username: 'verify_user_01',
        email: 'verify_test@example.com',
        password: 'Password123!',
      },
    });

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
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        username: 'verify_user_01',
        email: 'verify_test@example.com',
        password: 'Password123!',
      },
    });

    const userBefore = await prisma.user.findUnique({
      where: { email: 'verify_test@example.com' },
    });
    const token = userBefore?.emailVerificationToken;
    expect(token).toBeTruthy();

    const verifyRes = await app.inject({
      method: 'GET',
      url: `/api/auth/verify-email?token=${token}`,
    });

    expect(verifyRes.statusCode).toBe(200);
    const body = JSON.parse(verifyRes.body);
    expect(body.success).toBe(true);
    expect(body.token).toBeTruthy(); // Issued session token
    expect(body.user.isEmailVerified).toBe(true);

    // Verify DB update
    const userAfter = await prisma.user.findUnique({
      where: { email: 'verify_test@example.com' },
    });
    expect(userAfter?.isEmailVerified).toBe(true);
    expect(userAfter?.emailVerificationToken).toBeNull();
    expect(userAfter?.emailVerificationExpires).toBeNull();

    // Now login should succeed cleanly!
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'verify_test@example.com',
        password: 'Password123!',
      },
    });
    expect(loginRes.statusCode).toBe(200);
  });

  it('4. Resend verification invalidates old token and sends new token', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        username: 'resend_user_01',
        email: 'resend_test@example.com',
        password: 'Password123!',
      },
    });

    const initialUser = await prisma.user.findUnique({
      where: { email: 'resend_test@example.com' },
    });
    const oldToken = initialUser?.emailVerificationToken;

    const resendRes = await app.inject({
      method: 'POST',
      url: '/api/auth/resend-verification',
      payload: {
        email: 'resend_test@example.com',
      },
    });

    expect(resendRes.statusCode).toBe(200);

    const updatedUser = await prisma.user.findUnique({
      where: { email: 'resend_test@example.com' },
    });
    const newToken = updatedUser?.emailVerificationToken;

    expect(newToken).toBeTruthy();
    expect(newToken).not.toBe(oldToken);

    // Trying old token should now fail
    const oldTokenRes = await app.inject({
      method: 'GET',
      url: `/api/auth/verify-email?token=${oldToken}`,
    });
    expect(oldTokenRes.statusCode).toBe(400);

    // Trying new token should succeed
    const newTokenRes = await app.inject({
      method: 'GET',
      url: `/api/auth/verify-email?token=${newToken}`,
    });
    expect(newTokenRes.statusCode).toBe(200);
  });

  it('5. Re-registering an unverified account (abandoned signup) refreshes token and updates password', async () => {
    // Initial abandoned registration
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        username: 'verify_user_01',
        email: 'verify_test@example.com',
        password: 'OldPassword123!',
      },
    });

    const user1 = await prisma.user.findUnique({
      where: { email: 'verify_test@example.com' },
    });
    const token1 = user1?.emailVerificationToken;

    // Second registration attempt with same email
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

    const user2 = await prisma.user.findUnique({
      where: { email: 'verify_test@example.com' },
    });
    expect(user2?.emailVerificationToken).not.toBe(token1);

    // Verify using new token
    await app.inject({
      method: 'GET',
      url: `/api/auth/verify-email?token=${user2?.emailVerificationToken}`,
    });

    // Login with new password should work
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'verify_test@example.com',
        password: 'NewPassword123!',
      },
    });
    expect(loginRes.statusCode).toBe(200);
  });

  it('6. Expired verification token is rejected', async () => {
    await prisma.user.create({
      data: {
        username: 'expired_user',
        email: 'expired_test@example.com',
        passwordHash: 'hash',
        isEmailVerified: false,
        emailVerificationToken: 'expired_token_123',
        emailVerificationExpires: new Date(Date.now() - 3600000), // 1 hour in past
      },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/verify-email?token=expired_token_123',
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.message).toContain('expired');
  });
});
