import React from 'react';
import { DungeonMapDefinition, PlayerSheetState } from '@boardgametime/game-dungeons-dice-danger';

interface DungeonSheetProps {
  mapDef: DungeonMapDefinition;
  playerState: PlayerSheetState;
  onSelectCell?: (cellId: string) => void;
  selectedCellId?: string | null;
  disabled?: boolean;
}

export const DungeonSheet: React.FC<DungeonSheetProps> = ({
  mapDef,
  playerState,
  onSelectCell,
  selectedCellId,
  disabled = false,
}) => {
  const cellsList = Object.values(mapDef.cells);
  const maxRow = Math.max(...cellsList.map((c) => c.row), 5);
  const maxCol = Math.max(...cellsList.map((c) => c.col), 5);

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%',
      }}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏰</span>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Map: {mapDef.name}
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Difficulty: {mapDef.difficulty}
            </span>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', background: '#1e293b', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          Visited: <strong style={{ color: '#34d399' }}>{playerState.visitedCellIds.length}</strong> / {cellsList.length} spaces
        </div>
      </div>

      {/* Grid Canvas matching paper map sheet */}
      <div style={{ overflowX: 'auto', width: '100%', padding: '0.5rem 0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(${maxRow + 1}, minmax(75px, 1fr))`,
            gridTemplateColumns: `repeat(${maxCol + 1}, minmax(75px, 1fr))`,
            gap: '0.75rem',
            minWidth: '520px',
            width: '100%',
          }}
        >
          {cellsList.map((cell) => {
            const isVisited = playerState.visitedCellIds.includes(cell.id);
            const isSelected = selectedCellId === cell.id;

            let bgColor = '#1e293b';
            let borderColor = 'rgba(255, 255, 255, 0.1)';
            let textColor = '#f8fafc';
            let badgeText = '';

            if (cell.type === 'START') {
              bgColor = 'rgba(16, 185, 129, 0.2)';
              borderColor = '#10b981';
              textColor = '#34d399';
              badgeText = 'START';
            } else if (cell.type === 'GRAY_ACTIVATION') {
              bgColor = 'rgba(100, 116, 139, 0.3)';
              borderColor = '#94a3b8';
              textColor = '#e2e8f0';
              badgeText = 'GRAY';
            } else if (cell.type === 'CHEST') {
              bgColor = 'rgba(245, 158, 11, 0.2)';
              borderColor = '#f59e0b';
              textColor = '#fbbf24';
              badgeText = 'CHEST';
            } else if (cell.type === 'MONSTER') {
              bgColor = 'rgba(239, 68, 68, 0.2)';
              borderColor = '#ef4444';
              textColor = '#f87171';
              badgeText = cell.label?.split(':')[0] || 'MONSTER';
            }

            if (isVisited) {
              bgColor = '#090d16';
              borderColor = '#10b981';
              textColor = '#64748b';
            }

            return (
              <button
                key={cell.id}
                type="button"
                disabled={disabled || isVisited}
                onClick={() => onSelectCell && onSelectCell(cell.id)}
                style={{
                  gridRowStart: cell.row + 1,
                  gridColumnStart: cell.col + 1,
                  backgroundColor: bgColor,
                  border: isSelected ? '2px solid #fbbf24' : `1px solid ${borderColor}`,
                  boxShadow: isSelected ? '0 0 15px rgba(251, 191, 36, 0.5)' : 'none',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.2rem',
                  cursor: !isVisited && !disabled ? 'pointer' : 'default',
                  opacity: isVisited ? 0.6 : 1,
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                }}
              >
                {/* Space Type Badge */}
                {badgeText && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: textColor, opacity: 0.8 }}>
                    {badgeText}
                  </span>
                )}

                {/* Dice Value / Sum Target */}
                <span style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'monospace', color: textColor }}>
                  {cell.value ?? cell.label ?? '—'}
                </span>

                {/* Icons */}
                {cell.type === 'CHEST' && <span style={{ fontSize: '1.1rem' }}>📦</span>}
                {cell.type === 'MONSTER' && <span style={{ fontSize: '1.1rem' }}>🐉</span>}
                {cell.requiresActivationCellId && (
                  <span style={{ fontSize: '0.6rem', color: '#94a3b8', background: '#0f172a', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                    🔒 Req Gray
                  </span>
                )}

                {/* Visited Checkmark */}
                {isVisited && (
                  <span style={{ fontSize: '1rem', color: '#34d399', fontWeight: 900, position: 'absolute', top: '4px', right: '6px' }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
