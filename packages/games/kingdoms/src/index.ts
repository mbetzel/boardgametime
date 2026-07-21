import { GameEngine } from '@boardgametime/game-core';

export interface KingdomsPlayerState {
  id: string;
  gold: number;
  castles: { rank: number; count: number }[];
  secretTile?: string | null;
}

export interface KingdomsGameState {
  epoch: 1 | 2 | 3;
  board: (string | null)[][];
  players: Record<string, KingdomsPlayerState>;
  drawPileCount: number;
  activePlayerId: string;
  isComplete: boolean;
}

export type KingdomsAction =
  | { type: 'PLACE_CASTLE'; playerId: string; rank: 1 | 2 | 3 | 4; row: number; col: number }
  | { type: 'DRAW_AND_PLACE_TILE'; playerId: string; row: number; col: number }
  | { type: 'PLACE_SECRET_TILE'; playerId: string; row: number; col: number }
  | { type: 'PASS'; playerId: string };

export const KINGDOMS_GAME_ID = 'kingdoms';
