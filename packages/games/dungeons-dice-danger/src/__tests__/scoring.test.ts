import { describe, expect, it } from 'vitest';
import { ANNOYED_ANIMALS_MAP } from '../maps/annoyedAnimals';
import { calculatePlayerScoring, scoreGame } from '../scoring';
import { PlayerSheetState } from '../types';

describe('DungeonsDiceDanger Scoring', () => {
  it('calculates VP accurately including gems, gold, and skulls', () => {
    const player: PlayerSheetState = {
      id: 'p1',
      score: 0,
      visitedCellIds: [],
      damagedMonsterBoxes: { 'purple-pup': ['m-purple-3', 'm-purple-4', 'm-purple-11'] },
      defeatedMonsterIds: ['purple-pup'],
      blackDieCharges: 3,
      torches: 0,
      health: 8,
      skullsCrossed: 2,
      gems: 4,
      gold: 2,
      extraHealthUnlocked: false,
    };

    const breakdown = calculatePlayerScoring(player, ANNOYED_ANIMALS_MAP, { p1: player });

    expect(breakdown.gemsPoints).toBe(12); // 4 * 3
    expect(breakdown.goldPoints).toBe(4); // 2 * 2
    expect(breakdown.monsterPoints).toBe(6); // boar reward 2 gems * 3
    expect(breakdown.skullPenalties).toBe(2); // 2 skulls * 1
    expect(breakdown.totalVP).toBe(12 + 4 + 6 - 2);
  });
});
