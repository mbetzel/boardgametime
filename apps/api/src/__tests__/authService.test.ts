import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, signToken, verifyToken } from '../services/authService';

describe('authService', () => {
  it('hashes and compares passwords correctly', async () => {
    const password = 'mySecretPassword123!';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = await comparePassword('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('signs and verifies JWT tokens correctly', () => {
    const payload = {
      sub: 'user-123-uuid',
      email: 'test@example.com',
      username: 'testuser',
    };

    const token = signToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.username).toBe(payload.username);
  });
});
