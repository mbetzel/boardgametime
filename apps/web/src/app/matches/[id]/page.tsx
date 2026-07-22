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
import { getMatch, submitAction, getMatchEvents, getStoredUser, removeAuthToken } from '../../../lib/api';
import { getMatchSocket } from '../../../lib/socket';
import { MatchDTO, MatchEventDTO, UserDTO } from '@boardgametime/types';
import { KingdomsGameState, GameScoringSummary, Tile } from '@boardgametime/game-kingdoms';

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
  }, [matchId]);

  const renderTopBanner = () => (
    <header
      style={{
        width: '100%',
        borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0.85rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Brand Title */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M5 19H19" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#f59e0b',
              letterSpacing: '-0.02em',
              textShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
            }}
          >
            Board Game Time
          </span>
        </Link>

        {/* User Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentUser ? (
            <>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#f59e0b',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                <span>👤 {currentUser.username}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/login" passHref style={{ textDecoration: 'none' }}>
              <Button variant="gold" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
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

  if (error || !match) {
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

  const gameState = match.stateSnapshot as KingdomsGameState;
  const isMyTurn = gameState.activePlayerId === currentUserId;
  const myPlayerState = currentUserId ? gameState.players[currentUserId] : undefined;
  const drawPile = gameState.drawPile || [];
  const nextDrawTile = drawPile.length > 0 ? drawPile[drawPile.length - 1] : null;

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

  let selectedActionText = '';
  if (selectedAction) {
    if (selectedAction.kind === 'CASTLE') selectedActionText = `PLACE RANK ${selectedAction.rank}`;
    else if (selectedAction.kind === 'DRAW_TILE') selectedActionText = 'DRAW & PLACE';
    else if (selectedAction.kind === 'SECRET_TILE') selectedActionText = 'PLACE SECRET';
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {renderTopBanner()}

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
              selectedAction={selectedAction}
              nextDrawTile={nextDrawTile}
              secretTile={myPlayerState?.secretTile as Tile | null ?? null}
            />

            {!gameState.isComplete && (
              <PlayerHandControls
                playerState={myPlayerState}
                drawPileCount={gameState.drawPile?.length || 0}
                nextDrawTile={nextDrawTile}
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
    </div>
  );
}
