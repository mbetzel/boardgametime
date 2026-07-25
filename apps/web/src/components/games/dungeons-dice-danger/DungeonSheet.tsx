import React, { useState } from 'react';
import { DungeonMapDefinition, PlayerSheetState, MapCell } from '@boardgametime/game-dungeons-dice-danger';

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
  const [viewMode, setViewMode] = useState<'GRAPH' | 'IMAGE'>('GRAPH');
  const cellsList = Object.values(mapDef.cells);
  const maxRow = Math.max(...cellsList.map((c) => c.row), 5);
  const maxCol = Math.max(...cellsList.map((c) => c.col), 5);

  const mapImageUrl = mapImageUrls[mapDef.id] || '/images/maps/annoyed-animals.jpg';

  // Calculate percentage coordinates for nodes in abstract graph
  const getNodeCoords = (cell: MapCell) => {
    const cAny = cell as any;
    const x = cAny.x !== undefined ? cAny.x : (cell.col / (maxCol + 1)) * 82 + 9;
    const y = cAny.y !== undefined ? cAny.y : (cell.row / (maxRow + 1)) * 80 + 10;
    return { x, y };
  };

  // Unique connection edges for SVG drawing
  const edges: Array<{ fromId: string; toId: string; x1: number; y1: number; x2: number; y2: number }> = [];
  const edgeSet = new Set<string>();

  cellsList.forEach((cell) => {
    const c1 = getNodeCoords(cell);
    cell.connectedCellIds.forEach((targetId) => {
      const targetCell = mapDef.cells[targetId];
      if (targetCell) {
        const edgeKey = [cell.id, targetId].sort().join('---');
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          const c2 = getNodeCoords(targetCell);
          edges.push({
            fromId: cell.id,
            toId: targetId,
            x1: c1.x,
            y1: c1.y,
            x2: c2.x,
            y2: c2.y,
          });
        }
      }
    });
  });

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🗺️</span>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Map: {mapDef.name}
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Difficulty: {mapDef.difficulty} • {cellsList.length} Rooms
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* View Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'GRAPH' ? 'IMAGE' : 'GRAPH')}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#f59e0b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {viewMode === 'GRAPH' ? '🖼️ View Map Artwork Overlay' : '🕸️ View Abstract Room Graph'}
          </button>

          <div style={{ fontSize: '0.85rem', color: '#94a3b8', background: '#1e293b', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            Visited: <strong style={{ color: '#34d399' }}>{playerState.visitedCellIds.length}</strong> / {cellsList.length} rooms
          </div>
        </div>
      </div>

      {/* Main Dungeon Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1.45 / 1',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
          backgroundColor: '#090d16',
        }}
      >
        {/* Background Image if in IMAGE mode */}
        {viewMode === 'IMAGE' && (
          <img
            src={mapImageUrl}
            alt={`${mapDef.name} Map Art`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.85,
            }}
          />
        )}

        {/* SVG Connection Edges Layer */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2,
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {edges.map((edge) => {
            const isFromVisited = playerState.visitedCellIds.includes(edge.fromId);
            const isToVisited = playerState.visitedCellIds.includes(edge.toId);
            const isVisitedPath = isFromVisited && isToVisited;

            return (
              <line
                key={`${edge.fromId}-${edge.toId}`}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={isVisitedPath ? '#10b981' : viewMode === 'GRAPH' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(255, 255, 255, 0.25)'}
                strokeWidth={isVisitedPath ? '0.7' : '0.4'}
                strokeDasharray={isVisitedPath ? 'none' : '0.8,0.8'}
              />
            );
          })}
        </svg>

        {/* Interactive Room Nodes Layer */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
          {cellsList.map((cell) => {
            const isVisited = playerState.visitedCellIds.includes(cell.id);
            const isSelected = selectedCellId === cell.id;
            const coords = getNodeCoords(cell);

            let bgColor = 'rgba(30, 41, 59, 0.9)';
            let borderColor = '#475569';
            let textColor = '#f8fafc';
            let iconText = '';

            if (cell.type === 'START') {
              bgColor = 'rgba(16, 185, 129, 0.9)';
              borderColor = '#10b981';
              textColor = '#ffffff';
              iconText = '🟩';
            } else if (cell.type === 'GRAY_ACTIVATION') {
              bgColor = 'rgba(100, 116, 139, 0.9)';
              borderColor = '#94a3b8';
              textColor = '#ffffff';
              iconText = '🔘';
            } else if (cell.type === 'CHEST') {
              bgColor = 'rgba(245, 158, 11, 0.9)';
              borderColor = '#f59e0b';
              textColor = '#0f172a';
              iconText = '📦';
            } else if (cell.type === 'MONSTER') {
              bgColor = 'rgba(239, 68, 68, 0.9)';
              borderColor = '#ef4444';
              textColor = '#ffffff';
              iconText = '🐉';
            }

            if (isVisited) {
              bgColor = 'rgba(16, 185, 129, 0.95)';
              borderColor = '#34d399';
              textColor = '#ffffff';
            }

            return (
              <button
                key={cell.id}
                type="button"
                disabled={disabled || isVisited}
                onClick={() => onSelectCell && onSelectCell(cell.id)}
                style={{
                  position: 'absolute',
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '42px',
                  height: '42px',
                  borderRadius: cell.type === 'START' ? '8px' : '50%',
                  backgroundColor: bgColor,
                  border: isSelected ? '3px solid #fbbf24' : `2px solid ${borderColor}`,
                  boxShadow: isSelected
                    ? '0 0 20px rgba(251, 191, 36, 1), 0 0 10px rgba(251, 191, 36, 0.8)'
                    : isVisited
                    ? '0 0 10px rgba(16, 185, 129, 0.5)'
                    : '0 4px 10px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: !isVisited && !disabled ? 'pointer' : 'default',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: isSelected ? 20 : 10,
                  opacity: disabled ? 0.7 : 1,
                }}
                title={`${cell.label || cell.type} (Val: ${cell.value ?? '—'})`}
              >
                {isVisited ? (
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>✓</span>
                ) : (
                  <>
                    <span style={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: 'monospace', color: textColor, lineHeight: 1 }}>
                      {cell.value ?? (iconText || '—')}
                    </span>
                    {cell.type === 'CHEST' && (
                      <span style={{ fontSize: '0.6rem', lineHeight: 1, marginTop: '1px' }}>📦</span>
                    )}
                    {cell.type === 'MONSTER' && (
                      <span style={{ fontSize: '0.6rem', lineHeight: 1, marginTop: '1px' }}>🐉</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#94a3b8', background: '#1e293b', padding: '0.6rem 1rem', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981' }} />
          <span>Start Room</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#475569', border: '1px solid #94a3b8' }} />
          <span>Regular / Gray Room</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <span>Treasure Chest</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <span>Monster Room</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '8px' }}>✓</div>
          <span>Visited</span>
        </div>
      </div>
    </div>
  );
};
