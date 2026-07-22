'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { register } from '../../../lib/api';
import { PasswordStrengthMeter, checkPasswordStrength } from '../../../components/auth/PasswordStrengthMeter';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { isAllMet } = checkPasswordStrength(password);
    if (!isAllMet) {
      setError('Password does not meet all strength requirements.');
      return;
    }

    setLoading(true);

    try {
      await register({ username, email, password });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: '#f59e0b',
            letterSpacing: '-0.025em',
            textShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
          }}
        >
          Board Game Time
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginTop: '0.5rem' }}>
          Create an account to join Kingdoms matches
        </p>
      </div>

      <Card
        title="Create New Account"
        subtitle="Join Board Game Time to start playing"
        glow
        style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}
      >
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

          <Button type="submit" variant="gold" isLoading={loading} fullWidth size="lg">
            Create
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link
            href="/auth/login"
            style={{
              color: '#f59e0b',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Sign In
          </Link>
        </div>
      </Card>
    </main>
  );
}
