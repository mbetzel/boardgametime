export type TileType = 'RESOURCE' | 'HAZARD' | 'GOLD_MINE' | 'MOUNTAIN' | 'DRAGON';

export interface Tile {
  id: string;
  type: TileType;
  value: number; // +1..+6 for RESOURCE, -1..-6 for HAZARD, 0 for special
  name: string;
}

export interface Castle {
  rank: 1 | 2 | 3 | 4;
}

export type BoardCell =
  | { type: 'EMPTY' }
  | { type: 'TILE'; tile: Tile }
  | { type: 'CASTLE'; playerId: string; rank: 1 | 2 | 3 | 4 };

export interface KingdomsPlayerState {
  id: string;
  color: string;
  gold: number;
  availableCastles: { rank: 1 | 2 | 3 | 4; count: number }[];
  secretTile: Tile | null; // Sanitized to boolean/null for opponents
}

export interface KingdomsGameState {
  epoch: 1 | 2 | 3;
  board: BoardCell[][]; // 6 rows x 5 columns
  players: Record<string, KingdomsPlayerState>;
  drawPile: Tile[];
  turnOrder: string[];
  activePlayerId: string;
  isComplete: boolean;
  winnerPlayerId?: string;
  lastScoringResult?: GameScoringSummary;
}

export type KingdomsAction =
  | { type: 'PLACE_CASTLE'; playerId: string; rank: 1 | 2 | 3 | 4; row: number; col: number }
  | { type: 'DRAW_AND_PLACE_TILE'; playerId: string; row: number; col: number }
  | { type: 'PLACE_SECRET_TILE'; playerId: string; row: number; col: number }
  | { type: 'PASS'; playerId: string };

export interface LineSegmentScore {
  lineType: 'ROW' | 'COL';
  index: number;
  segmentIndex: number;
  baseTileSum: number;
  hasDragon: boolean;
  hasGoldMine: boolean;
  effectiveTileSum: number;
  playerRankSums: Record<string, number>;
  playerPayouts: Record<string, number>;
}

export interface GameScoringSummary {
  epoch: number;
  segmentScores: LineSegmentScore[];
  epochPayouts: Record<string, number>;
  totalGoldAfterEpoch: Record<string, number>;
}
