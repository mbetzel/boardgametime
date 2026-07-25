import { BasePlayerState } from '@boardgametime/game-core';

export type MapId = 'annoyed-animals' | 'clumsy-cultists' | 'puzzled-pyramid' | 'defiant-dinosaurs';

export type CellType = 'START' | 'REGULAR' | 'GRAY_ACTIVATION' | 'CHEST' | 'MONSTER';

export type ChestReward = 'BLACK_DICE' | 'TORCH' | 'EXTRA_HEALTH';

export interface MapCell {
  id: string;
  type: CellType;
  label?: string;
  value?: number; // target dice sum (2-12)
  row: number;
  col: number;
  connectedCellIds: string[];
  chestReward?: ChestReward;
  monsterId?: string;
  requiresActivationCellId?: string;
  isArmored?: boolean;
}

export interface MonsterLifeBox {
  cellId: string;
  value: number;
  requiresActivationCellId?: string;
  isArmored?: boolean;
}

export interface MonsterDef {
  id: string;
  name: string;
  isBoss: boolean;
  lifeBoxes: MonsterLifeBox[];
  rewardGems: number;
  lifePenaltyOnDefeat: number;
}

export interface DungeonMapDefinition {
  id: MapId;
  name: string;
  difficulty: 'Novice' | 'Easy' | 'Intermediate' | 'Expert';
  cells: Record<string, MapCell>;
  monsters: Record<string, MonsterDef>;
  startCellIds: string[];
}

export interface PlayerSheetState extends BasePlayerState {
  id: string;
  visitedCellIds: string[];
  damagedMonsterBoxes: Record<string, string[]>; // monsterId -> cellIds hit
  defeatedMonsterIds: string[];
  blackDieCharges: number;
  torches: number;
  health: number;
  skullsCrossed: number;
  gems: number;
  gold: number;
  extraHealthUnlocked: boolean;
}

export interface DiceRoll {
  whiteDice: [number, number, number, number];
  blackDie: number;
}

export interface PairTarget {
  diceIndices: [number, number]; // indices in 0..4 where 0..3 are white dice, 4 is black die
  targetCellId?: string;
  useTorch?: boolean;
  forfeit?: boolean;
}

export interface PairSubmission {
  useBlackDie?: boolean; // Required for passive players to use index 4
  pair1: PairTarget;
  pair2: PairTarget;
}

export type GamePhase = 'ROLLING' | 'SUBMITTING_PAIRS' | 'ROUND_RESOLVED';

export interface PlayerScoringBreakdown {
  gemsPoints: number;
  goldPoints: number;
  monsterPoints: number;
  bossDamagePoints: number;
  skullPenalties: number;
  totalVP: number;
}

export interface GameScoringSummary {
  scores: Record<string, number>;
  breakdown: Record<string, PlayerScoringBreakdown>;
  winnerPlayerId: string | null;
}

export interface DungeonsDiceDangerGameState {
  gameId: 'dungeons-dice-danger';
  mapId: MapId;
  round: number;
  turnOrder: string[];
  activePlayerId: string;
  phase: GamePhase;
  currentRoll: DiceRoll | null;
  pendingSubmissions: Record<string, PairSubmission>;
  playerStates: Record<string, PlayerSheetState>;
  isComplete: boolean;
  winnerPlayerId: string | null;
  lastScoringResult?: GameScoringSummary;
}

export type DungeonsDiceDangerAction =
  | { type: 'ROLL_DICE'; playerId: string }
  | { type: 'SUBMIT_PAIRS'; playerId: string; submission: PairSubmission }
  | { type: 'USE_TORCH'; playerId: string; targetCellId: string };
