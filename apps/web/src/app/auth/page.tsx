'use client';

import React from 'react';
import { AuthForm } from '../../components/auth/AuthForm';

export default function AuthPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '-0.025em' }}>
          BoardGameTime
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginTop: '0.5rem' }}>
          Enter the arena for Kingdoms and high-stakes strategy
        </p>
      </div>

      <AuthForm />
    </main>
  );
}
