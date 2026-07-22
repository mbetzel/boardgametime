import React from 'react';
import { BoardCellComponent } from './BoardCellComponent';
import { SelectedActionType } from './PlayerHandControls';
import { BoardCell, KingdomsPlayerState, Tile } from '@boardgametime/game-kingdoms';

export interface BoardGridProps {
  board: BoardCell[][]; // 6 rows x 5 columns
  players: Record<string, KingdomsPlayerState>;
  isMyTurn: boolean;
  onCellClick: (row: number, col: number) => void;
  selectedActionText?: string;
  selectedAction?: SelectedActionType;
  nextDrawTile?: Tile | null;
  secretTile?: Tile | null;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  board,
  players,
  isMyTurn,
  onCellClick,
  selectedActionText,
  selectedAction,
  nextDrawTile,
  secretTile,
}) => {
  let selectedTilePreview: Tile | null = null;
  if (selectedAction?.kind === 'DRAW_TILE') {
    selectedTilePreview = nextDrawTile ?? null;
  } else if (selectedAction?.kind === 'SECRET_TILE') {
    selectedTilePreview = secretTile ?? null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        backgroundColor: '#020617',
        padding: '1rem',
        borderRadius: '16px',
        border: '2px solid rgba(245, 158, 11, 0.3)',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9), 0 10px 30px rgba(0,0,0,0.5)',
        width: '100%',
      }}
    >
      {/* Column Headers: C1..C5 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', paddingLeft: '0px', textAlign: 'center' }}>
        {[1, 2, 3, 4, 5].map((colNum) => (
          <div key={colNum} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            COL {colNum}
          </div>
        ))}
      </div>

      {/* 5x6 Board Grid: 6 rows x 5 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: '8px',
          width: '100%',
        }}
      >
        {board.map((rowCells, rIdx) =>
          rowCells.map((cell, cIdx) => (
            <BoardCellComponent
              key={`${rIdx}-${cIdx}`}
              row={rIdx}
              col={cIdx}
              cell={cell}
              players={players}
              isMyTurn={isMyTurn}
              isValidTarget={cell.type === 'EMPTY'}
              onCellClick={onCellClick}
              hoverActionText={selectedActionText}
              selectedAction={selectedAction}
              selectedTilePreview={selectedTilePreview}
            />
          ))
        )}
      </div>
    </div>
  );
};
