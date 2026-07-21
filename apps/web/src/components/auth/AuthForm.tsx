'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { login, register, setAuthToken, setStoredUser } from '../../lib/api';
import { PasswordStrengthMeter, checkPasswordStrength } from './PasswordStrengthMeter';

export interface AuthFormProps {
  initialRegister?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ initialRegister = false }) => {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      const { isAllMet } = checkPasswordStrength(password);
      if (!isAllMet) {
        setError('Password does not meet all strength requirements.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        await register({ username, email, password });
      } else {
        await login({ email, password });
      }
      router.push('/lobbies');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    setLoading(true);
    try {
      const mockGoogleUser = {
        id: 'google-dev-user-001',
        username: 'GooglePlayer',
        email: 'google_dev@boardgametime.com',
        avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const mockToken = 'mock_google_jwt_token_local_dev';
      setAuthToken(mockToken);
      setStoredUser(mockGoogleUser);
      router.push('/lobbies');
    } catch (err: any) {
      setError(err.message || 'Mock Google Auth failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={isRegister ? 'Create New Account' : 'Sign In'}
      subtitle={isRegister ? 'Enter your details to join Board Game Time' : 'Log in to your Board Game Time account'}
      glow
      style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {isRegister ? (
          <>
            <Input
              label="Email Address"
              type="email"
              placeholder="player@boardgametime.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Username"
              type="text"
              placeholder="king_arthur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordStrengthMeter password={password} />
            </div>
          </>
        ) : (
          <>
            <Input
              label="Email Address or Username"
              type="text"
              placeholder="Enter your email address or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </>
        )}

        <Button type="submit" variant="gold" isLoading={loading} fullWidth size="lg">
          {isRegister ? 'Create' : 'Sign In'}
        </Button>
      </form>

      {!isRegister && (
        <>
          <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          </div>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleGoogleSignIn}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              color: '#f8fafc',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.58-2.21 3.36v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.14z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign In with Google
          </Button>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#94a3b8' }}>
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => {
            if (isRegister) {
              router.push('/auth/login');
            } else {
              router.push('/auth/register');
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#f59e0b',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {isRegister ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </Card>
  );
};
