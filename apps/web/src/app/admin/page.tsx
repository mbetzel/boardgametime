'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminStatsDTO, UserDTO } from '@boardgametime/types';
import { getAdminStats, getStoredUser } from '../../lib/api';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [stats, setStats] = useState<AdminStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(10); // in seconds, 0 = off
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
  }, []);

  const fetchStats = useCallback(async (showRefreshingState = false) => {
    if (showRefreshingState) setIsRefreshing(true);
    setError(null);
    try {
      const data = await getAdminStats();
      setStats(data);
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch administrative statistics.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchStats();
    } else if (user && user.role !== 'ADMIN') {
      setLoading(false);
    }
  }, [user, fetchStats]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN' || refreshInterval <= 0) return;
    const intervalId = setInterval(() => {
      fetchStats();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [user, refreshInterval, fetchStats]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  };

  // Auth / Role Guard check
  if (!loading && (!user || user.role !== 'ADMIN')) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc' }}>
        <Header user={user} subtitle="Admin Dashboard" />
        <main style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <Card
            style={{
              padding: '3rem 2rem',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '1rem',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Access Denied
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              You must be logged in with an <strong>Administrative Account</strong> to view site statistics and system health.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                <Button variant="gold" size="md">
                  Sign In as Admin
                </Button>
              </Link>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="md">
                  Return to Home
                </Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc' }}>
      <Header user={user} subtitle="Admin Dashboard" />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem 4rem' }}>
        {/* Top Header & Controls Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #f59e0b',
                  color: '#f59e0b',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Administrative Control
              </span>
              {lastRefreshedAt && (
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Updated {lastRefreshedAt.toLocaleTimeString()}
                </span>
              )}
            </div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#f8fafc',
                marginTop: '0.4rem',
                letterSpacing: '-0.02em',
              }}
            >
              Site Health & Statistics
            </h1>
          </div>

          {/* Refresh & Interval Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Auto Refresh:</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                style={{
                  background: 'transparent',
                  color: '#f8fafc',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <option value={5} style={{ background: '#1e293b' }}>Every 5s</option>
                <option value={10} style={{ background: '#1e293b' }}>Every 10s</option>
                <option value={30} style={{ background: '#1e293b' }}>Every 30s</option>
                <option value={0} style={{ background: '#1e293b' }}>Off</option>
              </select>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchStats(true)}
              disabled={isRefreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{
                  transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
                  transition: 'transform 0.6s ease-in-out',
                }}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6" />
                <path d="M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M22 12.5a10 10 0 0 1-18.8 4.2L2.5 16" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                margin: '0 auto 1rem',
                border: '3px solid rgba(245, 158, 11, 0.2)',
                borderTopColor: '#f59e0b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Fetching system telemetry and stats...
          </div>
        ) : stats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* System Health Overview Card */}
            <Card
              style={{
                padding: '1.75rem',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '1rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: stats.systemHealth.status === 'healthy' ? '#10b981' : '#f59e0b',
                      boxShadow: `0 0 10px ${stats.systemHealth.status === 'healthy' ? '#10b981' : '#f59e0b'}`,
                    }}
                  />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                    System & Service Health
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: stats.systemHealth.databaseStatus === 'connected' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: stats.systemHealth.databaseStatus === 'connected' ? '#34d399' : '#fca5a5',
                      border: `1px solid ${stats.systemHealth.databaseStatus === 'connected' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    }}
                  >
                    PostgreSQL: {stats.systemHealth.databaseStatus.toUpperCase()} ({stats.systemHealth.databaseLatencyMs}ms)
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.25rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                    API Server Uptime
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38bdf8' }}>
                    {formatUptime(stats.systemHealth.uptimeSeconds)}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                    Heap Used / Total
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#a78bfa' }}>
                    {stats.systemHealth.memoryUsageMb.heapUsed} MB <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {stats.systemHealth.memoryUsageMb.heapTotal} MB</span>
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                    RSS Memory
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#cbd5e1' }}>
                    {stats.systemHealth.memoryUsageMb.rss} MB
                  </span>
                </div>
              </div>
            </Card>

            {/* Key Metrics Grid */}
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
                Platform Telemetry & Usage Statistics
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {/* Active Games */}
                <Card
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '0.85rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>Active Games</span>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', margin: '0.3rem 0 0' }}>
                        {stats.activeGames}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Matches in progress right now</span>
                    </div>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                </Card>

                {/* Completed Games */}
                <Card
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>Completed Games</span>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', margin: '0.3rem 0 0' }}>
                        {stats.completedGames}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Finished matches</span>
                    </div>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                  </div>
                </Card>

                {/* Active Connected Users */}
                <Card
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>Online Users</span>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#38bdf8', margin: '0.3rem 0 0' }}>
                        {stats.activeUsers}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Active WebSocket connections</span>
                    </div>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                  </div>
                </Card>

                {/* Registered User Accounts */}
                <Card
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>Registered Users</span>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#c084fc', margin: '0.3rem 0 0' }}>
                        {stats.totalUserAccounts}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Total account database</span>
                    </div>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>
                </Card>

                {/* Waiting Lobbies */}
                <Card
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    borderRadius: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>Waiting Lobbies</span>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f472b6', margin: '0.3rem 0 0' }}>
                        {stats.waitingLobbies} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/ {stats.totalLobbies} total</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Open game lobbies</span>
                    </div>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(236, 72, 153, 0.4)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                      </svg>
                    </div>
                  </div>
                </Card>

                {/* Total Match Events */}
                <Card
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                    borderRadius: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>Game Actions Logged</span>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#facc15', margin: '0.3rem 0 0' }}>
                        {stats.totalMatchEvents}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Total turn actions executed</span>
                    </div>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(250, 204, 21, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(250, 204, 21, 0.4)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
