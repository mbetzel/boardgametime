import React, { useState } from 'react';
import { DiceRoll, PairSubmission } from '@boardgametime/game-dungeons-dice-danger';
import { Button } from '../../ui/Button';

interface DicePairSelectorProps {
  roll: DiceRoll;
  isActivePlayer: boolean;
  blackDieCharges: number;
  onSubmitPairs: (submission: PairSubmission) => void;
  disabled?: boolean;
}

export const DicePairSelector: React.FC<DicePairSelectorProps> = ({
  roll,
  isActivePlayer,
  blackDieCharges,
  onSubmitPairs,
  disabled = false,
}) => {
  const [selectedForPair1, setSelectedForPair1] = useState<number[]>([]);
  const [selectedForPair2, setSelectedForPair2] = useState<number[]>([]);
  const [useBlackDie, setUseBlackDie] = useState<boolean>(isActivePlayer);
  const [forfeit1, setForfeit1] = useState<boolean>(false);
  const [forfeit2, setForfeit2] = useState<boolean>(false);

  const allDice = [...roll.whiteDice, roll.blackDie];

  const handleDieClick = (index: number) => {
    if (disabled) return;
    if (index === 4 && !isActivePlayer && !useBlackDie) {
      return;
    }

    if (selectedForPair1.includes(index)) {
      setSelectedForPair1(selectedForPair1.filter((i) => i !== index));
    } else if (selectedForPair2.includes(index)) {
      setSelectedForPair2(selectedForPair2.filter((i) => i !== index));
    } else if (selectedForPair1.length < 2 && !forfeit1) {
      setSelectedForPair1([...selectedForPair1, index]);
    } else if (selectedForPair2.length < 2 && !forfeit2) {
      setSelectedForPair2([...selectedForPair2, index]);
    }
  };

  const getSum = (indices: number[]) => {
    if (indices.length < 2) return null;
    return allDice[indices[0]] + allDice[indices[1]];
  };

  const sum1 = getSum(selectedForPair1);
  const sum2 = getSum(selectedForPair2);

  const isValid =
    (forfeit1 || selectedForPair1.length === 2) &&
    (forfeit2 || selectedForPair2.length === 2);

  const handleSubmit = () => {
    if (!isValid || disabled) return;

    const sub: PairSubmission = {
      useBlackDie: !isActivePlayer && useBlackDie,
      pair1: {
        diceIndices: (selectedForPair1 as [number, number]) || [0, 1],
        forfeit: forfeit1,
      },
      pair2: {
        diceIndices: (selectedForPair2 as [number, number]) || [2, 3],
        forfeit: forfeit2,
      },
    };
    onSubmitPairs(sub);
  };

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        color: '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🎲 Roll & Pair Selector
        </h3>
        {!isActivePlayer && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', background: '#0f172a', padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useBlackDie}
              disabled={blackDieCharges <= 0 || disabled}
              onChange={(e) => {
                setUseBlackDie(e.target.checked);
                if (!e.target.checked) {
                  setSelectedForPair1(selectedForPair1.filter((i) => i !== 4));
                  setSelectedForPair2(selectedForPair2.filter((i) => i !== 4));
                }
              }}
            />
            <span>Use Black Die ({blackDieCharges} left)</span>
          </label>
        )}
      </div>

      {/* Dice visual buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0' }}>
        {roll.whiteDice.map((val, idx) => {
          const inP1 = selectedForPair1.includes(idx);
          const inP2 = selectedForPair2.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleDieClick(idx)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                fontSize: '1.25rem',
                fontWeight: 800,
                fontFamily: 'monospace',
                backgroundColor: inP1 ? '#2563eb' : inP2 ? '#059669' : '#0f172a',
                border: inP1 ? '2px solid #60a5fa' : inP2 ? '2px solid #34d399' : '1px solid #334155',
                color: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                boxShadow: inP1 ? '0 0 10px rgba(96, 165, 250, 0.4)' : inP2 ? '0 0 10px rgba(52, 211, 153, 0.4)' : 'none',
              }}
            >
              {val}
            </button>
          );
        })}

        {/* Black Die */}
        <button
          type="button"
          disabled={disabled || (!isActivePlayer && !useBlackDie)}
          onClick={() => handleDieClick(4)}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            fontSize: '1.25rem',
            fontWeight: 800,
            fontFamily: 'monospace',
            backgroundColor: selectedForPair1.includes(4)
              ? '#2563eb'
              : selectedForPair2.includes(4)
              ? '#059669'
              : '#000000',
            border: selectedForPair1.includes(4)
              ? '2px solid #60a5fa'
              : selectedForPair2.includes(4)
              ? '2px solid #34d399'
              : '2px solid #f59e0b',
            color: '#fbbf24',
            cursor: !isActivePlayer && !useBlackDie ? 'not-allowed' : 'pointer',
            opacity: !isActivePlayer && !useBlackDie ? 0.4 : 1,
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {roll.blackDie}
        </button>
      </div>

      {/* Pairs Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
        {/* Pair 1 */}
        <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#60a5fa', fontWeight: 700 }}>Pair 1</span>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={forfeit1}
                onChange={(e) => {
                  setForfeit1(e.target.checked);
                  if (e.target.checked) setSelectedForPair1([]);
                }}
              />
              <span>Forfeit (-1 HP)</span>
            </label>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, textAlign: 'center', padding: '0.4rem', backgroundColor: '#1e293b', borderRadius: '6px', color: '#f8fafc' }}>
            {forfeit1 ? '❌ Forfeited' : sum1 !== null ? `Sum: ${sum1}` : 'Select 2 Dice'}
          </div>
        </div>

        {/* Pair 2 */}
        <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#34d399', fontWeight: 700 }}>Pair 2</span>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={forfeit2}
                onChange={(e) => {
                  setForfeit2(e.target.checked);
                  if (e.target.checked) setSelectedForPair2([]);
                }}
              />
              <span>Forfeit (-1 HP)</span>
            </label>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, textAlign: 'center', padding: '0.4rem', backgroundColor: '#1e293b', borderRadius: '6px', color: '#f8fafc' }}>
            {forfeit2 ? '❌ Forfeited' : sum2 !== null ? `Sum: ${sum2}` : 'Select 2 Dice'}
          </div>
        </div>
      </div>

      <Button
        variant="gold"
        fullWidth
        disabled={!isValid || disabled}
        onClick={handleSubmit}
      >
        Submit Pair Selections
      </Button>
    </div>
  );
};
