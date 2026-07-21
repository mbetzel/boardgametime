import { Tile } from './types';

export const OFFICIAL_KINGDOMS_TILES: Tile[] = [
  // 12 Resource Tiles (+1 to +6, 2 of each)
  { id: 'res_1_a', type: 'RESOURCE', value: 1, name: 'Farm (+1)' },
  { id: 'res_1_b', type: 'RESOURCE', value: 1, name: 'Farm (+1)' },
  { id: 'res_2_a', type: 'RESOURCE', value: 2, name: 'Lumber Mill (+2)' },
  { id: 'res_2_b', type: 'RESOURCE', value: 2, name: 'Lumber Mill (+2)' },
  { id: 'res_3_a', type: 'RESOURCE', value: 3, name: 'Village (+3)' },
  { id: 'res_3_b', type: 'RESOURCE', value: 3, name: 'Village (+3)' },
  { id: 'res_4_a', type: 'RESOURCE', value: 4, name: 'Windmill (+4)' },
  { id: 'res_4_b', type: 'RESOURCE', value: 4, name: 'Windmill (+4)' },
  { id: 'res_5_a', type: 'RESOURCE', value: 5, name: 'Watchtower (+5)' },
  { id: 'res_5_b', type: 'RESOURCE', value: 5, name: 'Watchtower (+5)' },
  { id: 'res_6_a', type: 'RESOURCE', value: 6, name: 'City (+6)' },
  { id: 'res_6_b', type: 'RESOURCE', value: 6, name: 'City (+6)' },

  // 6 Hazard Tiles (-1 to -6)
  { id: 'haz_1', type: 'HAZARD', value: -1, name: 'Bramble (-1)' },
  { id: 'haz_2', type: 'HAZARD', value: -2, name: 'Swamp (-2)' },
  { id: 'haz_3', type: 'HAZARD', value: -3, name: 'Dire Wolves (-3)' },
  { id: 'haz_4', type: 'HAZARD', value: -4, name: 'Orcs (-4)' },
  { id: 'haz_5', type: 'HAZARD', value: -5, name: 'Goblins (-5)' },
  { id: 'haz_6', type: 'HAZARD', value: -6, name: 'Troll (-6)' },

  // 1 Gold Mine Tile
  { id: 'gold_mine', type: 'GOLD_MINE', value: 0, name: 'Gold Mine (x2)' },

  // 2 Mountain Tiles
  { id: 'mountain_1', type: 'MOUNTAIN', value: 0, name: 'Mountain' },
  { id: 'mountain_2', type: 'MOUNTAIN', value: 0, name: 'Mountain' },

  // 1 Dragon Tile
  { id: 'dragon', type: 'DRAGON', value: 0, name: 'Dragon' },
];

/**
  Fisher-Yates shuffle algorithm for tile deck randomization
 */
export function shuffleDeck(tiles: Tile[], seedRandom?: () => number): Tile[] {
  const deck = [...tiles];
  const rand = seedRandom || Math.random;
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
