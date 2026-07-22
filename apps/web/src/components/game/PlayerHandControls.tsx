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
        borderRadius: '16px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
        width: '100%',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          🎮 Action Controls
        </h3>
        <Badge variant={isMyTurn ? 'gold' : 'neutral'}>
          {isMyTurn ? 'Your Action' : 'Waiting...'}
        </Badge>
      </div>

      {/* Castle Selection Tray (Ranks 1-4) */}
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
          🏰 Castle Tray (Select rank then click an empty board cell):
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {[1, 2, 3, 4].map((rankNum) => {
            const rank = rankNum as 1 | 2 | 3 | 4;
            const castleItem = castles.find((c) => c.rank === rank);
            const count = castleItem ? castleItem.count : 0;
            const isSelected = selectedAction?.kind === 'CASTLE' && selectedAction.rank === rank;
            const hasCastles = count > 0;

            return (
              <button
                key={rank}
                disabled={!isMyTurn || !hasCastles || isLoading}
                onClick={() =>
                  onSelectAction(isSelected ? null : { kind: 'CASTLE', rank })
                }
                style={{
                  padding: '0.6rem 0.4rem',
                  borderRadius: '10px',
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
                  boxShadow: isSelected ? '0 0 12px rgba(245, 158, 11, 0.4)' : 'none',
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Rank {rank}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? '#f59e0b' : '#94a3b8' }}>
                  {count} left
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tile Action Trays: Draw Tile & Secret Tile */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Draw & Place Tile Action */}
        <Button
          variant={selectedAction?.kind === 'DRAW_TILE' ? 'gold' : 'secondary'}
          disabled={!isMyTurn || drawPileCount <= 0 || isLoading}
          onClick={() =>
            onSelectAction(selectedAction?.kind === 'DRAW_TILE' ? null : { kind: 'DRAW_TILE' })
          }
          style={{ flex: 1, minWidth: '180px' }}
        >
          📜 Draw & Place Tile ({drawPileCount} remaining)
        </Button>

        {/* Secret Tile Action */}
        {secretTile ? (
          <Button
            variant={selectedAction?.kind === 'SECRET_TILE' ? 'gold' : 'secondary'}
            disabled={!isMyTurn || isLoading}
            onClick={() =>
              onSelectAction(selectedAction?.kind === 'SECRET_TILE' ? null : { kind: 'SECRET_TILE' })
            }
            style={{ flex: 1, minWidth: '180px' }}
          >
            🕵️ Secret Tile ({secretTile.name})
          </Button>
        ) : (
          <div
            style={{
              flex: 1,
              minWidth: '180px',
              padding: '0.6rem',
              borderRadius: '8px',
              backgroundColor: '#0f172a',
              border: '1px dashed #334155',
              color: '#64748b',
              fontSize: '0.85rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🕵️ Secret Tile Used
          </div>
        )}
      </div>

      {/* Selection Banner & Pass Turn */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          {selectedAction ? (
            <strong style={{ color: '#f59e0b' }}>
              Selected: {selectedAction.kind === 'CASTLE' ? `Castle Rank ${selectedAction.rank}` : selectedAction.kind === 'DRAW_TILE' ? 'Draw Tile' : 'Secret Tile'} — Click board cell to place!
            </strong>
          ) : (
            'Select an action above to target a cell on the board.'
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
