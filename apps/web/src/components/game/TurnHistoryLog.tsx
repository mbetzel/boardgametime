import React from 'react';
import { MatchEventDTO, MatchPlayerDTO } from '@boardgametime/types';
import { GameScoringSummary } from '@boardgametime/game-kingdoms';

export interface TurnHistoryLogProps {
  events: MatchEventDTO[];
  players: MatchPlayerDTO[];
  lastScoringResult?: GameScoringSummary | null;
}

export const TurnHistoryLog: React.FC<TurnHistoryLogProps> = ({
  events,
  players,
  lastScoringResult,
}) => {
  const playerMap = new Map<string, MatchPlayerDTO>();
  players.forEach((p) => playerMap.set(p.userId, p));

  const formatActionDescription = (event: MatchEventDTO) => {
    const payload = (event.actionPayload || {}) as any;
    switch (event.actionType) {
      case 'PLACE_CASTLE':
        return `🏰 Placed Rank ${payload.rank || 1} Castle at (R${(payload.row ?? 0) + 1}, C${(payload.col ?? 0) + 1})`;
      case 'DRAW_AND_PLACE_TILE':
        return `📜 Drew & placed tile at (R${(payload.row ?? 0) + 1}, C${(payload.col ?? 0) + 1})`;
      case 'PLACE_SECRET_TILE':
        return `🕵️ Placed secret tile at (R${(payload.row ?? 0) + 1}, C${(payload.col ?? 0) + 1})`;
      case 'PASS':
        return `⏭️ Passed turn`;
      default:
        return `${event.actionType}`;
    }
  };

  const sortedEvents = [...events].sort((a, b) => b.sequenceNum - a.sequenceNum);

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          📜 Turn History Log ({events.length})
        </h3>
      </div>

      {/* Epoch Scoring Banner if present */}
      {lastScoringResult && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '8px',
            padding: '0.6rem 0.75rem',
            fontSize: '0.8rem',
            color: '#f8fafc',
          }}
        >
          <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '0.2rem' }}>
            📊 Epoch {lastScoringResult.epoch} Scoring Summary:
          </strong>
          {Object.entries(lastScoringResult.epochPayouts).map(([uId, payout]) => {
            const player = playerMap.get(uId);
            return (
              <div key={uId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>{player?.username || 'Player'}:</span>
                <span style={{ color: payout >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                  {payout >= 0 ? `+${payout}` : payout} 🪙
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Log List */}
      <div
        style={{
          maxHeight: '260px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          paddingRight: '0.25rem',
        }}
      >
        {sortedEvents.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', margin: '1rem 0' }}>
            No turn actions recorded yet.
          </p>
        ) : (
          sortedEvents.map((event) => {
            const player = playerMap.get(event.playerId);
            const timeStr = event.createdAt
              ? new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : `#${event.sequenceNum}`;

            return (
              <div
                key={event.id || event.sequenceNum}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '0.55rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#f8fafc' }}>
                    {player?.username || 'Player'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{timeStr}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  {formatActionDescription(event)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
