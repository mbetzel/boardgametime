'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { createLobby } from '../../lib/api';
import { PlayMode, LobbyVisibility, LobbyDTO } from '@boardgametime/types';

export interface CreateLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lobby: LobbyDTO) => void;
}

export const CreateLobbyModal: React.FC<CreateLobbyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<PlayMode>('REALTIME');
  const [visibility, setVisibility] = useState<LobbyVisibility>('PUBLIC');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const lobby = await createLobby({
        gameId: 'kingdoms',
        mode,
        visibility,
        maxPlayers,
        minPlayers: 2,
      });
      onSuccess(lobby);
    } catch (err: any) {
      setError(err.message || 'Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Game Lobby"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="gold" onClick={handleSubmit} isLoading={loading} type="button">
            Create Lobby
          </Button>
        </>
      }
    >
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
            Game Title
          </label>
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#f59e0b', fontWeight: 600 }}>
            Kingdoms (Reiner Knizia)
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
            Play Mode
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              type="button"
              variant={mode === 'REALTIME' ? 'gold' : 'secondary'}
              onClick={() => setMode('REALTIME')}
              style={{ flex: 1 }}
            >
              ⚡ Real-Time
            </Button>
            <Button
              type="button"
              variant={mode === 'ASYNC' ? 'gold' : 'secondary'}
              onClick={() => setMode('ASYNC')}
              style={{ flex: 1 }}
            >
              ⏳ Asynchronous
            </Button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
            Visibility
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              type="button"
              variant={visibility === 'PUBLIC' ? 'gold' : 'secondary'}
              onClick={() => setVisibility('PUBLIC')}
              style={{ flex: 1 }}
            >
              🌐 Public
            </Button>
            <Button
              type="button"
              variant={visibility === 'PRIVATE' ? 'gold' : 'secondary'}
              onClick={() => setVisibility('PRIVATE')}
              style={{ flex: 1 }}
            >
              🔒 Private
            </Button>
          </div>
        </div>

        <Input
          label="Max Players (2 - 4)"
          type="number"
          min={2}
          max={4}
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 2)}
        />
      </form>
    </Modal>
  );
};
