import React from 'react';
import { KingdomsGameState } from '@boardgametime/game-kingdoms';
import { MatchPlayerDTO } from '@boardgametime/types';
import { Badge } from '../ui/Badge';

export interface PlayerStatusCardsProps {
  gameState: KingdomsGameState;
  players: MatchPlayerDTO[];
  currentUserId?: string;
}

export const PlayerStatusCards: React.FC<PlayerStatusCardsProps> = ({
  gameState,
  players,
  currentUserId,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          👥 Player Status ({players.length})
        </h3>
      </div>

      {players.map((p) => {
        const pState = gameState.players[p.userId];
        const isActive = gameState.activePlayerId === p.userId;
        const isMe = p.userId === currentUserId;
        const playerColor = pState?.color || '#f59e0b';

        // Calculate castle inventory totals
        const castles = pState?.availableCastles || [];
        const totalCastles = castles.reduce((acc, c) => acc + c.count, 0);

        return (
          <div
            key={p.userId}
            style={{
              backgroundColor: isActive ? 'rgba(245, 158, 11, 0.12)' : '#1e293b',
              border: isActive ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: isActive ? '0 0 20px rgba(245, 158, 11, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease-in-out',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Active Turn Accent Bar */}
            {isActive && (
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

            {/* Header: Color Indicator, Name & Badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.username}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: `2px solid ${playerColor}`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: playerColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      boxShadow: `0 0 10px ${playerColor}66`,
                    }}
                  >
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {p.username}
                    {isMe && (
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                        YOU
                      </span>
                    )}
                    <span
                      title={`Player Color: ${playerColor}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.1rem 0.45rem',
                        backgroundColor: `${playerColor}22`,
                        border: `1px solid ${playerColor}66`,
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        color: playerColor,
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: playerColor,
                          boxShadow: `0 0 6px ${playerColor}`,
                          display: 'inline-block',
                        }}
                      />
                      {playerColor === '#ef4444'
                        ? 'Red'
                        : playerColor === '#3b82f6'
                        ? 'Blue'
                        : playerColor === '#10b981'
                        ? 'Green'
                        : playerColor === '#f59e0b'
                        ? 'Yellow'
                        : 'Color'}
                    </span>
                  </span>
                </div>
              </div>

              {isActive ? (
                <Badge variant="gold" size="sm">
                  👑 ACTIVE TURN
                </Badge>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Waiting</span>
              )}
            </div>

            {/* Score & Gold Counter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>Total Gold:</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                🪙 {pState?.gold ?? 0}
              </span>
            </div>

            {/* Castle Inventory Breakdown */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  🏰 Castles ({totalCastles} left):
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                {[1, 2, 3, 4].map((rank) => {
                  const castleItem = castles.find((c) => c.rank === rank);
                  const count = castleItem ? castleItem.count : 0;
                  return (
                    <div
                      key={rank}
                      style={{
                        backgroundColor: count > 0 ? '#0f172a' : 'rgba(15, 23, 42, 0.4)',
                        border: `1px solid ${count > 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)'}`,
                        borderRadius: '6px',
                        padding: '0.3rem 0.2rem',
                        textAlign: 'center',
                        opacity: count > 0 ? 1 : 0.4,
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>R{rank}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: count > 0 ? '#f8fafc' : '#64748b' }}>
                        x{count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Secret Tile Status */}
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Secret Tile:</span>
              <span style={{ fontWeight: 600, color: pState?.secretTile ? '#34d399' : '#64748b' }}>
                {pState?.secretTile
                  ? isMe
                    ? `🕵️ ${pState.secretTile.name}`
                    : '🕵️ Held'
                  : 'Used'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
