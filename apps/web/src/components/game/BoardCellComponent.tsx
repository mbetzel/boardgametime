import React from 'react';
import { BoardCell, KingdomsPlayerState, Tile } from '@boardgametime/game-kingdoms';
import { SelectedActionType } from './PlayerHandControls';

export interface BoardCellComponentProps {
  row: number;
  col: number;
  cell: BoardCell;
  players: Record<string, KingdomsPlayerState>;
  isMyTurn: boolean;
  isValidTarget: boolean;
  onCellClick: (row: number, col: number) => void;
  hoverActionText?: string;
  selectedAction?: SelectedActionType;
  selectedTilePreview?: Tile | null;
}

export interface TileStyle {
  bg: string;
  border: string;
  borderColor: string;
  glowColor: string;
  icon: string;
  textColor: string;
  label: string;
  valueText: string;
}

export function getTileStyle(tile: Tile): TileStyle {
  let bg = '#1e293b';
  let border = '1px solid #475569';
  let borderColor = '#475569';
  let glowColor = 'rgba(245, 158, 11, 0.4)';
  let icon = '📜';
  let textColor = '#f8fafc';
  let label = tile.name;
  let valueText = `${tile.value}`;

  switch (tile.type as string) {
    case 'RESOURCE':
      bg = 'rgba(59, 130, 246, 0.25)';
      border = '2px solid #3b82f6';
      borderColor = '#3b82f6';
      glowColor = 'rgba(59, 130, 246, 0.5)';
      icon = '📜';
      textColor = '#60a5fa';
      label = tile.name || 'Resource';
      valueText = tile.value > 0 ? `+${tile.value}` : `${tile.value}`;
      break;
    case 'HAZARD':
      bg = 'rgba(239, 68, 68, 0.25)';
      border = '2px solid #ef4444';
      borderColor = '#ef4444';
      glowColor = 'rgba(239, 68, 68, 0.5)';
      icon = '💥';
      textColor = '#f87171';
      label = tile.name || 'Hazard';
      valueText = `${tile.value}`;
      break;
    case 'GOLD_MINE':
      bg = 'rgba(245, 158, 11, 0.3)';
      border = '2px solid #f59e0b';
      borderColor = '#f59e0b';
      glowColor = 'rgba(245, 158, 11, 0.5)';
      icon = '🪙';
      textColor = '#f59e0b';
      label = tile.name || 'Gold Mine';
      valueText = 'Gold Mine';
      break;
    case 'MOUNTAIN':
      bg = 'rgba(100, 116, 139, 0.4)';
      border = '2px solid #64748b';
      borderColor = '#64748b';
      glowColor = 'rgba(100, 116, 139, 0.5)';
      icon = '🏔️';
      textColor = '#cbd5e1';
      label = tile.name || 'Mountain';
      valueText = 'Mountain';
      break;
    case 'DRAGON':
      bg = 'rgba(168, 85, 247, 0.3)';
      border = '2px solid #a855f7';
      borderColor = '#a855f7';
      glowColor = 'rgba(168, 85, 247, 0.5)';
      icon = '🐉';
      textColor = '#c084fc';
      label = tile.name || 'Dragon';
      valueText = 'Dragon';
      break;
    case 'WIZARD':
      bg = 'rgba(236, 72, 153, 0.3)';
      border = '2px solid #ec4899';
      borderColor = '#ec4899';
      glowColor = 'rgba(236, 72, 153, 0.5)';
      icon = '🧙‍♂️';
      textColor = '#f472b6';
      label = tile.name || 'Wizard';
      valueText = 'Wizard';
      break;
  }

  return { bg, border, borderColor, glowColor, icon, textColor, label, valueText };
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
  selectedAction,
  selectedTilePreview,
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
        if (selectedAction?.kind === 'CASTLE') {
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                opacity: 0.8,
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 14px rgba(245, 158, 11, 0.6)',
                  border: '2px dashed #f59e0b',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1rem',
                }}
              >
                🏰{selectedAction.rank}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                Rank {selectedAction.rank}
              </span>
            </div>
          );
        }

        if (
          (selectedAction?.kind === 'DRAW_TILE' || selectedAction?.kind === 'SECRET_TILE') &&
          selectedTilePreview
        ) {
          const tileStyle = getTileStyle(selectedTilePreview);
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                backgroundColor: tileStyle.bg,
                border: `2px dashed ${tileStyle.borderColor}`,
                borderRadius: '8px',
                padding: '2px',
                opacity: 0.8,
                boxShadow: `0 0 12px ${tileStyle.glowColor}`,
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{tileStyle.icon}</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: tileStyle.textColor,
                  textAlign: 'center',
                  lineHeight: 1.1,
                }}
              >
                {tileStyle.label}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: tileStyle.textColor }}>
                {tileStyle.valueText}
              </span>
            </div>
          );
        }

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
      const tileStyle = getTileStyle(cell.tile);
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: tileStyle.bg,
            border: tileStyle.border,
            borderRadius: '8px',
            padding: '2px',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>{tileStyle.icon}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: tileStyle.textColor }}>
            {tileStyle.valueText}
          </span>
        </div>
      );
    }

    return null;
  };

  const getCellBackground = () => {
    if (cell.type !== 'EMPTY') return 'rgba(30, 41, 59, 0.7)';
    if (isHovered && isValidTarget && isMyTurn) {
      if (selectedTilePreview) {
        return getTileStyle(selectedTilePreview).bg;
      }
      return 'rgba(245, 158, 11, 0.25)';
    }
    return 'rgba(15, 23, 42, 0.85)';
  };

  const getCellBoxShadow = () => {
    if (isHovered && isValidTarget && isMyTurn) {
      if (selectedTilePreview) {
        return `0 0 15px ${getTileStyle(selectedTilePreview).glowColor}`;
      }
      return '0 0 15px rgba(245, 158, 11, 0.4)';
    }
    return 'none';
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
        boxShadow: getCellBoxShadow(),
      }}
    >
      {renderCellContent()}
    </div>
  );
};
