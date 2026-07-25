import React, { useState } from 'react';
import { DungeonMapDefinition, PlayerSheetState } from '@boardgametime/game-dungeons-dice-danger';

interface DungeonSheetProps {
  mapDef: DungeonMapDefinition;
  playerState: PlayerSheetState;
  onSelectCell?: (cellId: string) => void;
  selectedCellId?: string | null;
  disabled?: boolean;
}

const mapImageUrls: Record<string, string> = {
  'annoyed-animals': '/images/maps/annoyed-animals.jpg',
  'clumsy-cultists': '/images/maps/clumsy-cultists.jpg',
  'puzzled-pyramid': '/images/maps/puzzled-pyramid.jpg',
  'defiant-dinosaurs': '/images/maps/defiant-dinosaurs.jpg',
};

export const DungeonSheet: React.FC<DungeonSheetProps> = ({
  mapDef,
  playerState,
  onSelectCell,
  selectedCellId,
  disabled = false,
}) => {
  const [viewMode, setViewMode] = useState<'IMAGE' | 'GRID'>('IMAGE');
  const cellsList = Object.values(mapDef.cells);
  const maxRow = Math.max(...cellsList.map((c) => c.row), 5);
  const maxCol = Math.max(...cellsList.map((c) => c.col), 5);

  const mapImageUrl = mapImageUrls[mapDef.id] || '/images/maps/annoyed-animals.jpg';

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
      }}
    >
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🗺️</span>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Map: {mapDef.name}
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Difficulty: {mapDef.difficulty}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Toggle View Mode Button */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'IMAGE' ? 'GRID' : 'IMAGE')}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#f59e0b',
              cursor: 'pointer',
            }}
          >
            {viewMode === 'IMAGE' ? '📐 Switch to Grid View' : '🖼️ Switch to Official Map Art'}
          </button>

          <div style={{ fontSize: '0.85rem', color: '#94a3b8', background: '#1e293b', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            Visited: <strong style={{ color: '#34d399' }}>{playerState.visitedCellIds.length}</strong> / {cellsList.length} spaces
          </div>
        </div>
      </div>

      {/* Main Board Container */}
      {viewMode === 'IMAGE' ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
            backgroundColor: '#0f172a',
          }}
        >
          {/* Official Game Sheet Artwork Background */}
          <img
            src={mapImageUrl}
            alt={`${mapDef.name} Map Art`}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '10px',
              opacity: 0.92,
            }}
          />

          {/* Interactive Cell Overlay over Map Image */}
          <div
            style={{
              position: 'absolute',
              left: '3.5%',
              top: '3.5%',
              width: '79%',
              height: '82%',
              display: 'grid',
              gridTemplateRows: `repeat(${maxRow + 1}, 1fr)`,
              gridTemplateColumns: `repeat(${maxCol + 1}, 1fr)`,
              gap: '2px',
            }}
          >
            {cellsList.map((cell) => {
              const isVisited = playerState.visitedCellIds.includes(cell.id);
              const isSelected = selectedCellId === cell.id;

              return (
                <button
                  key={cell.id}
                  type="button"
                  disabled={disabled || isVisited}
                  onClick={() => onSelectCell && onSelectCell(cell.id)}
                  style={{
                    gridRowStart: cell.row + 1,
                    gridColumnStart: cell.col + 1,
                    backgroundColor: isVisited
                      ? 'rgba(16, 185, 129, 0.65)'
                      : isSelected
                      ? 'rgba(251, 191, 36, 0.65)'
                      : 'transparent',
                    border: isSelected
                      ? '2px solid #fbbf24'
                      : isVisited
                      ? '2px solid #10b981'
                      : '1px stroke rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: !isVisited && !disabled ? 'pointer' : 'default',
                    transition: 'all 0.15s ease-in-out',
                    backdropFilter: isVisited || isSelected ? 'blur(2px)' : 'none',
                    boxShadow: isSelected ? '0 0 12px rgba(251, 191, 36, 0.9)' : 'none',
                  }}
                  title={`${cell.label || cell.type} (Row ${cell.row}, Col ${cell.col})`}
                >
                  {isVisited && (
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
                      ✓
                    </span>
                  )}
                  {isSelected && !isVisited && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#0f172a' }}>
                      🎯
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Styled Grid Fallback View */
        <div style={{ overflowX: 'auto', width: '100%', padding: '0.5rem 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${maxRow + 1}, minmax(70px, 1fr))`,
              gridTemplateColumns: `repeat(${maxCol + 1}, minmax(70px, 1fr))`,
              gap: '0.65rem',
              minWidth: '500px',
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
                    borderRadius: '10px',
                    padding: '0.4rem',
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
                  {badgeText && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: textColor, opacity: 0.8 }}>
                      {badgeText}
                    </span>
                  )}
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'monospace', color: textColor }}>
                    {cell.value ?? cell.label ?? '—'}
                  </span>
                  {isVisited && (
                    <span style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 900, position: 'absolute', top: '3px', right: '5px' }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
