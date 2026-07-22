'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Header } from '../../components/ui/Header';
import { getStoredUser, getMe, removeAuthToken, getUserMatches, listLobbies } from '../../lib/api';
import { UserDTO, MatchDTO, LobbyDTO } from '@boardgametime/types';

export default function ProfilePage() {
  const router = useRouter();
  const [ownUser, setOwnUser] = useState<UserDTO | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'history'>('all');
  
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  const [myLobbies, setMyLobbies] = useState<LobbyDTO[]>([]);
  const [loadingLobbies, setLoadingLobbies] = useState(false);

  const loadProfileData = async () => {
    setLoadingUser(true);
    setLoadingMatches(true);
    setLoadingLobbies(true);

    try {
      let currentUser: UserDTO | null = null;
      try {
        currentUser = await getMe();
      } catch {
        currentUser = getStoredUser();
      }
      setOwnUser(currentUser);

      if (currentUser) {
        try {
          const userMatches = await getUserMatches('ALL');
          setMatches(userMatches);
        } catch (err: any) {
          setMatchesError(err.message || 'Failed to load matches history');
        }

        try {
          const allLobbies = await listLobbies();
          const userLobbies = allLobbies.filter(
            (lobby) =>
              lobby.status === 'WAITING' &&
              lobby.players.some((p) => p.userId === currentUser?.id)
          );
          setMyLobbies(userLobbies);
        } catch {
          // ignore lobby list error
        }
      }
    } finally {
      setLoadingUser(false);
      setLoadingMatches(false);
      setLoadingLobbies(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleSignOut = () => {
    removeAuthToken();
    setOwnUser(null);
    router.push('/auth/login');
  };

  const activeMatches = matches.filter((m) => m.status === 'IN_PROGRESS');
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED' || m.status === 'ABANDONED');

  const totalGamesPlayed = completedMatches.length;
  let winsCount = 0;
  let lossesCount = 0;

  completedMatches.forEach((match) => {
    if (!ownUser) return;
    const state = match.stateSnapshot as any;
    if (state?.winnerPlayerId === ownUser.id) {
      winsCount++;
    } else {
      const playerGolds: { id: string; gold: number }[] = match.players.map((p) => {
        const playerState = state?.players?.[p.userId];
        const gold = playerState?.gold ?? (state?.lastScoringResult?.totalGoldAfterEpoch?.[p.userId] || 0);
        return { id: p.userId, gold };
      });
      playerGolds.sort((a, b) => b.gold - a.gold);
      if (playerGolds.length > 0 && playerGolds[0].id === ownUser.id) {
        winsCount++;
      } else {
        lossesCount++;
      }
    }
  });

  const winRate = totalGamesPlayed > 0 ? Math.round((winsCount / totalGamesPlayed) * 100) : 0;
  const activeGamesCount = activeMatches.length + myLobbies.length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Member';
    try {
      const d = new Date(dateStr);
      return 'Member since ' + d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    } catch {
      return 'Member';
    }
  };

  const formatMatchDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getMatchResult = (match: MatchDTO) => {
    if (!ownUser) return { status: 'NEUTRAL', text: 'Completed', scoreStr: '', rankStr: '', playerGolds: [] };
    if (match.status === 'ABANDONED') {
      return { status: 'ABANDONED', text: 'Abandoned', scoreStr: '-', rankStr: '-', playerGolds: [] };
    }

    const state = match.stateSnapshot as any;
    const playerGolds: { id: string; username: string; gold: number }[] = match.players.map((p) => {
      const playerState = state?.players?.[p.userId];
      const gold = playerState?.gold ?? (state?.lastScoringResult?.totalGoldAfterEpoch?.[p.userId] || 0);
      return { id: p.userId, username: p.username, gold };
    });

    playerGolds.sort((a, b) => b.gold - a.gold);
    const myIndex = playerGolds.findIndex((p) => p.id === ownUser.id);
    const isWinner = state?.winnerPlayerId === ownUser.id || myIndex === 0;

    const myGold = playerGolds.find((p) => p.id === ownUser.id)?.gold ?? 0;
    const scoreStr = myGold + ' Gold';
    const rankStr = myIndex >= 0 ? '#' + (myIndex + 1) + ' Place' : '-';
    const text = isWinner ? 'Victory 🏆' : 'Defeat ⚔️';

    return {
      status: isWinner ? 'VICTORY' : 'DEFEAT',
      text,
      scoreStr,
      rankStr,
      playerGolds,
    };
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        user={ownUser}
        onSignOut={handleSignOut}
        subtitle="User Profile"
        backLink={{ href: '/', label: '← Back to Lobby' }}
      />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {loadingUser ? (
          <Card style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Loading user profile...</p>
          </Card>
        ) : !ownUser ? (
          <Card style={{ textAlign: 'center', padding: '4rem', maxWidth: '500px', margin: '2rem auto', borderStyle: 'dashed' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Authentication Required
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Please sign in to view your user profile, active games, and match history.
            </p>
            <Link href='/auth/login' passHref style={{ textDecoration: 'none' }}>
              <Button variant='gold' size='lg' fullWidth>
                Sign In / Register
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <Card glow style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    {ownUser.avatarUrl ? (
                      <img
                        src={ownUser.avatarUrl}
                        alt={ownUser.username}
                        style={{
                          width: '90px',
                          height: '90px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #f59e0b',
                          boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '90px',
                          height: '90px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(30, 41, 59, 0.9) 100%)',
                          border: '2px solid #f59e0b',
                          boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#f59e0b',
                          fontSize: '2.5rem',
                          fontWeight: 800,
                        }}
                      >
                        {ownUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                        {ownUser.username}
                      </h1>
                      <Badge variant='gold' size='sm'>
                        Player Profile
                      </Badge>
                    </div>
                    
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                      ✉️ {ownUser.email}
                    </p>

                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                      📅 {formatDate(ownUser.createdAt)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Button variant='secondary' size='md' onClick={loadProfileData} isLoading={loadingMatches}>
                    Refresh Data
                  </Button>
                  <Link href='/lobbies/new' passHref style={{ textDecoration: 'none' }}>
                    <Button variant='gold' size='md'>
                      + Create Game Room
                    </Button>
                  </Link>
                </div>
              </div>

              <div
                style={{
                  marginTop: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Matches
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>
                    {totalGamesPlayed}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Victories
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
                    {winsCount}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Defeats
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171', marginTop: '0.25rem' }}>
                    {lossesCount}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Win Rate
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
                    {winRate}%
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <div style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Active Games
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.25rem' }}>
                    {activeGamesCount}
                  </div>
                </div>
              </div>
            </Card>

            <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  background: activeTab === 'all' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  color: activeTab === 'all' ? '#f59e0b' : '#94a3b8',
                  border: activeTab === 'all' ? '1px solid #f59e0b' : '1px solid transparent',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                Overview & All
              </button>

              <button
                onClick={() => setActiveTab('active')}
                style={{
                  background: activeTab === 'active' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  color: activeTab === 'active' ? '#f59e0b' : '#94a3b8',
                  border: activeTab === 'active' ? '1px solid #f59e0b' : '1px solid transparent',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>⚡ Active Games</span>
                <Badge variant={activeGamesCount > 0 ? 'gold' : 'neutral'} size='sm'>
                  {activeGamesCount}
                </Badge>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                style={{
                  background: activeTab === 'history' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  color: activeTab === 'history' ? '#f59e0b' : '#94a3b8',
                  border: activeTab === 'history' ? '1px solid #f59e0b' : '1px solid transparent',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>📜 Game History</span>
                <Badge variant={completedMatches.length > 0 ? 'info' : 'neutral'} size='sm'>
                  {completedMatches.length}
                </Badge>
              </button>
            </div>

            {matchesError && (
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                {matchesError}
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'active') && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>⚡ Active Games & Waiting Rooms</span>
                    <Badge variant='gold' size='sm'>{activeGamesCount}</Badge>
                  </h2>
                </div>

                {loadingMatches || loadingLobbies ? (
                  <Card style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: '#94a3b8' }}>Loading active games...</p>
                  </Card>
                ) : activeGamesCount === 0 ? (
                  <Card style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                      No Active Games
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                      You are not currently in any ongoing matches or waiting lobbies.
                    </p>
                    <Link href='/' passHref style={{ textDecoration: 'none' }}>
                      <Button variant='gold' size='md'>
                        Browse Open Rooms
                      </Button>
                    </Link>
                  </Card>
                ) : (
                  <div className='grid-container grid-cols-2'>
                    {activeMatches.map((match) => {
                      const isMyTurn = match.currentTurnPlayerId === ownUser.id;
                      const activePlayer = match.players.find((p) => p.userId === match.currentTurnPlayerId);
                      const activePlayerName = activePlayer?.username || 'Opponent';
                      const gameName = match.gameId === 'kingdoms' ? 'Kingdoms' : (match.gameId.charAt(0).toUpperCase() + match.gameId.slice(1));

                      return (
                        <Card
                          key={match.id}
                          glow={isMyTurn}
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                                {gameName}
                              </span>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Badge variant={match.mode === 'REALTIME' ? 'gold' : 'info'} size='sm'>
                                  {match.mode === 'REALTIME' ? 'Realtime' : 'Async'}
                                </Badge>
                                <Badge variant={isMyTurn ? 'success' : 'neutral'} size='sm'>
                                  {isMyTurn ? 'Your Turn' : 'In Progress'}
                                </Badge>
                              </div>
                            </div>
                          }
                          footer={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Updated: {formatMatchDate(match.updatedAt)}
                              </span>
                              <Link href={'/matches/' + match.id} passHref style={{ textDecoration: 'none' }}>
                                <Button variant={isMyTurn ? 'gold' : 'primary'} size='sm'>
                                  {isMyTurn ? 'Play Turn' : 'View Match'}
                                </Button>
                              </Link>
                            </div>
                          }
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Turn Status:</span>
                              {isMyTurn ? (
                                <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>
                                  ⚡ It&apos;s Your Turn!
                                </strong>
                              ) : (
                                <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                                  Waiting for <strong style={{ color: '#f59e0b' }}>{activePlayerName}</strong>
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {match.players.map((p) => (
                                <span
                                  key={p.userId}
                                  style={{
                                    fontSize: '0.8rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    background: p.userId === ownUser.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                    color: p.userId === ownUser.id ? '#f59e0b' : '#cbd5e1',
                                  }}
                                >
                                  {p.username} {p.userId === ownUser.id ? '(You)' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        </Card>
                      );
                    })}

                    {myLobbies.map((lobby) => (
                      <Card
                        key={lobby.id}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                              Kingdoms (Lobby Room)
                            </span>
                            <Badge variant='warning' size='sm'>Waiting Room</Badge>
                          </div>
                        }
                        footer={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                              Code: <strong style={{ color: '#f59e0b' }}>{lobby.code}</strong>
                            </span>
                            <Link href={'/lobbies/' + lobby.id} passHref style={{ textDecoration: 'none' }}>
                              <Button variant='outline' size='sm'>
                                Enter Room
                              </Button>
                            </Link>
                          </div>
                        }
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                            Players Joined: <strong style={{ color: '#f8fafc' }}>{lobby.players.length} / {lobby.maxPlayers}</strong>
                          </p>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {lobby.players.map((p) => (
                              <Badge key={p.userId} variant={p.isReady ? 'success' : 'neutral'} size='sm'>
                                {p.username} {p.isReady ? '✓ Ready' : 'Waiting'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'history') && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📜 Game History & Results</span>
                    <Badge variant='info' size='sm'>{completedMatches.length}</Badge>
                  </h2>
                </div>

                {loadingMatches ? (
                  <Card style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: '#94a3b8' }}>Loading past match history...</p>
                  </Card>
                ) : completedMatches.length === 0 ? (
                  <Card style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                      No Past Game History
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                      You have not completed any games yet. Play through a full match of Kingdoms to record your victory statistics!
                    </p>
                  </Card>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {completedMatches.map((match) => {
                      const result = getMatchResult(match);
                      const gameName = match.gameId === 'kingdoms' ? 'Kingdoms' : (match.gameId.charAt(0).toUpperCase() + match.gameId.slice(1));

                      return (
                        <Card key={match.id} style={{ background: 'rgba(30, 41, 59, 0.6)' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                              <Badge
                                variant={result.status === 'VICTORY' ? 'success' : result.status === 'DEFEAT' ? 'danger' : 'neutral'}
                                size='md'
                              >
                                {result.text}
                              </Badge>

                              <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                                  {gameName}
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                                  Completed {formatMatchDate(match.updatedAt)}
                                </p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                                  Placement
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.1rem' }}>
                                  {result.rankStr}
                                </div>
                              </div>

                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                                  Final Score
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.1rem' }}>
                                  {result.scoreStr}
                                </div>
                              </div>

                              <Link href={'/matches/' + match.id} passHref style={{ textDecoration: 'none' }}>
                                <Button variant='secondary' size='sm'>
                                  View Replay / Match
                                </Button>
                              </Link>
                            </div>
                          </div>

                          {result.playerGolds && result.playerGolds.length > 0 && (
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Scores:</span>
                              {result.playerGolds.map((p, idx) => (
                                <span
                                  key={p.id}
                                  style={{
                                    fontSize: '0.8rem',
                                    color: p.id === ownUser.id ? '#f59e0b' : '#94a3b8',
                                    fontWeight: p.id === ownUser.id ? 700 : 400,
                                  }}
                                >
                                  {idx + 1}. {p.username}: <strong>{p.gold} Gold</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
        BoardGameTime &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
