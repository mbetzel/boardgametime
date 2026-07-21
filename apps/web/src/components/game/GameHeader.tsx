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

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#1e293b',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>Kingdoms</h1>
          <Badge variant="gold" size="md">
            Epoch {gameState.epoch} / 3
          </Badge>
          {gameState.isComplete && (
            <Badge variant="success" size="md">
              MATCH COMPLETE
            </Badge>
          )}
        </div>

        {/* Turn Status Badge */}
        <div>
          {gameState.isComplete ? (
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
              Winner: {players.find((p) => p.userId === gameState.winnerPlayerId)?.username || 'Draw'}
            </span>
          ) : isMyTurn ? (
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                border: '1px solid #f59e0b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              className="pulse-glow"
            >
              👑 YOUR TURN!
            </span>
          ) : (
            <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
              Waiting for{' '}
              <strong style={{ color: '#f8fafc' }}>
                {players.find((p) => p.userId === gameState.activePlayerId)?.username || 'Opponent'}
              </strong>
              ...
            </span>
          )}
        </div>
      </div>

      {/* Players Scoreboard */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
        {players.map((p) => {
          const pState = gameState.players[p.userId];
          const isActive = gameState.activePlayerId === p.userId;
          return (
            <div
              key={p.userId}
              style={{
                flex: '1 1 180px',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                backgroundColor: isActive ? 'rgba(245, 158, 11, 0.15)' : '#0f172a',
                border: isActive ? '1px solid #f59e0b' : '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: pState?.color || '#f59e0b',
                  }}
                />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                  {p.username} {p.userId === currentUserId ? '(You)' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, color: '#f59e0b' }}>
                🪙 {pState?.gold ?? 0}
              </div>
            </div>
          );
        })}

        {gameState.lastScoringResult && onOpenScoringModal && (
          <Button variant="outline" size="sm" onClick={onOpenScoringModal} style={{ alignSelf: 'center' }}>
            📊 Last Epoch Scoring
          </Button>
        )}
      </div>
    </div>
  );
};
