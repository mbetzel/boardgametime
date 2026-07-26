import React from 'react';
import { PlayerSheetState } from '@boardgametime/game-dungeons-dice-danger';
import { Badge } from '../../ui/Badge';

interface PlayerTrackerCardProps {
  playerState: PlayerSheetState;
  username: string;
  isActivePlayer: boolean;
  isCurrentUser: boolean;
  avatarUrl?: string | null;
}

export const PlayerTrackerCard: React.FC<PlayerTrackerCardProps> = ({
  playerState,
  username,
  isActivePlayer,
  isCurrentUser,
  avatarUrl,
}) => {
  return (
    <div
      style={{
        backgroundColor: isActivePlayer ? 'rgba(245, 158, 11, 0.12)' : '#1e293b',
        border: isActivePlayer ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: isActivePlayer ? '0 0 20px rgba(245, 158, 11, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Active Turn Accent Bar */}
      {isActivePlayer && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            backgroundColor: '#f59e0b',
          }}
        />
      )}

      {/* Header: User & Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '2px solid #f59e0b',
              }}
            />
          ) : (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '0.85rem',
              }}
            >
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {username}
            {isCurrentUser && (
              <span style={{ fontSize: '0.7rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                YOU
              </span>
            )}
          </span>
        </div>

        {isActivePlayer ? (
          <Badge variant="gold" size="sm">
            🎲 ACTIVE ROLLER
          </Badge>
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Waiting</span>
        )}
      </div>

      {/* Health Bar Track */}
      <div style={{ backgroundColor: '#0f172a', padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
          <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Health Points:</span>
          <span style={{ color: '#f87171', fontWeight: 800 }}>{playerState.health} HP</span>
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '8px',
                flex: 1,
                borderRadius: '2px',
                backgroundColor: i < playerState.health ? '#10b981' : 'rgba(239, 68, 68, 0.2)',
                border: i < playerState.health ? '1px solid #059669' : '1px solid rgba(239, 68, 68, 0.4)',
              }}
            />
          ))}
        </div>
        {playerState.skullsCrossed > 0 && (
          <div style={{ fontSize: '0.7rem', color: '#f87171', marginTop: '0.25rem' }}>
            💀 {playerState.skullsCrossed} Skulls (-{playerState.skullsCrossed} VP)
          </div>
        )}
      </div>

      {/* Items & Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', fontSize: '0.75rem' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '0.4rem', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>🎲 Black Die</div>
          <div style={{ fontWeight: 800, color: '#fbbf24' }}>{playerState.blackDieCharges} charges</div>
        </div>
        <div style={{ backgroundColor: '#0f172a', padding: '0.4rem', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>🔦 Torches</div>
          <div style={{ fontWeight: 800, color: '#f97316' }}>{playerState.torches}</div>
        </div>
        <div style={{ backgroundColor: '#0f172a', padding: '0.4rem', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>💎 Gems</div>
          <div style={{ fontWeight: 800, color: '#38bdf8' }}>{playerState.gems} ({playerState.gems * 3} VP)</div>
        </div>
      </div>
    </div>
  );
};
