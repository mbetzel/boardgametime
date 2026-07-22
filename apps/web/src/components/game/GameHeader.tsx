import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { KingdomsGameState } from '@boardgametime/game-kingdoms';
import { MatchPlayerDTO } from '@boardgametime/types';

export interface GameHeaderProps {
  gameState: KingdomsGameState;
  players: MatchPlayerDTO[];
  currentUserId?: string;
  onOpenScoringModal?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  gameState,
  players,
  currentUserId,
  onOpenScoringModal,
}) => {
  const isMyTurn = gameState.activePlayerId === currentUserId;
  const activePlayer = players.find((p) => p.userId === gameState.activePlayerId);

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#1e293b',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '16px',
        padding: '1rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🏰 Kingdoms
          </h1>
          <Badge variant="gold" size="md">
            Epoch {gameState.epoch} / 3
          </Badge>
          {gameState.isComplete && (
            <Badge variant="success" size="md">
              MATCH COMPLETE
            </Badge>
          )}
        </div>

        {/* Scoring Modal Toggle Button */}
        {gameState.lastScoringResult && onOpenScoringModal && (
          <Button variant="outline" size="sm" onClick={onOpenScoringModal}>
            📊 Epoch Scoring Breakdown
          </Button>
        )}
      </div>

      {/* Active Turn Banner */}
      <div
        style={{
          width: '100%',
          borderRadius: '10px',
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          backgroundColor: gameState.isComplete
            ? 'rgba(16, 185, 129, 0.15)'
            : isMyTurn
            ? 'rgba(245, 158, 11, 0.2)'
            : '#0f172a',
          border: gameState.isComplete
            ? '1px solid #10b981'
            : isMyTurn
            ? '1px solid #f59e0b'
            : '1px solid #334155',
          boxShadow: isMyTurn ? '0 0 15px rgba(245, 158, 11, 0.25)' : 'none',
        }}
      >
        {gameState.isComplete ? (
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏆 Match Complete! Winner: {players.find((p) => p.userId === gameState.winnerPlayerId)?.username || 'Draw'}
          </span>
        ) : isMyTurn ? (
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            👑 YOUR TURN — Choose an action below and place on the 5x6 board!
          </span>
        ) : (
          <span style={{ fontSize: '0.95rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            ⏳ Active Turn: <strong style={{ color: '#f8fafc' }}>{activePlayer?.username || 'Opponent'}</strong> (Waiting for move...)
          </span>
        )}
      </div>
    </div>
  );
};
