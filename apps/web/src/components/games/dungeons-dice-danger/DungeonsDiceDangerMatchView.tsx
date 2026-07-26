import React, { useState } from 'react';
import {
  DungeonsDiceDangerGameState,
  PairSubmission,
  getMapDefinition,
} from '@boardgametime/game-dungeons-dice-danger';
import { MatchEventDTO } from '@boardgametime/types';
import { DungeonSheet } from './DungeonSheet';
import { DicePairSelector } from './DicePairSelector';
import { PlayerTrackerCard } from './PlayerTrackerCard';
import { TurnHistoryLog } from '../../game/TurnHistoryLog';
import { TurnConfirmationBar } from '../../game/TurnConfirmationBar';
import { Button } from '../../ui/Button';

interface DungeonsDiceDangerMatchViewProps {
  matchId: string;
  gameState: DungeonsDiceDangerGameState;
  currentUserId: string;
  onSendAction: (actionType: string, actionPayload: unknown) => void;
  players: Array<{ userId: string; username: string; avatarUrl?: string | null }>;
  events?: MatchEventDTO[];
}

export const DungeonsDiceDangerMatchView: React.FC<DungeonsDiceDangerMatchViewProps> = ({
  matchId,
  gameState,
  currentUserId,
  onSendAction,
  players,
  events = [],
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
    <main
      style={{
        flex: 1,
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Top Game Banner / Header Bar */}
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Round {gameState.round}
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Dungeons, Dice & Danger</span>
          </h1>
        </div>

        {/* Phase Roll & Submissions Callout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {gameState.phase === 'ROLLING' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                Active Roller:{' '}
                <strong style={{ color: '#f59e0b' }}>
                  {activeUser?.username || gameState.activePlayerId}
                </strong>
              </span>
              {isActivePlayer ? (
                <Button variant="gold" size="md" onClick={handleRollDice}>
                  🎲 Roll 5 Dice
                </Button>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: '#0f172a', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                  Waiting for active player roll...
                </span>
              )}
            </div>
          )}

          {gameState.phase === 'SUBMITTING_PAIRS' && (
            <div style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700 }}>
              {hasSubmitted ? '✓ Submitted! Waiting for other players...' : 'Select 2 pairs for this round'}
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Game Layout (Wireframe Page 5 - Board Left, Players & Log Right) */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Section: Main Game Board (DungeonSheet) & Dice Pair Selector */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <DungeonSheet
            mapDef={mapDef}
            playerState={currentUserState}
            selectedCellId={selectedCellId}
            onSelectCell={(cellId) => setSelectedCellId(cellId)}
          />

          {gameState.phase === 'SUBMITTING_PAIRS' && gameState.currentRoll && !hasSubmitted && (
            <DicePairSelector
              roll={gameState.currentRoll}
              isActivePlayer={isActivePlayer}
              blackDieCharges={currentUserState.blackDieCharges}
              onSubmitPairs={handleSubmitPairs}
            />
          )}

          {gameState.phase === 'SUBMITTING_PAIRS' && hasSubmitted && (
            <TurnConfirmationBar
              message="Pairs selected! Click Confirm to finalize your move or Cancel to reset your selection for this round."
              onConfirm={() => onSendAction('CONFIRM_TURN', {})}
              onCancel={() => onSendAction('CANCEL_TURN', {})}
            />
          )}
        </div>

        {/* Right Sidebar Section: Player Status Cards & Turn History Log */}
        <div style={{ flex: '1 1 340px', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              👥 Player Status ({players.length})
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
                  avatarUrl={p.avatarUrl}
                />
              );
            })}
          </div>

          <TurnHistoryLog
            events={events}
            players={players.map((p, idx) => ({
              id: p.userId,
              matchId,
              userId: p.userId,
              username: p.username,
              seatIndex: idx,
              avatarUrl: p.avatarUrl || null,
            }))}
          />
        </div>
      </div>

      {/* Final Game Completion Modal */}
      {gameState.isComplete && gameState.lastScoringResult && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
          <div style={{ backgroundColor: '#0f172a', border: '2px solid #f59e0b', borderRadius: '16px', padding: '1.5rem', maxWidth: '450px', width: '100%', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, textAlign: 'center', color: '#f59e0b', margin: '0 0 0.5rem 0' }}>
              🏆 Game Completed!
            </h2>
            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>
              Winner:{' '}
              <strong style={{ color: '#34d399' }}>
                {players.find((p) => p.userId === gameState.winnerPlayerId)?.username ||
                  gameState.winnerPlayerId}
              </strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0' }}>
              {Object.entries(gameState.lastScoringResult.breakdown).map(([pid, b]) => (
                <div
                  key={pid}
                  style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {players.find((p) => p.userId === pid)?.username || pid}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fbbf24' }}>
                    {b.totalVP} VP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
