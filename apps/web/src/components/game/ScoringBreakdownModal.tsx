import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { GameScoringSummary } from '@boardgametime/game-kingdoms';
import { MatchPlayerDTO } from '@boardgametime/types';

export interface ScoringBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoringResult: GameScoringSummary | null;
  players: MatchPlayerDTO[];
}

export const ScoringBreakdownModal: React.FC<ScoringBreakdownModalProps> = ({
  isOpen,
  onClose,
  scoringResult,
  players,
}) => {
  if (!scoringResult) return null;

  const playerMap: Record<string, string> = {};
  players.forEach((p) => {
    playerMap[p.userId] = p.username;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Epoch ${scoringResult.epoch} Scoring Breakdown`}
      footer={
        <Button variant="gold" onClick={onClose}>
          Continue Game
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Total Gold Summary */}
        <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.75rem' }}>
            Epoch Payouts & Total Gold
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {Object.entries(scoringResult.totalGoldAfterEpoch).map(([userId, totalGold]) => {
              const payout = scoringResult.epochPayouts[userId] || 0;
              const name = playerMap[userId] || 'Player';
              return (
                <div key={userId} style={{ backgroundColor: '#1e293b', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>{name}</div>
                  <div style={{ fontSize: '0.8rem', color: payout >= 0 ? '#34d399' : '#f87171', marginTop: '0.2rem' }}>
                    Epoch: {payout >= 0 ? `+${payout}` : payout} 🪙
                  </div>
                  <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '1rem', marginTop: '0.2rem' }}>
                    Total: {totalGold} 🪙
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Segment Breakdown Table */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
            Line Segment Scores Breakdown:
          </h4>
          <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#f59e0b' }}>
                  <th style={{ padding: '0.5rem' }}>Line</th>
                  <th style={{ padding: '0.5rem' }}>Base Sum</th>
                  <th style={{ padding: '0.5rem' }}>Effects</th>
                  <th style={{ padding: '0.5rem' }}>Effective Tile Score</th>
                  <th style={{ padding: '0.5rem' }}>Payouts</th>
                </tr>
              </thead>
              <tbody>
                {scoringResult.segmentScores.map((seg, idx) => {
                  const lineLabel = `${seg.lineType} ${seg.index + 1}`;
                  const effects = [];
                  if (seg.hasDragon) effects.push('🐉 Dragon');
                  if (seg.hasGoldMine) effects.push('🪙 x2 Mine');

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: idx % 2 === 0 ? 'rgba(15,23,42,0.5)' : 'transparent' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 600, color: '#f8fafc' }}>{lineLabel}</td>
                      <td style={{ padding: '0.5rem', color: '#cbd5e1' }}>{seg.baseTileSum}</td>
                      <td style={{ padding: '0.5rem' }}>
                        {effects.length > 0 ? (
                          <Badge variant="warning" size="sm">
                            {effects.join(', ')}
                          </Badge>
                        ) : (
                          <span style={{ color: '#64748b' }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem', fontWeight: 700, color: seg.effectiveTileSum >= 0 ? '#34d399' : '#f87171' }}>
                        {seg.effectiveTileSum}
                      </td>
                      <td style={{ padding: '0.5rem', color: '#cbd5e1' }}>
                        {Object.entries(seg.playerPayouts).map(([uId, amt]) => {
                          const pName = playerMap[uId] || 'P';
                          return `${pName}: ${amt >= 0 ? `+${amt}` : amt}`;
                        }).join(' | ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};
