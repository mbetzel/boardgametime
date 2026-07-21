'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { CreateLobbyModal } from './CreateLobbyModal';
import { listLobbies, joinLobby, getStoredUser } from '../../lib/api';
import { getLobbySocket } from '../../lib/socket';
import { LobbyDTO } from '@boardgametime/types';

export const LobbyList: React.FC = () => {
  const router = useRouter();
  const [lobbies, setLobbies] = useState<LobbyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [selectedPrivateLobby, setSelectedPrivateLobby] = useState<LobbyDTO | null>(null);
  const [joining, setJoining] = useState(false);

  const fetchLobbiesList = async () => {
    try {
      const data = await listLobbies();
      setLobbies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch lobbies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLobbiesList();

    const socket = getLobbySocket();
    const handleLobbyUpdated = (updated: LobbyDTO) => {
      setLobbies((prev) => {
        const index = prev.findIndex((l) => l.id === updated.id);
        if (index >= 0) {
          if (updated.status !== 'WAITING') {
            return prev.filter((l) => l.id !== updated.id);
          }
          const next = [...prev];
          next[index] = updated;
          return next;
        } else if (updated.status === 'WAITING' && updated.visibility === 'PUBLIC') {
          return [updated, ...prev];
        }
        return prev;
      });
    };

    socket.on('lobby_updated', handleLobbyUpdated);

    return () => {
      socket.off('lobby_updated', handleLobbyUpdated);
    };
  }, []);

  const handleJoin = async (lobby: LobbyDTO) => {
    if (lobby.visibility === 'PRIVATE') {
      setSelectedPrivateLobby(lobby);
      return;
    }

    setJoining(true);
    try {
      await joinLobby(lobby.id);
      router.push(`/lobbies/${lobby.id}`);
    } catch (err: any) {
      alert(err.message || 'Could not join lobby');
    } finally {
      setJoining(false);
    }
  };

  const handleJoinPrivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrivateLobby) return;

    setJoining(true);
    try {
      await joinLobby(selectedPrivateLobby.id, { code: joinCode.trim().toUpperCase() });
      setSelectedPrivateLobby(null);
      router.push(`/lobbies/${selectedPrivateLobby.id}`);
    } catch (err: any) {
      alert(err.message || 'Invalid lobby code');
    } finally {
      setJoining(false);
    }
  };

  const currentUser = getStoredUser();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>Game Lobbies</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Logged in as <strong style={{ color: '#f59e0b' }}>{currentUser?.username || 'Guest'}</strong>
          </p>
        </div>
        <Button variant="gold" size="lg" onClick={() => setIsCreateModalOpen(true)}>
          + Create Lobby
        </Button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Lobby Cards */}
      {loading ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#94a3b8' }}>Loading game lobbies...</p>
        </Card>
      ) : lobbies.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No open lobbies available right now.</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Be the first to host a game of Kingdoms!
          </p>
          <Button variant="gold" style={{ marginTop: '1.5rem' }} onClick={() => setIsCreateModalOpen(true)}>
            Create a Lobby
          </Button>
        </Card>
      ) : (
        <div className="grid-container grid-cols-2">
          {lobbies.map((lobby) => {
            const playerNum = lobby.players?.length || 0;
            const isFull = playerNum >= lobby.maxPlayers;
            return (
              <Card
                key={lobby.id}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Kingdoms</span>
                    <Badge variant={lobby.mode === 'REALTIME' ? 'gold' : 'info'} size="sm">
                      {lobby.mode}
                    </Badge>
                  </div>
                }
                footer={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      Players: {playerNum} / {lobby.maxPlayers}
                    </span>
                    <Button
                      variant={isFull ? 'secondary' : 'gold'}
                      size="sm"
                      disabled={isFull || joining}
                      onClick={() => handleJoin(lobby)}
                    >
                      {isFull ? 'Full' : 'Join Game'}
                    </Button>
                  </div>
                }
              >
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Badge variant={lobby.visibility === 'PUBLIC' ? 'success' : 'warning'} size="sm">
                    {lobby.visibility}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    Code: {lobby.code}
                  </Badge>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Host: {lobby.players.find((p) => p.userId === lobby.hostId)?.username || 'Unknown'}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal to Create Lobby */}
      <CreateLobbyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(created) => {
          setIsCreateModalOpen(false);
          router.push(`/lobbies/${created.id}`);
        }}
      />

      {/* Modal to Enter Private Code */}
      <Modal
        isOpen={Boolean(selectedPrivateLobby)}
        onClose={() => setSelectedPrivateLobby(null)}
        title="Enter Private Lobby Code"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedPrivateLobby(null)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleJoinPrivateSubmit} isLoading={joining}>
              Join
            </Button>
          </>
        }
      >
        <form onSubmit={handleJoinPrivateSubmit}>
          <Input
            label="Lobby Code (6 characters)"
            placeholder="e.g. AB12CD"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
