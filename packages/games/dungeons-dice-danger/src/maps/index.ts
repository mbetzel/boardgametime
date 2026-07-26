import { DungeonMapDefinition, MapId } from '../types';
import { ANNOYED_ANIMALS_MAP } from './annoyedAnimals';
import { CLUMSY_CULTISTS_MAP } from './clumsyCultists';
import { PUZZLED_PYRAMID_MAP } from './puzzledPyramid';
import { DEFIANT_DINOSAURS_MAP } from './defiantDinosaurs';

export const ALL_MAPS: Record<MapId, DungeonMapDefinition> = {
  'annoyed-animals': ANNOYED_ANIMALS_MAP,
  'clumsy-cultists': CLUMSY_CULTISTS_MAP,
  'puzzled-pyramid': PUZZLED_PYRAMID_MAP,
  'defiant-dinosaurs': DEFIANT_DINOSAURS_MAP,
};

export function getMapDefinition(mapId: MapId = 'annoyed-animals'): DungeonMapDefinition {
  return ALL_MAPS[mapId] || ANNOYED_ANIMALS_MAP;
}
