'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { createLobby } from '../../lib/api';
import { PlayMode, LobbyVisibility, LobbyDTO, isGameAvailable, GAME_DEFINITIONS } from '@boardgametime/types';

export interface CreateLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lobby: LobbyDTO) => void;
  initialGameId?: string;
}

export const CreateLobbyModal: React.FC<CreateLobbyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialGameId = 'kingdoms',
}) => {
  const validInitialGameId = isGameAvailable(initialGameId) ? initialGameId : 'kingdoms';
  const [gameId, setGameId] = useState<string>(validInitialGameId);
  const [mode, setMode] = useState<PlayMode>('REALTIME');
  const [visibility, setVisibility] = useState<LobbyVisibility>('PUBLIC');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isGameAvailable(initialGameId)) {
      setGameId('kingdoms');
    } else {
      setGameId(initialGameId);
    }
  }, [initialGameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const selectedDef = GAME_DEFINITIONS[gameId];
      const minPlayers = selectedDef?.minPlayers ?? 2;
      const lobby = await createLobby({
        gameId,
        mode,
        visibility,
        maxPlayers,
        minPlayers,
      });
      onSuccess(lobby);
    } catch (err: any) {
      setError(err.message || 'Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  const selectedDef = GAME_DEFINITIONS[gameId];
  const minAllowed = selectedDef?.minPlayers ?? 2;
  const maxAllowed = selectedDef?.maxPlayers ?? 4;

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
          <select
            value={gameId}
            onChange={(e) => {
              const newGameId = e.target.value;
              setGameId(newGameId);
              const def = GAME_DEFINITIONS[newGameId];
              if (def && maxPlayers < def.minPlayers) {
                setMaxPlayers(def.minPlayers);
              }
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              color: '#f59e0b',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {Object.values(GAME_DEFINITIONS)
              .filter((g) => isGameAvailable(g.id))
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.author})
                </option>
              ))}
          </select>
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
          label={`Max Players (${minAllowed} - ${maxAllowed})`}
          type="number"
          min={minAllowed}
          max={maxAllowed}
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(parseInt(e.target.value) || minAllowed)}
        />
      </form>
    </Modal>
  );
};
