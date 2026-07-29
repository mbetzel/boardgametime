'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { verifyEmail, resendVerification } from '../../../lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('No verification token provided. Please check the verification link in your email.');
      return;
    }

    const runVerification = async () => {
      setLoading(true);
      setError(null);
      try {
        await verifyEmail(token);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Email verification failed. The link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    runVerification();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setResendLoading(true);
    setResendSuccess(null);
    try {
      const res = await resendVerification(emailInput);
      setResendSuccess(res.message || 'A new verification link has been sent.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification link.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card
      title={loading ? 'Verifying Email...' : success ? 'Email Verified! 🎉' : 'Verification Issue'}
      subtitle={
        loading
          ? 'Validating your security token'
          : success
          ? 'Your account is now fully active'
          : 'We could not verify your email address'
      }
      glow
      style={{ maxWidth: '440px', width: '100%', margin: '0 auto', textAlign: 'center' }}
    >
      {loading ? (
        <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(245, 158, 11, 0.2)',
              borderTopColor: '#f59e0b',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Verifying your email token...</p>
        </div>
      ) : success ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
            }}
          >
            ✓
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            Thank you for verifying your email address! Your BoardGameTime account is now active and ready for match play.
          </p>

          <Button
            type="button"
            variant="gold"
            fullWidth
            size="lg"
            onClick={() => router.push('/')}
          >
            Go to Home Page & Play
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {resendSuccess && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                fontSize: '0.875rem',
              }}
            >
              {resendSuccess}
            </div>
          )}

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Verification links expire after 24 hours. Enter your email below to request a new verification link:
          </p>

          <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="player@boardgametime.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="gold"
              fullWidth
              isLoading={resendLoading}
            >
              Request New Verification Link
            </Button>
          </form>

          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            <Link href="/auth/login" style={{ color: '#f59e0b', textDecoration: 'underline' }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
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
          Account Verification
        </p>
      </div>

      <Suspense fallback={<div style={{ color: '#94a3b8' }}>Loading verification...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
