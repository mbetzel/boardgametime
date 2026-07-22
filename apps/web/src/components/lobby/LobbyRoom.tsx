'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { toggleReady, startGame, getStoredUser } from '../../lib/api';
import { getLobbySocket } from '../../lib/socket';
import { LobbyDTO, UserDTO } from '@boardgametime/types';

export interface LobbyRoomProps {
  initialLobby: LobbyDTO;
}

export const LobbyRoom: React.FC<LobbyRoomProps> = ({ initialLobby }) => {
  const router = useRouter();
  const [lobby, setLobby] = useState<LobbyDTO>(initialLobby);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(null);

  const currentUserId = currentUser?.id;
  const isHost = lobby.hostId === currentUserId;
  const myPlayerSlot = lobby.players.find((p) => p.userId === currentUserId);
  const isReady = myPlayerSlot?.isReady || false;

  useEffect(() => {
    setCurrentUser(getStoredUser());

    const socket = getLobbySocket();
    socket.emit('join_room', lobby.id);

    const handleLobbyUpdated = (updated: LobbyDTO) => {
      if (updated.id === lobby.id) {
        setLobby(updated);
      }
    };

    const handleMatchStarted = (data: { matchId: string }) => {
      router.push(`/matches/${data.matchId}`);
    };

    socket.on('lobby_updated', handleLobbyUpdated);
    socket.on('match_started', handleMatchStarted);

    return () => {
      socket.emit('leave_room', lobby.id);
      socket.off('lobby_updated', handleLobbyUpdated);
      socket.off('match_started', handleMatchStarted);
    };
  }, [lobby.id, router]);

  const handleToggleReady = async () => {
    setLoadingAction(true);
    setError(null);
    try {
      const updated = await toggleReady(lobby.id, { isReady: !isReady });
      setLobby(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle ready');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStartGame = async () => {
    setLoadingAction(true);
    setError(null);
    try {
      const result = await startGame(lobby.id);
      router.push(`/matches/${result.matchId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start game');
    } finally {
      setLoadingAction(false);
    }
  };

  const canStart = isHost && lobby.players.length >= lobby.minPlayers;

  return (
    <div style={{ maxWidth: '750px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem', color: '#f59e0b' }}>Lobby Room</span>
            <Badge variant="gold" size="md">
              Code: {lobby.code}
            </Badge>
          </div>
        }
        glow
      >
        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <Badge variant={lobby.mode === 'REALTIME' ? 'gold' : 'info'}>Mode: {lobby.mode}</Badge>
          <Badge variant={lobby.visibility === 'PUBLIC' ? 'success' : 'warning'}>Visibility: {lobby.visibility}</Badge>
          <Badge variant="neutral">Status: {lobby.status}</Badge>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem' }}>
          Players ({lobby.players.length} / {lobby.maxPlayers})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {lobby.players.map((player) => {
            const isPlayerHost = player.userId === lobby.hostId;
            return (
              <div
                key={player.userId}
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: '8px',
                  backgroundColor: player.userId === currentUserId ? 'rgba(245, 158, 11, 0.1)' : '#0f172a',
                  border: player.userId === currentUserId ? '1px solid #f59e0b' : '1px solid #334155',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: '#f59e0b',
                    }}
                  >
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{player.username}</span>
                    {isPlayerHost && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>
                        [HOST]
                      </span>
                    )}
                  </div>
                </div>

                <Badge variant={player.isReady ? 'success' : 'neutral'} size="sm">
                  {player.isReady ? 'Ready' : 'Waiting'}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => router.push('/')}>
            Back to Home
          </Button>

          <Button
            variant={isReady ? 'danger' : 'gold'}
            onClick={handleToggleReady}
            isLoading={loadingAction}
          >
            {isReady ? 'Unready' : 'Ready Up'}
          </Button>

          {isHost && (
            <Button
              variant="gold"
              onClick={handleStartGame}
              disabled={!canStart}
              isLoading={loadingAction}
            >
              Start Game
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
