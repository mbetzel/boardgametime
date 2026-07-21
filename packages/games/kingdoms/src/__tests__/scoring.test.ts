import { describe, expect, it } from 'vitest';
import { scoreBoard, scoreLineSequence } from '../scoring';
import { BoardCell, Tile } from '../types';

describe('Kingdoms Scoring Calculator', () => {
  const p1 = 'white';
  const p2 = 'grey';
  const p3 = 'black';
  const players = [p1, p2, p3];

  it('scores basic line sequence with resources and hazards', () => {
    // Row 1 rulebook example: Village (+3) + Troll (-6) => base = -3
    const village: Tile = { id: 'v1', type: 'RESOURCE', value: 3, name: 'Village (+3)' };
    const troll: Tile = { id: 't1', type: 'HAZARD', value: -6, name: 'Troll (-6)' };

    const cells: BoardCell[] = [
      { type: 'TILE', tile: village },
      { type: 'CASTLE', playerId: p1, rank: 4 },
      { type: 'CASTLE', playerId: p1, rank: 1 },
      { type: 'CASTLE', playerId: p2, rank: 1 },
      { type: 'CASTLE', playerId: p3, rank: 1 },
      { type: 'TILE', tile: troll },
    ];

    const scores = scoreLineSequence(cells, 'ROW', 0, players);

    expect(scores).toHaveLength(1); // No Mountain, single segment
    const seg = scores[0];

    expect(seg.baseTileSum).toBe(-3);
    expect(seg.effectiveTileSum).toBe(-3);
    expect(seg.playerRankSums[p1]).toBe(5); // 4 + 1
    expect(seg.playerRankSums[p2]).toBe(1);
    expect(seg.playerRankSums[p3]).toBe(1);

    // Payouts: effective (-3) * rankSum
    expect(seg.playerPayouts[p1]).toBe(-15);
    expect(seg.playerPayouts[p2]).toBe(-3);
    expect(seg.playerPayouts[p3]).toBe(-3);
  });

  it('handles Dragon cancellation of positive resources', () => {
    // Row 4 left side: Dragon cancels Village (+3) => effective resource sum = 0
    const dragon: Tile = { id: 'd1', type: 'DRAGON', value: 0, name: 'Dragon' };
    const village: Tile = { id: 'v1', type: 'RESOURCE', value: 3, name: 'Village (+3)' };

    const cells: BoardCell[] = [
      { type: 'TILE', tile: dragon },
      { type: 'TILE', tile: village },
      { type: 'CASTLE', playerId: p1, rank: 2 },
    ];

    const scores = scoreLineSequence(cells, 'ROW', 3, players);
    expect(scores[0].hasDragon).toBe(true);
    expect(scores[0].effectiveTileSum).toBe(0); // Dragon cancels Village (+3)
    expect(scores[0].playerPayouts[p1]).toBe(0);
  });

  it('handles Mountain line segment splitting', () => {
    // Row 4 rulebook example: Dragon + Village | Mountain | Watchtower (+5) + Grey Rank-1 castle
    const dragon: Tile = { id: 'd1', type: 'DRAGON', value: 0, name: 'Dragon' };
    const village: Tile = { id: 'v1', type: 'RESOURCE', value: 3, name: 'Village (+3)' };
    const mountain: Tile = { id: 'm1', type: 'MOUNTAIN', value: 0, name: 'Mountain' };
    const watchtower: Tile = { id: 'w1', type: 'RESOURCE', value: 5, name: 'Watchtower (+5)' };

    const cells: BoardCell[] = [
      { type: 'TILE', tile: dragon },
      { type: 'TILE', tile: village },
      { type: 'CASTLE', playerId: p1, rank: 2 },
      { type: 'TILE', tile: mountain },
      { type: 'TILE', tile: watchtower },
      { type: 'CASTLE', playerId: p2, rank: 1 },
    ];

    const scores = scoreLineSequence(cells, 'ROW', 3, players);
    expect(scores).toHaveLength(2); // Mountain splits into 2 segments

    // Left segment
    expect(scores[0].effectiveTileSum).toBe(0); // Dragon cancels +3
    expect(scores[0].playerPayouts[p1]).toBe(0);

    // Right segment
    expect(scores[1].effectiveTileSum).toBe(5); // Watchtower +5
    expect(scores[1].playerPayouts[p2]).toBe(5); // 5 * 1 rank
  });

  it('handles Gold Mine doubling of net tile values', () => {
    // Col 2 rulebook example: Windmill (+4) cancelled by Dragon -> Dire Wolves (-3) -> doubled by Gold Mine = -6
    const dragon: Tile = { id: 'd1', type: 'DRAGON', value: 0, name: 'Dragon' };
    const windmill: Tile = { id: 'w1', type: 'RESOURCE', value: 4, name: 'Windmill (+4)' };
    const wolves: Tile = { id: 'h1', type: 'HAZARD', value: -3, name: 'Dire Wolves (-3)' };
    const goldMine: Tile = { id: 'gm', type: 'GOLD_MINE', value: 0, name: 'Gold Mine' };

    const cells: BoardCell[] = [
      { type: 'TILE', tile: dragon },
      { type: 'TILE', tile: windmill },
      { type: 'TILE', tile: wolves },
      { type: 'TILE', tile: goldMine },
      { type: 'CASTLE', playerId: p2, rank: 1 },
    ];

    const scores = scoreLineSequence(cells, 'COL', 1, players);
    expect(scores[0].hasDragon).toBe(true);
    expect(scores[0].hasGoldMine).toBe(true);

    // Base effective before Gold Mine: 0 (Windmill cancelled) + (-3 Dire Wolves) = -3
    // Doubled by Gold Mine: -3 * 2 = -6
    expect(scores[0].effectiveTileSum).toBe(-6);
    expect(scores[0].playerPayouts[p2]).toBe(-6);
  });
});
