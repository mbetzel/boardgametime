'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { createLobby, getStoredUser } from '../../../lib/api';
import { PlayMode, LobbyVisibility, UserDTO } from '@boardgametime/types';

export default function CreateLobbyPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserDTO | null>(null);

  // Form State
  const [selectedGame, setSelectedGame] = useState<string>('kingdoms');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [playMode, setPlayMode] = useState<PlayMode>('REALTIME');
  const [visibility, setVisibility] = useState<LobbyVisibility>('PUBLIC');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  // Update max player options when game changes (Kingdoms defaults to 4, max 4, min 2)
  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const game = e.target.value;
    setSelectedGame(game);
    if (game === 'kingdoms') {
      setMaxPlayers(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const lobby = await createLobby({
        gameId: selectedGame,
        mode: playMode,
        visibility,
        maxPlayers,
        minPlayers: 2,
      });

      router.push(`/lobbies/${lobby.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '1rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Brand Title */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M5 19H19" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#f59e0b',
                letterSpacing: '-0.02em',
                textShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
              }}
            >
              Board Game Time
            </span>
          </Link>

          {/* Navigation Links back to Home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none' }}>
              Home
            </Link>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid #334155', paddingLeft: '1rem' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid #f59e0b',
                    color: '#f59e0b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </span>
                <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem' }}>
                  {user.username}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main style={{ flex: 1, maxWidth: '720px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#94a3b8',
              fontSize: '0.9rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Form Container */}
        <Card glow>
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              Create New Game Room
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem', marginTop: '0.25rem' }}>
              Configure game rules, play mode, and visibility settings for your new match room.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
              }}
            >
              {error}
            </div>
          )}

          {!user && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: '#fbbf24',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>You must be logged in to create a game room.</span>
              <Link href="/auth/login" passHref style={{ textDecoration: 'none' }}>
                <Button variant="gold" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Select Game Dropdown */}
            <div>
              <label
                htmlFor="game-select"
                style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}
              >
                Select Game
              </label>
              <select
                id="game-select"
                value={selectedGame}
                onChange={handleGameChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="kingdoms">Kingdoms (2-4 Players)</option>
                <option value="catan" disabled>
                  Catan (3-4 Players) - Coming Soon
                </option>
                <option value="carcassonne" disabled>
                  Carcassonne (2-5 Players) - Coming Soon
                </option>
              </select>
            </div>

            {/* Max Players Selector */}
            <div>
              <label
                style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}
              >
                Max Players
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[2, 3, 4].map((count) => {
                  const isSelected = maxPlayers === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setMaxPlayers(count)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: isSelected ? '1px solid #f59e0b' : '1px solid #334155',
                        backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.15)' : '#0f172a',
                        color: isSelected ? '#fbbf24' : '#94a3b8',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>👥 {count} Players</span>
                      {isSelected && (
                        <span style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Play Mode Toggle */}
            <div>
              <label
                style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}
              >
                Play Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setPlayMode('REALTIME')}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: playMode === 'REALTIME' ? '1px solid #f59e0b' : '1px solid #334155',
                    backgroundColor: playMode === 'REALTIME' ? 'rgba(245, 158, 11, 0.15)' : '#0f172a',
                    color: playMode === 'REALTIME' ? '#f8fafc' : '#94a3b8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: playMode === 'REALTIME' ? '#fbbf24' : '#cbd5e1', marginBottom: '0.25rem' }}>
                    ⚡ Realtime
                  </div>
                  <div style={{ fontSize: '0.8rem', color: playMode === 'REALTIME' ? '#d97706' : '#64748b' }}>
                    Turn timer: 60s
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlayMode('ASYNC')}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: playMode === 'ASYNC' ? '1px solid #f59e0b' : '1px solid #334155',
                    backgroundColor: playMode === 'ASYNC' ? 'rgba(245, 158, 11, 0.15)' : '#0f172a',
                    color: playMode === 'ASYNC' ? '#f8fafc' : '#94a3b8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: playMode === 'ASYNC' ? '#fbbf24' : '#cbd5e1', marginBottom: '0.25rem' }}>
                    ⏳ Async
                  </div>
                  <div style={{ fontSize: '0.8rem', color: playMode === 'ASYNC' ? '#d97706' : '#64748b' }}>
                    Turn timer: 24h
                  </div>
                </button>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div>
              <label
                style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}
              >
                Visibility
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setVisibility('PUBLIC')}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: visibility === 'PUBLIC' ? '1px solid #f59e0b' : '1px solid #334155',
                    backgroundColor: visibility === 'PUBLIC' ? 'rgba(245, 158, 11, 0.15)' : '#0f172a',
                    color: visibility === 'PUBLIC' ? '#f8fafc' : '#94a3b8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: visibility === 'PUBLIC' ? '#fbbf24' : '#cbd5e1', marginBottom: '0.25rem' }}>
                    🌐 Public
                  </div>
                  <div style={{ fontSize: '0.8rem', color: visibility === 'PUBLIC' ? '#d97706' : '#64748b' }}>
                    Listed in room browser
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('PRIVATE')}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: visibility === 'PRIVATE' ? '1px solid #f59e0b' : '1px solid #334155',
                    backgroundColor: visibility === 'PRIVATE' ? 'rgba(245, 158, 11, 0.15)' : '#0f172a',
                    color: visibility === 'PRIVATE' ? '#f8fafc' : '#94a3b8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: visibility === 'PRIVATE' ? '#fbbf24' : '#cbd5e1', marginBottom: '0.25rem' }}>
                    🔒 Private
                  </div>
                  <div style={{ fontSize: '0.8rem', color: visibility === 'PRIVATE' ? '#d97706' : '#64748b' }}>
                    Requires 6-character code
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <div style={{ marginTop: '1rem' }}>
              <Button
                variant="gold"
                size="lg"
                fullWidth
                type="submit"
                isLoading={loading}
                disabled={!user}
              >
                Create Room
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
