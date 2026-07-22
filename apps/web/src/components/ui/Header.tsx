'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserDTO } from '@boardgametime/types';
import { getStoredUser, removeAuthToken } from '../../lib/api';
import { UserMenu } from './UserMenu';
import { Button } from './Button';

interface HeaderProps {
  user?: UserDTO | null;
  onSignOut?: () => void;
  subtitle?: string;
  backLink?: { href: string; label: string };
  extraActions?: React.ReactNode;
}

export function Header({ user: propUser, onSignOut: propOnSignOut, subtitle, backLink, extraActions }: HeaderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(propUser ?? null);

  useEffect(() => {
    if (propUser !== undefined) {
      setCurrentUser(propUser);
    } else {
      setCurrentUser(getStoredUser());
    }
  }, [propUser]);

  const handleDefaultSignOut = () => {
    if (propOnSignOut) {
      propOnSignOut();
    } else {
      removeAuthToken();
      setCurrentUser(null);
      router.push('/auth/login');
    }
  };

  return (
    <header
      style={{
        borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0.85rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Left Side: Brand Logo & Title + Optional Subtitle/Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M5 19H19" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#f59e0b',
                letterSpacing: '-0.02em',
                textShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
              }}
            >
              Board Game Time
            </span>
          </Link>

          {subtitle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#475569', fontSize: '1.2rem', fontWeight: 300 }}>/</span>
              <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>{subtitle}</span>
            </div>
          )}

          {backLink && (
            <Link
              href={backLink.href}
              style={{
                color: '#94a3b8',
                fontSize: '0.88rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f59e0b')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              {backLink.label}
            </Link>
          )}
        </div>

        {/* Right Side: Extra Actions + User Menu Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {extraActions}

          {currentUser ? (
            <UserMenu user={currentUser} onSignOut={handleDefaultSignOut} />
          ) : (
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <Button variant="gold" size="md">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
