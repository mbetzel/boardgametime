import React from 'react';
import { PlayerSheetState } from '@boardgametime/game-dungeons-dice-danger';

interface PlayerTrackerCardProps {
  playerState: PlayerSheetState;
  username: string;
  isActivePlayer: boolean;
  isCurrentUser: boolean;
}

export const PlayerTrackerCard: React.FC<PlayerTrackerCardProps> = ({
  playerState,
  username,
  isActivePlayer,
  isCurrentUser,
}) => {
  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isActivePlayer
          ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10'
          : 'bg-slate-900/60 border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isActivePlayer ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          <span className="font-semibold text-slate-100 text-sm">
            {username} {isCurrentUser && '(You)'}
          </span>
        </div>
        {isActivePlayer && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
            Active Roller
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Health Track */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="text-slate-400 mb-1 flex justify-between">
            <span>Health</span>
            <span className="text-red-400 font-mono font-bold">{playerState.health} HP</span>
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-sm ${
                  i < playerState.health ? 'bg-emerald-500' : 'bg-rose-950 border border-rose-900/50'
                }`}
              />
            ))}
          </div>
          {playerState.skullsCrossed > 0 && (
            <span className="text-[10px] text-rose-400 mt-1 block">
              💀 {playerState.skullsCrossed} Skulls (-{playerState.skullsCrossed} VP)
            </span>
          )}
        </div>

        {/* Abilities & Treasures */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span>🎲 Black Die:</span>
            <span className="font-bold text-amber-400">{playerState.blackDieCharges} uses</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>🔦 Torches:</span>
            <span className="font-bold text-orange-400">{playerState.torches}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>💎 Gems:</span>
            <span className="font-bold text-cyan-400">{playerState.gems} ({playerState.gems * 3} VP)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
