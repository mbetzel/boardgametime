import { isGameAvailable, GAME_DEFINITIONS, GameDefinition } from '@boardgametime/types';

export { isGameAvailable, GAME_DEFINITIONS };
export type { GameDefinition };

export const isDungeonsDiceDangerEnabled = (): boolean => {
  return isGameAvailable('dungeons-dice-danger');
};
