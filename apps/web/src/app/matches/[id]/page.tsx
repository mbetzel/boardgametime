'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { GameHeader } from '../../../components/game/GameHeader';
import { BoardGrid } from '../../../components/game/BoardGrid';
import { PlayerHandControls, SelectedActionType } from '../../../components/game/PlayerHandControls';
import { PlayerStatusCards } from '../../../components/game/PlayerStatusCards';
import { TurnHistoryLog } from '../../../components/game/TurnHistoryLog';
import { ScoringBreakdownModal } from '../../../components/game/ScoringBreakdownModal';
import { Button } from '../../../components/ui/Button';
import { Header } from '../../../components/ui/Header';
import { getMatch, submitAction, getMatchEvents, getStoredUser, removeAuthToken } from '../../../lib/api';
import { getMatchSocket } from '../../../lib/socket';
import { MatchDTO, MatchEventDTO, UserDTO } from '@boardgametime/types';
import { KingdomsGameState, GameScoringSummary, Tile } from '@boardgametime/game-kingdoms';
import { DungeonsDiceDangerGameState } from '@boardgametime/game-dungeons-dice-danger';
import { DungeonsDiceDangerMatchView } from '../../../components/games/dungeons-dice-danger/DungeonsDiceDangerMatchView';
import { TurnConfirmationBar } from '../../../components/game/TurnConfirmationBar';
import { MatchChatWidget } from '../../../components/game/MatchChatWidget';

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.id as string;

  const [match, setMatch] = useState<MatchDTO | null>(null);
  const [events, setEvents] = useState<MatchEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedAction, setSelectedAction] = useState<SelectedActionType>(null);
  const [scoringModalOpen, setScoringModalOpen] = useState(false);
  const [lastScoring, setLastScoring] = useState<GameScoringSummary | null>(null);
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(null);

  const lastSeenScoringEpochRef = useRef<number>(0);

  const currentUserId = currentUser?.id;

  const handleSignOut = () => {
    removeAuthToken();
    setCurrentUser(null);
    router.push('/');
  };

  const updateMatchData = useCallback((updatedMatch: MatchDTO) => {
    setMatch(updatedMatch);
    const state = updatedMatch.stateSnapshot as KingdomsGameState;
    if (state?.lastScoringResult) {
      setLastScoring(state.lastScoringResult);
      if (state.lastScoringResult.epoch > lastSeenScoringEpochRef.current) {
        lastSeenScoringEpochRef.current = state.lastScoringResult.epoch;
        setScoringModalOpen(true);
      }
    }
  }, []);

  // Load initial match data & turn history events
  useEffect(() => {
    setCurrentUser(getStoredUser());

    if (!matchId) return;

    const loadMatchData = async () => {
      try {
        const [matchData, matchEvents] = await Promise.all([
          getMatch(matchId),
          getMatchEvents(matchId).catch(() => []),
        ]);

        setMatch(matchData);
        setEvents(matchEvents);

        const state = matchData.stateSnapshot as KingdomsGameState;
        if (state?.lastScoringResult) {
          setLastScoring(state.lastScoringResult);
          lastSeenScoringEpochRef.current = state.lastScoringResult.epoch;
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load match');
      } finally {
        setLoading(false);
      }
    };

    loadMatchData();
  }, [matchId]);

  // Socket.IO real-time listener
  useEffect(() => {
    if (!matchId) return;

    const socket = getMatchSocket();
    socket.emit('join_match', matchId);

    const handleMatchUpdated = (updatedMatch: MatchDTO) => {
      if (updatedMatch.id === matchId) {
        updateMatchData(updatedMatch);
      }
    };

    const handleActionApplied = (event: MatchEventDTO) => {
      setEvents((prev) => {
        if (prev.some((e) => e.id === event.id || e.sequenceNum === event.sequenceNum)) {
          return prev;
        }
        return [event, ...prev];
      });
    };

    const handleError = (data: { message: string }) => {
      setError(data.message);
    };

    socket.on('match_updated', handleMatchUpdated);
    socket.on('action_applied', handleActionApplied);
    socket.on('error', handleError);

    return () => {
      socket.emit('leave_match', matchId);
      socket.off('match_updated', handleMatchUpdated);
      socket.off('action_applied', handleActionApplied);
      socket.off('error', handleError);
    };
  }, [matchId, updateMatchData]);

  const kingdomsGameState = match?.gameId === 'kingdoms' ? (match.stateSnapshot as KingdomsGameState) : undefined;
  const isKingdomsMyTurn = kingdomsGameState?.activePlayerId === currentUserId;
  const pendingDrawnTile = kingdomsGameState?.pendingDrawnTile;

  useEffect(() => {
    if (isKingdomsMyTurn && pendingDrawnTile && selectedAction?.kind !== 'DRAW_TILE') {
      setSelectedAction({ kind: 'DRAW_TILE' });
    }
  }, [isKingdomsMyTurn, pendingDrawnTile, selectedAction]);

  const renderTopBanner = () => (
    <Header user={currentUser} onSignOut={handleSignOut} />
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        {renderTopBanner()}
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', fontWeight: 600 }}>Loading match board...</p>
        </main>
      </div>
    );
  }

  if (!match) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        {renderTopBanner()}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <p style={{ color: '#f87171', fontSize: '1.2rem', fontWeight: 700 }}>{error || 'Match not found'}</p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#f59e0b',
              color: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            Return to Home
          </button>
        </main>
      </div>
    );
  }

  if (match.gameId === 'dungeons-dice-danger') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        {renderTopBanner()}
        <DungeonsDiceDangerMatchView
          matchId={matchId}
          gameState={match.stateSnapshot as DungeonsDiceDangerGameState}
          currentUserId={currentUserId || ''}
          onSendAction={async (actionType, actionPayload) => {
            try {
              const updated = await submitAction(matchId, { actionType, actionPayload });
              updateMatchData(updated);
            } catch (err: any) {
              setError(err.message || 'Action failed');
            }
          }}
          players={match.players}
          events={events}
        />
        <MatchChatWidget
          matchId={matchId}
          players={match.players}
          currentUserId={currentUserId}
        />
      </div>
    );
  }

  const gameState = match.stateSnapshot as KingdomsGameState;
  const isMyTurn = gameState.activePlayerId === currentUserId;
  const myPlayerState = currentUserId ? gameState.players[currentUserId] : undefined;
  const drawPile = gameState.drawPile || [];
  // Only expose the tile identity when the server has actually drawn and revealed it.
  // drawPile entries are sanitized server-side to face-down stubs, so we must not
  // use them as a preview — that caused the "Face-Down Tile" bug.
  // Filter out sanitized face-down stubs — if pendingDrawnTile somehow contains
  // a stub (e.g. from DB state corruption), treat it as unrevealed.
  const nextDrawTile = gameState.pendingDrawnTile ?? null;

  const handleDrawTile = async () => {
    if (!isMyTurn || gameState.pendingDrawnTile || actionLoading) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await submitAction(matchId, { actionType: 'DRAW_TILE', actionPayload: {} });
      updateMatchData(updated);
      setSelectedAction({ kind: 'DRAW_TILE' });
    } catch (err: any) {
      setError(err.message || 'Failed to draw tile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCellClick = async (row: number, col: number) => {
    if (!isMyTurn || !selectedAction) return;

    setActionLoading(true);
    setError(null);

    let actionType = '';
    let actionPayload: any = { row, col };

    if (selectedAction.kind === 'CASTLE') {
      actionType = 'PLACE_CASTLE';
      actionPayload.rank = selectedAction.rank;
    } else if (selectedAction.kind === 'DRAW_TILE') {
      // Always use two-step flow: DRAW_TILE first (if needed), then PLACE_DRAWN_TILE.
      // This ensures the drawn tile identity is revealed before placement.
      if (!gameState.pendingDrawnTile) {
        try {
          const drawResult = await submitAction(matchId, { actionType: 'DRAW_TILE', actionPayload: {} });
          updateMatchData(drawResult);
        } catch (err: any) {
          setError(err.message || 'Failed to draw tile');
          setActionLoading(false);
          return;
        }
      }
      actionType = 'PLACE_DRAWN_TILE';
    } else if (selectedAction.kind === 'SECRET_TILE') {
      actionType = 'PLACE_SECRET_TILE';
    }

    try {
      const updated = await submitAction(matchId, { actionType, actionPayload });
      updateMatchData(updated);
      setSelectedAction(null);

      // Refresh events
      const updatedEvents = await getMatchEvents(matchId).catch(() => []);
      if (updatedEvents.length > 0) setEvents(updatedEvents);
    } catch (err: any) {
      setError(err.message || 'Invalid move');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePass = async () => {
    if (!isMyTurn) return;

    setActionLoading(true);
    setError(null);

    try {
      const updated = await submitAction(matchId, {
        actionType: 'PASS',
        actionPayload: {},
      });
      updateMatchData(updated);
      setSelectedAction(null);

      // Refresh events
      const updatedEvents = await getMatchEvents(matchId).catch(() => []);
      if (updatedEvents.length > 0) setEvents(updatedEvents);
    } catch (err: any) {
      setError(err.message || 'Failed to pass turn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmTurn = async () => {
    if (!isMyTurn) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await submitAction(matchId, {
        actionType: 'CONFIRM_TURN',
        actionPayload: {},
      });
      updateMatchData(updated);
      setSelectedAction(null);
      const updatedEvents = await getMatchEvents(matchId).catch(() => []);
      if (updatedEvents.length > 0) setEvents(updatedEvents);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm turn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTurn = async () => {
    if (!isMyTurn) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await submitAction(matchId, {
        actionType: 'CANCEL_TURN',
        actionPayload: {},
      });
      updateMatchData(updated);
      setSelectedAction(null);
      const updatedEvents = await getMatchEvents(matchId).catch(() => []);
      if (updatedEvents.length > 0) setEvents(updatedEvents);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel turn');
    } finally {
      setActionLoading(false);
    }
  };

  let selectedActionText = '';
  if (selectedAction) {
    if (selectedAction.kind === 'CASTLE') selectedActionText = `PLACE RANK ${selectedAction.rank}`;
    else if (selectedAction.kind === 'DRAW_TILE') selectedActionText = 'DRAW & PLACE';
    else if (selectedAction.kind === 'SECRET_TILE') selectedActionText = 'PLACE SECRET';
  }

  const hasPendingMove = isMyTurn && (match.hasPendingTurn || gameState.pendingTurnConfirmation || !!gameState.pendingPlacement);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {renderTopBanner()}

      <main
        style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: 'clamp(0.75rem, 3vw, 1.5rem) clamp(0.5rem, 2vw, 1rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Header */}
        <GameHeader
          gameState={gameState}
          players={match.players}
          currentUserId={currentUserId}
          onOpenScoringModal={() => setScoringModalOpen(true)}
        />

        {hasPendingMove && (
          <TurnConfirmationBar
            onConfirm={handleConfirmTurn}
            onCancel={handleCancelTurn}
            isLoading={actionLoading}
          />
        )}

        {error && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Main 2-Column Game Layout (Wireframe Page 5) */}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
          {/* Left Section: 5x6 Board Grid & Player Hand Controls */}
          <div style={{ flex: '1 1 min(100%, 600px)', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <BoardGrid
              board={gameState.board}
              players={gameState.players}
              isMyTurn={isMyTurn}
              onCellClick={handleCellClick}
              selectedActionText={selectedActionText}
              selectedAction={selectedAction}
              nextDrawTile={nextDrawTile}
              secretTile={myPlayerState?.secretTile as Tile | null ?? null}
              activePlayerColor={gameState.players[gameState.activePlayerId]?.color || myPlayerState?.color}
            />

            {!gameState.isComplete && (
              <PlayerHandControls
                playerState={myPlayerState}
                drawPileCount={gameState.drawPile?.length || 0}
                nextDrawTile={nextDrawTile}
                pendingDrawnTile={gameState.pendingDrawnTile}
                isMyTurn={isMyTurn}
                selectedAction={selectedAction}
                onSelectAction={setSelectedAction}
                onDrawTile={handleDrawTile}
                onPass={handlePass}
                isLoading={actionLoading}
              />
            )}
          </div>

          {/* Right Sidebar Section: Player Status Cards & Turn History Log */}
          <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <PlayerStatusCards
              gameState={gameState}
              players={match.players}
              currentUserId={currentUserId}
            />

            <TurnHistoryLog
              events={events}
              players={match.players}
              lastScoringResult={lastScoring}
            />
          </div>
        </div>

        {/* Epoch Scoring Breakdown Modal */}
        <ScoringBreakdownModal
          isOpen={scoringModalOpen}
          onClose={() => setScoringModalOpen(false)}
          scoringResult={lastScoring}
          players={match.players}
        />
      </main>

      <MatchChatWidget
        matchId={matchId}
        players={match.players}
        currentUserId={currentUserId}
      />
    </div>
  );
}
