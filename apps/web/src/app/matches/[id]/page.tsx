'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameHeader } from '../../../components/game/GameHeader';
import { BoardGrid } from '../../../components/game/BoardGrid';
import { PlayerHandControls, SelectedActionType } from '../../../components/game/PlayerHandControls';
import { PlayerStatusCards } from '../../../components/game/PlayerStatusCards';
import { TurnHistoryLog } from '../../../components/game/TurnHistoryLog';
import { ScoringBreakdownModal } from '../../../components/game/ScoringBreakdownModal';
import { getMatch, submitAction, getMatchEvents, getStoredUser } from '../../../lib/api';
import { getMatchSocket } from '../../../lib/socket';
import { MatchDTO, MatchEventDTO } from '@boardgametime/types';
import { KingdomsGameState, GameScoringSummary } from '@boardgametime/game-kingdoms';

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

  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id;

  // Load initial match data & turn history events
  useEffect(() => {
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
        setMatch(updatedMatch);
        const state = updatedMatch.stateSnapshot as KingdomsGameState;
        if (state?.lastScoringResult) {
          setLastScoring(state.lastScoringResult);
          setScoringModalOpen(true);
        }
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
  }, [matchId]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16' }}>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', fontWeight: 600 }}>Loading match board...</p>
      </main>
    );
  }

  if (error || !match) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', backgroundColor: '#090d16' }}>
        <p style={{ color: '#f87171', fontSize: '1.2rem', fontWeight: 700 }}>{error || 'Match not found'}</p>
        <button
          onClick={() => router.push('/lobbies')}
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
          Return to Lobbies
        </button>
      </main>
    );
  }

  const gameState = match.stateSnapshot as KingdomsGameState;
  const isMyTurn = gameState.activePlayerId === currentUserId;
  const myPlayerState = currentUserId ? gameState.players[currentUserId] : undefined;

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
      actionType = 'DRAW_AND_PLACE_TILE';
    } else if (selectedAction.kind === 'SECRET_TILE') {
      actionType = 'PLACE_SECRET_TILE';
    }

    try {
      const updated = await submitAction(matchId, { actionType, actionPayload });
      setMatch(updated);
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
      setMatch(updated);
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

  let selectedActionText = '';
  if (selectedAction) {
    if (selectedAction.kind === 'CASTLE') selectedActionText = `PLACE RANK ${selectedAction.rank}`;
    else if (selectedAction.kind === 'DRAW_TILE') selectedActionText = 'DRAW & PLACE';
    else if (selectedAction.kind === 'SECRET_TILE') selectedActionText = 'PLACE SECRET';
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <GameHeader
        gameState={gameState}
        players={match.players}
        currentUserId={currentUserId}
        onOpenScoringModal={() => setScoringModalOpen(true)}
      />

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main 2-Column Game Layout (Wireframe Page 5) */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Left Section: 5x6 Board Grid & Player Hand Controls */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <BoardGrid
            board={gameState.board}
            players={gameState.players}
            isMyTurn={isMyTurn}
            onCellClick={handleCellClick}
            selectedActionText={selectedActionText}
          />

          {!gameState.isComplete && (
            <PlayerHandControls
              playerState={myPlayerState}
              drawPileCount={gameState.drawPile?.length || 0}
              isMyTurn={isMyTurn}
              selectedAction={selectedAction}
              onSelectAction={setSelectedAction}
              onPass={handlePass}
              isLoading={actionLoading}
            />
          )}
        </div>

        {/* Right Sidebar Section: Player Status Cards & Turn History Log */}
        <div style={{ flex: '1 1 340px', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
  );
}
