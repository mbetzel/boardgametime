import React, { useState } from 'react';
import { DiceRoll, PairSubmission } from '@boardgametime/game-dungeons-dice-danger';

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
      return; // Cannot select black die unless passive player toggled useBlackDie
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
    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 text-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-amber-400">🎲 Roll & Pair Selector</h3>
        {!isActivePlayer && (
          <label className="flex items-center space-x-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer">
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
              className="accent-amber-500 rounded"
            />
            <span className="text-slate-300">
              Use Black Die ({blackDieCharges} charges left)
            </span>
          </label>
        )}
      </div>

      {/* Dice Visualizer */}
      <div className="flex justify-center items-center space-x-3 py-2">
        {roll.whiteDice.map((val, idx) => {
          const inP1 = selectedForPair1.includes(idx);
          const inP2 = selectedForPair2.includes(idx);
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => handleDieClick(idx)}
              className={`w-12 h-12 rounded-xl text-xl font-bold font-mono transition-all transform hover:scale-105 shadow-md flex items-center justify-center border-2 ${
                inP1
                  ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-400/50'
                  : inP2
                  ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-400/50'
                  : 'bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-500'
              }`}
            >
              {val}
            </button>
          );
        })}

        {/* Black Die */}
        <button
          disabled={disabled || (!isActivePlayer && !useBlackDie)}
          onClick={() => handleDieClick(4)}
          className={`w-12 h-12 rounded-xl text-xl font-bold font-mono transition-all transform hover:scale-105 shadow-md flex items-center justify-center border-2 ${
            !isActivePlayer && !useBlackDie
              ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
              : selectedForPair1.includes(4)
              ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-400/50'
              : selectedForPair2.includes(4)
              ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-400/50'
              : 'bg-black border-amber-500 text-amber-400 hover:border-amber-300'
          }`}
        >
          {roll.blackDie}
        </button>
      </div>

      {/* Pairs Summary */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* Pair 1 */}
        <div className="bg-slate-950 p-3 rounded-xl border border-blue-900/50 flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-blue-400 font-semibold">Pair 1</span>
            <label className="text-xs text-slate-400 flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={forfeit1}
                onChange={(e) => {
                  setForfeit1(e.target.checked);
                  if (e.target.checked) setSelectedForPair1([]);
                }}
                className="accent-rose-500"
              />
              <span>Forfeit (-1 HP)</span>
            </label>
          </div>
          <div className="text-lg font-bold text-center py-1 bg-slate-900 rounded border border-slate-800">
            {forfeit1 ? '❌ Forfeited' : sum1 !== null ? `Sum: ${sum1}` : 'Select 2 Dice'}
          </div>
        </div>

        {/* Pair 2 */}
        <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/50 flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 font-semibold">Pair 2</span>
            <label className="text-xs text-slate-400 flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={forfeit2}
                onChange={(e) => {
                  setForfeit2(e.target.checked);
                  if (e.target.checked) setSelectedForPair2([]);
                }}
                className="accent-rose-500"
              />
              <span>Forfeit (-1 HP)</span>
            </label>
          </div>
          <div className="text-lg font-bold text-center py-1 bg-slate-900 rounded border border-slate-800">
            {forfeit2 ? '❌ Forfeited' : sum2 !== null ? `Sum: ${sum2}` : 'Select 2 Dice'}
          </div>
        </div>
      </div>

      <button
        disabled={!isValid || disabled}
        onClick={handleSubmit}
        className={`w-full py-3 rounded-xl font-bold text-center transition-all ${
          isValid && !disabled
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        Submit Pair Selections
      </button>
    </div>
  );
};
