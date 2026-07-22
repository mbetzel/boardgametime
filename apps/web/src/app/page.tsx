'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Header } from '../components/ui/Header';
import { CreateLobbyModal } from '../components/lobby/CreateLobbyModal';
import { getStoredUser, removeAuthToken, listLobbies, joinLobby, getUserMatches } from '../lib/api';
import { getLobbySocket } from '../lib/socket';
import { LobbyDTO, UserDTO, MatchDTO } from '@boardgametime/types';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [lobbies, setLobbies] = useState<LobbyDTO[]>([]);
  const [loadingLobbies, setLoadingLobbies] = useState(true);
  const [lobbiesError, setLobbiesError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joiningLobbyId, setJoiningLobbyId] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    if (currentUser) {
      setLoadingMatches(true);
      getUserMatches('IN_PROGRESS')
        .then((data) => {
          setMatches(data.filter((m) => m.status === 'IN_PROGRESS'));
        })
        .catch((err: any) => {
          setMatchesError(err.message || 'Failed to load ongoing matches');
        })
        .finally(() => {
          setLoadingMatches(false);
        });
    }

    const fetchLobbies = async () => {
      try {
        const data = await listLobbies();
        setLobbies(data.filter((l) => l.visibility === 'PUBLIC' && l.status === 'WAITING'));
      } catch (err: any) {
        setLobbiesError(err.message || 'Failed to load active game rooms');
      } finally {
        setLoadingLobbies(false);
      }
    };

    fetchLobbies();

    const socket = getLobbySocket();
    const handleLobbyUpdated = (updated: LobbyDTO) => {
      setLobbies((prev) => {
        const exists = prev.some((l) => l.id === updated.id);
        if (updated.status === 'WAITING' && updated.visibility === 'PUBLIC') {
          if (exists) {
            return prev.map((l) => (l.id === updated.id ? updated : l));
          } else {
            return [updated, ...prev];
          }
        } else {
          return prev.filter((l) => l.id !== updated.id);
        }
      });
    };

    socket.on('lobby_updated', handleLobbyUpdated);

    return () => {
      socket.off('lobby_updated', handleLobbyUpdated);
    };
  }, []);

  const handleSignOut = () => {
    removeAuthToken();
    setUser(null);
    setMatches([]);
  };

  const handleCreateRoomClick = () => {
    if (!user) {
      router.push('/auth/login');
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleJoinRoom = async (lobbyId: string) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setJoiningLobbyId(lobbyId);
    try {
      await joinLobby(lobbyId);
      router.push(`/lobbies/${lobbyId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to join game room');
    } finally {
      setJoiningLobbyId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}>
      {/* Top Header */}
      <Header user={user} onSignOut={handleSignOut} />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
        
        {/* Games Gallery Section */}
        <section>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              Games Gallery
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Choose a title to launch a match or join active rooms
            </p>
          </div>

          <div className="grid-container grid-cols-3">
            {/* Kingdoms Game Card */}
            <Card glow style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Thumbnail Artwork */}
                <div
                  style={{
                    width: '100%',
                    height: '160px',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #311b92 50%, #0f172a 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Castle Walls & Towers SVG Illustration */}
                    <path d="M15 80V45L25 35L35 45V80H15Z" fill="#f59e0b" fillOpacity="0.8" />
                    <path d="M65 80V45L75 35L85 45V80H65Z" fill="#f59e0b" fillOpacity="0.8" />
                    <path d="M30 80V55H70V80H30Z" fill="#d97706" fillOpacity="0.9" />
                    <path d="M40 80V65C40 60 60 60 60 65V80H40Z" fill="#0f172a" />
                    {/* Crown emblem overhead */}
                    <path d="M35 30L42 22L50 28L58 22L65 30H35Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                    {/* Grid detail */}
                    <rect x="10" y="82" width="80" height="4" fill="#f59e0b" rx="2" />
                  </svg>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
                    REINER KNIZIA 2002
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <Badge variant="gold" size="sm">2-4 Players</Badge>
                  <Badge variant="info" size="sm">Strategy</Badge>
                  <Badge variant="success" size="sm">Realtime & Async</Badge>
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  Kingdoms
                </h3>

                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.45', marginBottom: '1.25rem' }}>
                  Reiner Knizia&apos;s classic tile placement game of strategy, territory expansion, and math calculations (Fantasy Flight Games 2002 Edition).
                </p>
              </div>

              <Button variant="gold" fullWidth onClick={handleCreateRoomClick}>
                + Create Room
              </Button>
            </Card>

            {/* Catan - Coming Soon */}
            <Card style={{ opacity: 0.85, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    width: '100%',
                    height: '160px',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #14532d 0%, #064e3b 50%, #0f172a 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Hexagon icon */}
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="50,15 85,35 85,75 50,95 15,75 15,35" fill="#15803d" stroke="#4ade80" strokeWidth="3" opacity="0.6" />
                    <text x="50" y="58" textAnchor="middle" fill="#4ade80" fontSize="24" fontWeight="bold">🎲</text>
                  </svg>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4ade80', marginTop: '0.25rem' }}>
                    IN DEVELOPMENT
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <Badge variant="neutral" size="sm">3-4 Players</Badge>
                  <Badge variant="warning" size="sm">Coming Soon</Badge>
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Catan
                </h3>

                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.45', marginBottom: '1.25rem' }}>
                  Trade, build, and settle. Collect resources to expand settlements and claim victory on the island.
                </p>
              </div>

              <Button variant="secondary" fullWidth disabled>
                Coming Soon
              </Button>
            </Card>

            {/* Carcassonne - Coming Soon */}
            <Card style={{ opacity: 0.85, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    width: '100%',
                    height: '160px',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 50%, #0f172a 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Meeple / landscape icon */}
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="30" r="12" fill="#60a5fa" opacity="0.7" />
                    <path d="M35 80 C35 55 65 55 65 80 Z" fill="#60a5fa" opacity="0.7" />
                  </svg>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', marginTop: '0.25rem' }}>
                    IN DEVELOPMENT
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <Badge variant="neutral" size="sm">2-5 Players</Badge>
                  <Badge variant="warning" size="sm">Coming Soon</Badge>
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Carcassonne
                </h3>

                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.45', marginBottom: '1.25rem' }}>
                  Draw and place landscape tiles to build cities, roads, and monasteries across southern France.
                </p>
              </div>

              <Button variant="secondary" fullWidth disabled>
                Coming Soon
              </Button>
            </Card>
          </div>
        </section>

        {/* Active Rooms List Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                Active Game Rooms
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Join open public lobbies and jump straight into action
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCreateRoomClick}>
              + Create New Room
            </Button>
          </div>

          {lobbiesError && (
            <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', marginBottom: '1rem' }}>
              {lobbiesError}
            </div>
          )}

          {loadingLobbies ? (
            <Card style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#94a3b8' }}>Loading active public game rooms...</p>
            </Card>
          ) : lobbies.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏰</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                No Active Game Rooms
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                There are no open public lobbies right now. Create a new room to start playing Kingdoms!
              </p>
              <Button variant="gold" size="md" onClick={handleCreateRoomClick}>
                Create Kingdoms Room
              </Button>
            </Card>
          ) : (
            <div className="grid-container grid-cols-2">
              {lobbies.map((lobby) => {
                const hostUser = lobby.players.find((p) => p.userId === lobby.hostId);
                const isFull = lobby.players.length >= lobby.maxPlayers;
                const isJoining = joiningLobbyId === lobby.id;

                return (
                  <Card
                    key={lobby.id}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                          Kingdoms
                        </span>
                        <Badge variant={lobby.mode === 'REALTIME' ? 'gold' : 'info'} size="sm">
                          {lobby.mode === 'REALTIME' ? '⚡ Realtime' : '⏳ Async'}
                        </Badge>
                      </div>
                    }
                    footer={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>
                          Players: <strong style={{ color: '#f8fafc' }}>{lobby.players.length} / {lobby.maxPlayers}</strong>
                        </span>
                        <Button
                          variant={isFull ? 'secondary' : 'gold'}
                          size="sm"
                          disabled={isFull || isJoining}
                          isLoading={isJoining}
                          onClick={() => handleJoinRoom(lobby.id)}
                        >
                          {isFull ? 'Full' : 'Join'}
                        </Button>
                      </div>
                    }
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.25rem 0' }}>
                      <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                        Host: <strong style={{ color: '#f59e0b' }}>{hostUser?.username || 'Unknown Host'}</strong>
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Badge variant="neutral" size="sm">Code: {lobby.code}</Badge>
                        <Badge variant="success" size="sm">Public</Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* My Games (Current Games) Section */}
        <section>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              My Games (Current Games)
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Your ongoing matches in progress
            </p>
          </div>

          {!user ? (
            <Card style={{ textAlign: 'center', padding: '2.5rem', borderStyle: 'dashed' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                Sign In to View Current Games
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
                Please sign in to see your active games and rejoin matches in progress.
              </p>
              <Link href="/auth/login" passHref style={{ textDecoration: 'none' }}>
                <Button variant="gold" size="md">
                  Sign In
                </Button>
              </Link>
            </Card>
          ) : loadingMatches ? (
            <Card style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#94a3b8' }}>Loading your active matches...</p>
            </Card>
          ) : matchesError ? (
            <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              {matchesError}
            </div>
          ) : matches.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚔️</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                No Ongoing Matches
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                You have no active matches in progress right now. Join an active room above or create a new room!
              </p>
            </Card>
          ) : (
            <div className="grid-container grid-cols-2">
              {matches.map((match) => {
                const isMyTurn = match.currentTurnPlayerId === user.id;
                const activePlayer = match.players.find((p) => p.userId === match.currentTurnPlayerId);
                const activePlayerName = activePlayer?.username || 'Opponent';
                const gameName = match.gameId === 'kingdoms' ? 'Kingdoms' : (match.gameId.charAt(0).toUpperCase() + match.gameId.slice(1));
                const epoch = (match.stateSnapshot as any)?.epoch || 1;

                return (
                  <Card
                    key={match.id}
                    glow={isMyTurn}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                          {gameName}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <Badge variant={match.mode === 'REALTIME' ? 'gold' : 'info'} size="sm">
                            {match.mode === 'REALTIME' ? '⚡ Realtime' : '⏳ Async'}
                          </Badge>
                          <Badge variant="neutral" size="sm">
                            Epoch {epoch} / 3
                          </Badge>
                        </div>
                      </div>
                    }
                    footer={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isMyTurn ? (
                            <Badge variant="success" size="md">
                              🎯 Your Turn
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="md">
                              ⏳ Waiting for {activePlayerName}
                            </Badge>
                          )}
                        </div>
                        <Link href={`/matches/${match.id}`} style={{ textDecoration: 'none' }}>
                          <Button variant={isMyTurn ? 'gold' : 'secondary'} size="sm">
                            Rejoin Match
                          </Button>
                        </Link>
                      </div>
                    }
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.25rem 0' }}>
                      <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                        Players:{' '}
                        <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                          {match.players.map((p) => p.username).join(', ')}
                        </span>
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p>Board Game Time &copy; {new Date().getFullYear()} — Kingdoms (Fantasy Flight Games 2002 Edition)</p>
      </footer>

      {/* Create Room Modal */}
      <CreateLobbyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(createdLobby) => {
          setIsCreateModalOpen(false);
          router.push(`/lobbies/${createdLobby.id}`);
        }}
      />
    </div>
  );
}
