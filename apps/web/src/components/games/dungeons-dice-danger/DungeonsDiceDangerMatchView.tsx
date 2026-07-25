import React, { useState } from 'react';
import {
  DungeonsDiceDangerGameState,
  DungeonsDiceDangerAction,
  PairSubmission,
  getMapDefinition,
} from '@boardgametime/game-dungeons-dice-danger';
import { DungeonSheet } from './DungeonSheet';
import { DicePairSelector } from './DicePairSelector';
import { PlayerTrackerCard } from './PlayerTrackerCard';

interface DungeonsDiceDangerMatchViewProps {
  matchId: string;
  gameState: DungeonsDiceDangerGameState;
  currentUserId: string;
  onSendAction: (actionType: string, actionPayload: unknown) => void;
  players: Array<{ userId: string; username: string }>;
}

export const DungeonsDiceDangerMatchView: React.FC<DungeonsDiceDangerMatchViewProps> = ({
  matchId,
  gameState,
  currentUserId,
  onSendAction,
  players,
}) => {
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const mapDef = getMapDefinition(gameState.mapId);
  const currentUserState = gameState.playerStates[currentUserId];
  const isActivePlayer = gameState.activePlayerId === currentUserId;
  const activeUser = players.find((p) => p.userId === gameState.activePlayerId);

  const hasSubmitted = !!gameState.pendingSubmissions[currentUserId];

  const handleRollDice = () => {
    onSendAction('ROLL_DICE', {});
  };

  const handleSubmitPairs = (submission: PairSubmission) => {
    onSendAction('SUBMIT_PAIRS', { submission });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
            Round {gameState.round}
          </span>
          <h1 className="text-2xl font-black text-slate-100 flex items-center space-x-2">
            <span>Dungeons, Dice & Danger</span>
          </h1>
        </div>

        {/* Phase Action Callout */}
        <div className="flex items-center space-x-4">
          {gameState.phase === 'ROLLING' && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-300">
                Active Player:{' '}
                <strong className="text-amber-400 font-semibold">
                  {activeUser?.username || gameState.activePlayerId}
                </strong>
              </span>
              {isActivePlayer ? (
                <button
                  onClick={handleRollDice}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  🎲 Roll 5 Dice
                </button>
              ) : (
                <span className="text-xs px-3 py-1 bg-slate-800 text-slate-400 rounded-lg animate-pulse">
                  Waiting for roll...
                </span>
              )}
            </div>
          )}

          {gameState.phase === 'SUBMITTING_PAIRS' && (
            <div className="text-sm text-amber-300 font-medium">
              {hasSubmitted ? '✓ Submitted! Waiting for other players...' : 'Select 2 pairs for this round'}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dungeon Sheet */}
        <div className="lg:col-span-2 space-y-6">
          <DungeonSheet
            mapDef={mapDef}
            playerState={currentUserState}
            selectedCellId={selectedCellId}
            onSelectCell={(cellId) => setSelectedCellId(cellId)}
          />
        </div>

        {/* Right Col: Dice Selector & Players List */}
        <div className="space-y-6">
          {gameState.phase === 'SUBMITTING_PAIRS' && gameState.currentRoll && !hasSubmitted && (
            <DicePairSelector
              roll={gameState.currentRoll}
              isActivePlayer={isActivePlayer}
              blackDieCharges={currentUserState.blackDieCharges}
              onSubmitPairs={handleSubmitPairs}
            />
          )}

          {/* Player Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Players ({players.length})
            </h3>
            {players.map((p) => {
              const pState = gameState.playerStates[p.userId];
              if (!pState) return null;
              return (
                <PlayerTrackerCard
                  key={p.userId}
                  playerState={pState}
                  username={p.username}
                  isActivePlayer={p.userId === gameState.activePlayerId}
                  isCurrentUser={p.userId === currentUserId}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Final Game Scoring Modal */}
      {gameState.isComplete && gameState.lastScoringResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-amber-500/50 p-6 rounded-2xl max-w-md w-full text-slate-100 shadow-2xl space-y-4">
            <h2 className="text-2xl font-black text-center text-amber-400">🏆 Game Completed!</h2>
            <div className="text-center text-sm text-slate-300">
              Winner:{' '}
              <span className="text-emerald-400 font-bold">
                {players.find((p) => p.userId === gameState.winnerPlayerId)?.username ||
                  gameState.winnerPlayerId}
              </span>
            </div>

            <div className="space-y-2 py-2">
              {Object.entries(gameState.lastScoringResult.breakdown).map(([pid, b]) => (
                <div
                  key={pid}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-sm"
                >
                  <span className="font-semibold text-slate-200">
                    {players.find((p) => p.userId === pid)?.username || pid}
                  </span>
                  <span className="font-bold text-amber-400">{b.totalVP} VP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
