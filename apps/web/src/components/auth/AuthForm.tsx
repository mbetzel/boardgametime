'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { login, register } from '../../lib/api';

export const AuthForm: React.FC = () => {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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

  return (
    <Card
      title={isRegister ? 'Create an Account' : 'Welcome Back'}
      subtitle={isRegister ? 'Enter your details to join BoardGameTime' : 'Log in to your BoardGameTime account'}
      glow
      style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div
            style={{
              padding: '0.75rem',
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

        {isRegister && (
          <Input
            label="Username"
            placeholder="king_arthur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="player@boardgametime.com"
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

        <Button type="submit" variant="gold" isLoading={loading} fullWidth size="lg">
          {isRegister ? 'Register' : 'Log In'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#94a3b8' }}>
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError(null);
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
          {isRegister ? 'Log In' : 'Sign Up'}
        </button>
      </div>
    </Card>
  );
};
