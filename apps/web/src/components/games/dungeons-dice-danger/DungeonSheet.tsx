import React, { useState } from 'react';
import { DungeonMapDefinition, PlayerSheetState, MapCell } from '@boardgametime/game-dungeons-dice-danger';

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
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);
  const [showBgArt, setShowBgArt] = useState<boolean>(false);

  const cellsList = Object.values(mapDef.cells);
  const maxRow = Math.max(...cellsList.map((c) => c.row), 5);
  const maxCol = Math.max(...cellsList.map((c) => c.col), 5);

  const mapImageUrls: Record<string, string> = {
    'annoyed-animals': '/images/maps/annoyed-animals.jpg',
    'clumsy-cultists': '/images/maps/clumsy-cultists.jpg',
    'puzzled-pyramid': '/images/maps/puzzled-pyramid.jpg',
    'defiant-dinosaurs': '/images/maps/defiant-dinosaurs.jpg',
  };
  const mapImageUrl = mapImageUrls[mapDef.id] || '/images/maps/annoyed-animals.jpg';

  // Calculate percentage coordinates for nodes in organic square graph
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
        backgroundColor: '#0a0f1d',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%',
      }}
    >
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            🏰
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              {mapDef.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(245, 158, 11, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                {mapDef.difficulty} Realm
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                • {cellsList.length} Connected Rooms
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Optional Background Art Toggle */}
          <button
            type="button"
            onClick={() => setShowBgArt(!showBgArt)}
            style={{
              backgroundColor: showBgArt ? 'rgba(245, 158, 11, 0.2)' : '#1e293b',
              border: showBgArt ? '1px solid #f59e0b' : '1px solid #334155',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: showBgArt ? '#f59e0b' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
            }}
          >
            <span>🎨</span>
            <span>{showBgArt ? 'Hide Background Art' : 'Show Background Art'}</span>
          </button>

          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', background: '#1e293b', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 600 }}>
            Progress: <strong style={{ color: '#10b981' }}>{playerState.visitedCellIds.length}</strong> / {cellsList.length} Rooms Marked
          </div>
        </div>
      </div>

      {/* Main Dungeon Organic Square Tile Graph Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1.45 / 1',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.8)',
          backgroundColor: '#060a12',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(6, 10, 18, 0.95) 100%)',
        }}
      >
        {/* Optional Subdue Map Background Artwork */}
        {showBgArt && (
          <img
            src={mapImageUrl}
            alt={`${mapDef.name} Map Art`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.22,
              filter: 'contrast(1.1) saturate(0.8)',
            }}
          />
        )}

        {/* Subtle Dungeon Floor Grid Texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />

        {/* SVG Organic Connection Pathway Lines */}
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
            const isHoveredPath = hoveredCellId === edge.fromId || hoveredCellId === edge.toId;
            const isSelectedPath = selectedCellId === edge.fromId || selectedCellId === edge.toId;

            let strokeColor = 'rgba(148, 163, 184, 0.35)';
            let strokeWidth = '0.35';

            if (isVisitedPath) {
              strokeColor = '#10b981';
              strokeWidth = '0.65';
            } else if (isHoveredPath || isSelectedPath) {
              strokeColor = '#fbbf24';
              strokeWidth = '0.65';
            }

            return (
              <line
                key={`${edge.fromId}-${edge.toId}`}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                style={{
                  transition: 'stroke 0.2s, stroke-width 0.2s',
                  filter: isHoveredPath || isSelectedPath ? 'drop-shadow(0 0 4px #fbbf24)' : isVisitedPath ? 'drop-shadow(0 0 3px #10b981)' : 'none',
                }}
              />
            );
          })}
        </svg>

        {/* Interactive Organic Square Room Tiles Layer */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
          {cellsList.map((cell) => {
            const isVisited = playerState.visitedCellIds.includes(cell.id);
            const isSelected = selectedCellId === cell.id;
            const isHovered = hoveredCellId === cell.id;
            const coords = getNodeCoords(cell);

            // Styling defaults (Regular Rooms - Stone Gray Tile)
            let background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
            let borderColor = '#475569';
            let textColor = '#f8fafc';
            let subIcon = '';
            let boxShadow = '0 3px 8px rgba(0, 0, 0, 0.7)';

            if (cell.type === 'START') {
              background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              borderColor = '#34d399';
              textColor = '#ffffff';
              boxShadow = '0 3px 12px rgba(16, 185, 129, 0.4)';
            } else if (cell.type === 'GRAY_ACTIVATION') {
              background = 'linear-gradient(135deg, #334155 0%, #1e293b 100%)';
              borderColor = '#94a3b8';
              textColor = '#f3f4f6';
              subIcon = '⭐';
              boxShadow = '0 3px 10px rgba(148, 163, 184, 0.3)';
            } else if (cell.type === 'CHEST') {
              background = 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)';
              borderColor = '#fde68a';
              textColor = '#ffffff';
              subIcon = '📦';
              boxShadow = '0 3px 14px rgba(245, 158, 11, 0.45)';
            } else if (cell.type === 'MONSTER') {
              background = 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)';
              borderColor = '#fca5a5';
              textColor = '#ffffff';
              subIcon = '⚔️';
              boxShadow = '0 3px 14px rgba(239, 68, 68, 0.55)';
            }

            if (cell.requiresEqualDice && !subIcon) {
              subIcon = '⚂=⚂';
            }

            if (isVisited) {
              background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
              borderColor = '#34d399';
              textColor = '#ffffff';
              boxShadow = '0 0 15px rgba(16, 185, 129, 0.6)';
            }

            if (isSelected) {
              borderColor = '#fbbf24';
              boxShadow = '0 0 20px rgba(251, 191, 36, 1), inset 0 0 8px rgba(251, 191, 36, 0.4)';
            } else if (isHovered && !isVisited) {
              borderColor = '#fde68a';
              boxShadow = '0 0 16px rgba(251, 191, 36, 0.8)';
            }

            const isMonsterNode = cell.type === 'MONSTER' && cell.monsterLifeBoxes;
            const tileWidth = isMonsterNode ? '80px' : '36px';

            return (
              <button
                key={cell.id}
                type="button"
                disabled={disabled || isVisited}
                onClick={() => onSelectCell && onSelectCell(cell.id)}
                onMouseEnter={() => setHoveredCellId(cell.id)}
                onMouseLeave={() => setHoveredCellId(null)}
                style={{
                  position: 'absolute',
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  transform: `translate(-50%, -50%) ${isHovered || isSelected ? 'scale(1.15)' : 'scale(1)'}`,
                  width: tileWidth,
                  height: '36px',
                  borderRadius: '7px',
                  background: background,
                  border: isSelected ? '2.5px solid #fbbf24' : `2px solid ${borderColor}`,
                  boxShadow: boxShadow,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: !isVisited && !disabled ? 'pointer' : 'default',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: isSelected ? 30 : isHovered ? 25 : isVisited ? 15 : 10,
                  opacity: disabled ? 0.6 : 1,
                  padding: '2px 4px',
                  userSelect: 'none',
                }}
                title={`${cell.label || cell.type} ${cell.requiresEqualDice ? '(Requires Equal Dice)' : ''} ${cell.value ? `(Sum: ${cell.value})` : ''}`}
              >
                {isVisited ? (
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>✓</span>
                ) : isMonsterNode ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#fecaca', whiteSpace: 'nowrap' }}>
                      ⚔️ {cell.label}
                    </span>
                    <div style={{ display: 'flex', gap: '3px', marginTop: '1px' }}>
                      {cell.monsterLifeBoxes?.map((b) => (
                        <span key={b.cellId} style={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(0,0,0,0.4)', padding: '0 3px', borderRadius: '3px', color: '#fff' }}>
                          {b.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', pointerEvents: 'none' }}>
                    <span style={{ fontSize: subIcon ? '0.85rem' : '0.95rem', fontWeight: 900, fontFamily: "'Inter', monospace, sans-serif", color: textColor, lineHeight: 1, textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                      {cell.value ?? (cell.type === 'START' ? 'S' : '—')}
                    </span>
                    {subIcon && (
                      <span style={{ fontSize: '0.55rem', lineHeight: 1, marginTop: '1px', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))', fontWeight: 700, color: cell.requiresEqualDice ? '#fbbf24' : '#ffffff' }}>
                        {subIcon}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Legend Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.75rem', flexWrap: 'wrap', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', background: '#131c31', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: '1px solid #34d399', boxShadow: '0 2px 5px rgba(16, 185, 129, 0.3)' }} />
          <span>Start Room (Green)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #64748b' }} />
          <span>Regular Room</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)', border: '1px solid #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>⭐</div>
          <span>Gray Star Activation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>📦</div>
          <span>Treasure Chest</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>⚔️</div>
          <span>Monster Box</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#059669', border: '1px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 900 }}>✓</div>
          <span>Visited</span>
        </div>
      </div>
    </div>
  );
};
