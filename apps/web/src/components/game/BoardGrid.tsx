import React from 'react';
import { BoardCellComponent } from './BoardCellComponent';
import { BoardCell, KingdomsPlayerState } from '@boardgametime/game-kingdoms';

export interface BoardGridProps {
  board: BoardCell[][]; // 6 rows x 5 columns
  players: Record<string, KingdomsPlayerState>;
  isMyTurn: boolean;
  onCellClick: (row: number, col: number) => void;
  selectedActionText?: string;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  board,
  players,
  isMyTurn,
  onCellClick,
  selectedActionText,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gap: '8px',
        backgroundColor: '#020617',
        padding: '12px',
        borderRadius: '16px',
        border: '2px solid rgba(245, 158, 11, 0.3)',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9), 0 10px 30px rgba(0,0,0,0.5)',
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
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
          />
        ))
      )}
    </div>
  );
};
