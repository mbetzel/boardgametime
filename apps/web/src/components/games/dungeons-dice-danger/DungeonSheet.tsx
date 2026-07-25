import React from 'react';
import { DungeonMapDefinition, MapCell, PlayerSheetState } from '@boardgametime/game-dungeons-dice-danger';

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
    <div className="bg-slate-900/95 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>🏰 Map: {mapDef.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {mapDef.difficulty}
            </span>
          </h2>
        </div>
        <div className="text-xs text-slate-400">
          Visited: <span className="text-emerald-400 font-bold">{playerState.visitedCellIds.length}</span> spaces
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="overflow-x-auto py-2">
        <div
          className="grid gap-3 min-w-[500px]"
          style={{
            gridTemplateRows: `repeat(${maxRow + 1}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${maxCol + 1}, minmax(0, 1fr))`,
          }}
        >
          {cellsList.map((cell) => {
            const isVisited = playerState.visitedCellIds.includes(cell.id);
            const isSelected = selectedCellId === cell.id;

            let bgColor = 'bg-slate-800 border-slate-700 text-slate-200';
            if (cell.type === 'START') {
              bgColor = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
            } else if (cell.type === 'GRAY_ACTIVATION') {
              bgColor = 'bg-slate-700/80 border-slate-400 text-slate-100';
            } else if (cell.type === 'CHEST') {
              bgColor = 'bg-amber-950/80 border-amber-500 text-amber-300';
            } else if (cell.type === 'MONSTER') {
              bgColor = 'bg-rose-950/80 border-rose-600 text-rose-300';
            }

            if (isVisited) {
              bgColor = 'bg-slate-900 border-emerald-500 text-emerald-400 opacity-60 line-through';
            }

            if (isSelected) {
              bgColor += ' ring-4 ring-amber-400 scale-105 z-10 shadow-lg';
            }

            return (
              <button
                key={cell.id}
                disabled={disabled || isVisited}
                onClick={() => onSelectCell && onSelectCell(cell.id)}
                style={{
                  gridRowStart: cell.row + 1,
                  gridColumnStart: cell.col + 1,
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all min-h-[70px] ${bgColor} ${
                  !isVisited && !disabled ? 'hover:scale-105 hover:border-amber-400 cursor-pointer' : ''
                }`}
              >
                <span className="text-xs font-bold font-mono">{cell.label || cell.value}</span>
                {cell.type === 'CHEST' && <span className="text-base mt-0.5">📦</span>}
                {cell.type === 'MONSTER' && <span className="text-base mt-0.5">🐉</span>}
                {cell.requiresActivationCellId && (
                  <span className="text-[9px] text-slate-400 mt-0.5">🔒 Req Gray</span>
                )}
                {isVisited && <span className="text-xs text-emerald-400 font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
