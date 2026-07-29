import { describe, it, expect } from 'vitest';
import { socketAuthMiddleware } from '../sockets/socketServer';
import { signToken } from '../services/authService';

describe('Socket Server Authentication Middleware', () => {
  const validToken = signToken({
    sub: 'user-test-123',
    username: 'testuser',
    email: 'testuser@example.com',
  });

  it('rejects unauthenticated socket connections with Authentication required error', () => {
    const mockSocket: any = {
      handshake: {
        auth: {},
        headers: {},
      },
    };

    let nextCalledWithError: Error | undefined;
    socketAuthMiddleware(mockSocket, (err?: Error) => {
      nextCalledWithError = err;
    });

    expect(nextCalledWithError).toBeDefined();
    expect(nextCalledWithError?.message).toBe('Authentication required');
    expect(mockSocket.user).toBeUndefined();
  });

  it('rejects invalid token socket connections with Invalid token error', () => {
    const mockSocket: any = {
      handshake: {
        auth: { token: 'invalid-token-string' },
        headers: {},
      },
    };

    let nextCalledWithError: Error | undefined;
    socketAuthMiddleware(mockSocket, (err?: Error) => {
      nextCalledWithError = err;
    });

    expect(nextCalledWithError).toBeDefined();
    expect(nextCalledWithError?.message).toBe('Invalid token');
    expect(mockSocket.user).toBeUndefined();
  });

  it('authenticates valid token from handshake.auth and attaches user object', () => {
    const mockSocket: any = {
      handshake: {
        auth: { token: validToken },
        headers: {},
      },
    };

    let nextCalled = false;
    let nextError: Error | undefined;
    socketAuthMiddleware(mockSocket, (err?: Error) => {
      nextCalled = true;
      nextError = err;
    });

    expect(nextCalled).toBe(true);
    expect(nextError).toBeUndefined();
    expect(mockSocket.user).toBeDefined();
    expect(mockSocket.user.sub).toBe('user-test-123');
    expect(mockSocket.user.username).toBe('testuser');
    expect(mockSocket.user.email).toBe('testuser@example.com');
  });

  it('authenticates valid token from Authorization header and attaches user object', () => {
    const mockSocket: any = {
      handshake: {
        auth: {},
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      },
    };

    let nextCalled = false;
    let nextError: Error | undefined;
    socketAuthMiddleware(mockSocket, (err?: Error) => {
      nextCalled = true;
      nextError = err;
    });

    expect(nextCalled).toBe(true);
    expect(nextError).toBeUndefined();
    expect(mockSocket.user).toBeDefined();
    expect(mockSocket.user.sub).toBe('user-test-123');
  });
});
