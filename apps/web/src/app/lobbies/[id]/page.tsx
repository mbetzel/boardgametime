'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LobbyRoom } from '../../../components/lobby/LobbyRoom';
import { listLobbies } from '../../../lib/api';
import { LobbyDTO } from '@boardgametime/types';

export default function LobbyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [lobby, setLobby] = useState<LobbyDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchLobby = async () => {
      try {
        const lobbies = await listLobbies();
        const found = lobbies.find((l) => l.id === id);
        if (found) {
          setLobby(found);
        } else {
          // If not found in public lobbies list, construct fallback or fetch
          setError('Lobby not found or private');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load lobby');
      } finally {
        setLoading(false);
      }
    };
    fetchLobby();
  }, [id]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Loading lobby room...</p>
      </main>
    );
  }

  if (error || !lobby) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <p style={{ color: '#f87171', fontSize: '1.2rem' }}>{error || 'Lobby not found'}</p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f59e0b',
            color: '#0f172a',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Return to Home
        </button>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <LobbyRoom initialLobby={lobby} />
    </main>
  );
}
