import React from 'react';
import { BoardCell, KingdomsPlayerState } from '@boardgametime/game-kingdoms';

export interface BoardCellComponentProps {
  row: number;
  col: number;
  cell: BoardCell;
  players: Record<string, KingdomsPlayerState>;
  isMyTurn: boolean;
  isValidTarget: boolean;
  onCellClick: (row: number, col: number) => void;
  hoverActionText?: string;
}

export const BoardCellComponent: React.FC<BoardCellComponentProps> = ({
  row,
  col,
  cell,
  players,
  isMyTurn,
  isValidTarget,
  onCellClick,
  hoverActionText,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    if (isValidTarget && isMyTurn) {
      onCellClick(row, col);
    }
  };

  const renderCellContent = () => {
    if (cell.type === 'EMPTY') {
      if (isHovered && isValidTarget && isMyTurn) {
        return (
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#f59e0b',
              textAlign: 'center',
              padding: '0.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {hoverActionText || 'PLACE HERE'}
          </div>
        );
      }
      return null;
    }

    if (cell.type === 'CASTLE') {
      const owner = players[cell.playerId];
      const playerColor = owner?.color || '#f59e0b';
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: playerColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 14px ${playerColor}99`,
              border: '2px solid #ffffff',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1rem',
            }}
          >
            🏰{cell.rank}
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            Rank {cell.rank}
          </span>
        </div>
      );
    }

    if (cell.type === 'TILE') {
      const { tile } = cell;
      let bg = '#1e293b';
      let border = '1px solid #475569';
      let icon = '📜';
      let textColor = '#f8fafc';
      let label = tile.name;

      switch (tile.type) {
        case 'RESOURCE':
          bg = 'rgba(59, 130, 246, 0.25)';
          border = '2px solid #3b82f6';
          icon = '🌾';
          textColor = '#60a5fa';
          label = `+${tile.value}`;
          break;
        case 'HAZARD':
          bg = 'rgba(239, 68, 68, 0.25)';
          border = '2px solid #ef4444';
          icon = '⚔️';
          textColor = '#f87171';
          label = `${tile.value}`;
          break;
        case 'GOLD_MINE':
          bg = 'rgba(245, 158, 11, 0.3)';
          border = '2px solid #f59e0b';
          icon = '🪙';
          textColor = '#f59e0b';
          label = 'x2 MINE';
          break;
        case 'MOUNTAIN':
          bg = 'rgba(100, 116, 139, 0.4)';
          border = '2px solid #64748b';
          icon = '🏔️';
          textColor = '#cbd5e1';
          label = 'WALL';
          break;
        case 'DRAGON':
          bg = 'rgba(168, 85, 247, 0.3)';
          border = '2px solid #a855f7';
          icon = '🐉';
          textColor = '#c084fc';
          label = 'DRAGON';
          break;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: bg,
            border,
            borderRadius: '8px',
            padding: '2px',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>{icon}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: textColor }}>{label}</span>
        </div>
      );
    }

    return null;
  };

  const getCellBackground = () => {
    if (cell.type !== 'EMPTY') return 'rgba(30, 41, 59, 0.7)';
    if (isHovered && isValidTarget && isMyTurn) return 'rgba(245, 158, 11, 0.25)';
    return 'rgba(15, 23, 42, 0.85)';
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        aspectRatio: '1',
        minHeight: '75px',
        backgroundColor: getCellBackground(),
        border: isHovered && isValidTarget && isMyTurn ? '2px dashed #f59e0b' : '1px solid #334155',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isValidTarget && isMyTurn && cell.type === 'EMPTY' ? 'pointer' : 'default',
        transition: 'all 0.15s ease-in-out',
        position: 'relative',
        userSelect: 'none',
        boxShadow: isHovered && isValidTarget && isMyTurn ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none',
      }}
    >
      {renderCellContent()}
    </div>
  );
};
