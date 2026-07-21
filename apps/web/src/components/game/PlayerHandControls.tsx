import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { KingdomsPlayerState, Tile } from '@boardgametime/game-kingdoms';

export type SelectedActionType =
  | { kind: 'CASTLE'; rank: 1 | 2 | 3 | 4 }
  | { kind: 'DRAW_TILE' }
  | { kind: 'SECRET_TILE' }
  | null;

export interface PlayerHandControlsProps {
  playerState?: KingdomsPlayerState;
  drawPileCount: number;
  isMyTurn: boolean;
  selectedAction: SelectedActionType;
  onSelectAction: (action: SelectedActionType) => void;
  onPass: () => void;
  isLoading?: boolean;
}

export const PlayerHandControls: React.FC<PlayerHandControlsProps> = ({
  playerState,
  drawPileCount,
  isMyTurn,
  selectedAction,
  onSelectAction,
  onPass,
  isLoading = false,
}) => {
  if (!playerState) return null;

  const castles = playerState.availableCastles || [];
  const secretTile = playerState.secretTile as Tile | null;

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', margin: 0 }}>
          Your Action Controls
        </h3>
        <Badge variant={isMyTurn ? 'gold' : 'neutral'}>
          {isMyTurn ? 'Select Action' : 'Waiting...'}
        </Badge>
      </div>

      {/* Castle Tray */}
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
          🏰 Castle Tray (Select rank then click cell):
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {castles.map((c) => {
            const isSelected = selectedAction?.kind === 'CASTLE' && selectedAction.rank === c.rank;
            const hasCastles = c.count > 0;
            return (
              <button
                key={c.rank}
                disabled={!isMyTurn || !hasCastles || isLoading}
                onClick={() =>
                  onSelectAction(isSelected ? null : { kind: 'CASTLE', rank: c.rank })
                }
                style={{
                  flex: 1,
                  minWidth: '70px',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.3)' : '#0f172a',
                  border: isSelected ? '2px solid #f59e0b' : '1px solid #334155',
                  color: hasCastles ? '#f8fafc' : '#64748b',
                  cursor: isMyTurn && hasCastles ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  transition: 'all 0.15s ease-in-out',
                  opacity: hasCastles ? 1 : 0.4,
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Rank {c.rank}</span>
                <span style={{ fontSize: '0.75rem', color: isSelected ? '#f59e0b' : '#94a3b8' }}>
                  Left: {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tile Actions: Draw Pile & Secret Tile */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Draw Tile Button */}
        <Button
          variant={selectedAction?.kind === 'DRAW_TILE' ? 'gold' : 'secondary'}
          disabled={!isMyTurn || drawPileCount <= 0 || isLoading}
          onClick={() =>
            onSelectAction(selectedAction?.kind === 'DRAW_TILE' ? null : { kind: 'DRAW_TILE' })
          }
          style={{ flex: 1 }}
        >
          📜 Draw & Place Tile ({drawPileCount} left)
        </Button>

        {/* Secret Tile Button */}
        {secretTile && (
          <Button
            variant={selectedAction?.kind === 'SECRET_TILE' ? 'gold' : 'secondary'}
            disabled={!isMyTurn || isLoading}
            onClick={() =>
              onSelectAction(selectedAction?.kind === 'SECRET_TILE' ? null : { kind: 'SECRET_TILE' })
            }
            style={{ flex: 1 }}
          >
            🕵️ Secret Tile ({secretTile.name})
          </Button>
        )}
      </div>

      {/* Pass Turn Button */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {selectedAction ? (
            <strong style={{ color: '#f59e0b' }}>
              Selected: {selectedAction.kind === 'CASTLE' ? `Castle R${selectedAction.rank}` : selectedAction.kind === 'DRAW_TILE' ? 'Draw Tile' : 'Secret Tile'} — Click board cell to place!
            </strong>
          ) : (
            'Choose an action above'
          )}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={!isMyTurn || isLoading}
          onClick={onPass}
        >
          ⏭️ Pass Turn
        </Button>
      </div>
    </div>
  );
};
