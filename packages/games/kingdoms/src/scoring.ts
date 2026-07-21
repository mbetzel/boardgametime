import { BoardCell, GameScoringSummary, LineSegmentScore, Tile } from './types';

export const BOARD_ROWS = 6;
export const BOARD_COLS = 5;

/**
 * Calculates line segment scores for a sequence of cells (row or column)
 */
export function scoreLineSequence(
  cells: BoardCell[],
  lineType: 'ROW' | 'COL',
  index: number,
  playerIds: string[]
): LineSegmentScore[] {
  // 1. Split sequence by Mountain cells
  const segments: BoardCell[][] = [];
  let currentSegment: BoardCell[] = [];

  for (const cell of cells) {
    if (cell.type === 'TILE' && cell.tile.type === 'MOUNTAIN') {
      segments.push(currentSegment);
      currentSegment = [];
    } else {
      currentSegment.push(cell);
    }
  }
  segments.push(currentSegment);

  // 2. Score each segment independently
  return segments.map((segmentCells, segmentIndex) => {
    let baseTileSum = 0;
    let hasDragon = false;
    let hasGoldMine = false;
    let positiveResourceSum = 0;
    let hazardSum = 0;

    const playerRankSums: Record<string, number> = {};
    for (const pid of playerIds) {
      playerRankSums[pid] = 0;
    }

    for (const cell of segmentCells) {
      if (cell.type === 'TILE') {
        const tile = cell.tile;
        if (tile.type === 'RESOURCE') {
          positiveResourceSum += tile.value;
          baseTileSum += tile.value;
        } else if (tile.type === 'HAZARD') {
          hazardSum += tile.value; // negative value e.g. -6
          baseTileSum += tile.value;
        } else if (tile.type === 'DRAGON') {
          hasDragon = true;
        } else if (tile.type === 'GOLD_MINE') {
          hasGoldMine = true;
        }
      } else if (cell.type === 'CASTLE') {
        playerRankSums[cell.playerId] = (playerRankSums[cell.playerId] || 0) + cell.rank;
      }
    }

    // Dragon cancels positive resource tiles
    const activeResourceSum = hasDragon ? 0 : positiveResourceSum;
    let effectiveTileSum = activeResourceSum + hazardSum;

    // Gold Mine doubles the net sum
    if (hasGoldMine) {
      effectiveTileSum *= 2;
    }

    // Payout per player = effectiveTileSum * player's total castle rank in segment
    const playerPayouts: Record<string, number> = {};
    for (const pid of playerIds) {
      playerPayouts[pid] = effectiveTileSum * (playerRankSums[pid] || 0);
    }

    return {
      lineType,
      index,
      segmentIndex,
      baseTileSum,
      hasDragon,
      hasGoldMine,
      effectiveTileSum,
      playerRankSums,
      playerPayouts,
    };
  });
}

/**
 * Computes full board scoring for an Epoch
 */
export function scoreBoard(
  board: BoardCell[][],
  epoch: number,
  playerIds: string[],
  currentGold: Record<string, number>
): GameScoringSummary {
  const segmentScores: LineSegmentScore[] = [];

  // Score all 6 rows
  for (let r = 0; r < BOARD_ROWS; r++) {
    const rowCells = board[r];
    const scores = scoreLineSequence(rowCells, 'ROW', r, playerIds);
    segmentScores.push(...scores);
  }

  // Score all 5 columns
  for (let c = 0; c < BOARD_COLS; c++) {
    const colCells: BoardCell[] = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      colCells.push(board[r][c]);
    }
    const scores = scoreLineSequence(colCells, 'COL', c, playerIds);
    segmentScores.push(...scores);
  }

  // Sum payouts per player
  const epochPayouts: Record<string, number> = {};
  const totalGoldAfterEpoch: Record<string, number> = {};

  for (const pid of playerIds) {
    epochPayouts[pid] = 0;
  }

  for (const seg of segmentScores) {
    for (const pid of playerIds) {
      epochPayouts[pid] += seg.playerPayouts[pid] || 0;
    }
  }

  for (const pid of playerIds) {
    totalGoldAfterEpoch[pid] = (currentGold[pid] || 0) + epochPayouts[pid];
  }

  return {
    epoch,
    segmentScores,
    epochPayouts,
    totalGoldAfterEpoch,
  };
}
