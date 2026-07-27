import { DungeonMapDefinition } from '../types';

export const ANNOYED_ANIMALS_MAP: DungeonMapDefinition = {
  id: 'annoyed-animals',
  name: 'Annoyed Animals',
  difficulty: 'Novice',
  startCellIds: [
    'start-2-tl', 'start-9-tl', 'start-6-tl', 'start-7-tl', 'start-3-fl', 'start-12-fl',
    'start-3-tr', 'start-4-tr', 'start-5-tr', 'start-8-tr', 'start-10-tr', 'start-11-tr',
  ],
  cells: {
    // === ZONE 1: TOP-LEFT & FAR LEFT ===
    'start-2-tl': { id: 'start-2-tl', type: 'START', label: '2', value: 2, row: 0, col: 2, x: 18.0, y: 7.0, connectedCellIds: ['start-9-tl', 'white-4-tl'] },
    'start-9-tl': { id: 'start-9-tl', type: 'START', label: '9', value: 9, row: 1, col: 2, x: 18.0, y: 15.0, connectedCellIds: ['start-2-tl', 'start-6-tl', 'white-4-tl'] },
    'start-6-tl': { id: 'start-6-tl', type: 'START', label: '6', value: 6, row: 2, col: 2, x: 18.0, y: 23.0, connectedCellIds: ['start-9-tl', 'start-7-tl', 'white-10-tl'] },
    'start-7-tl': { id: 'start-7-tl', type: 'START', label: '7', value: 7, row: 3, col: 2, x: 18.0, y: 31.0, connectedCellIds: ['start-6-tl', 'start-3-fl', 'white-10-tl'] },
    'start-3-fl': { id: 'start-3-fl', type: 'START', label: '3', value: 3, row: 3, col: 1, x: 11.0, y: 31.0, connectedCellIds: ['start-12-fl', 'start-7-tl', 'white-6-fl'] },
    'start-12-fl': { id: 'start-12-fl', type: 'START', label: '12', value: 12, row: 3, col: 0, x: 4.0, y: 31.0, connectedCellIds: ['start-3-fl', 'white-5-fl'] },
    'white-4-tl': { id: 'white-4-tl', type: 'REGULAR', label: '4 (Equal Dice)', value: 4, requiresEqualDice: true, row: 0, col: 3, x: 26.0, y: 11.0, connectedCellIds: ['start-2-tl', 'start-9-tl', 'white-7-top', 'monster-purple-pup'] },
    'white-10-tl': { id: 'white-10-tl', type: 'REGULAR', label: '10', value: 10, row: 2, col: 3, x: 26.0, y: 27.0, connectedCellIds: ['start-6-tl', 'start-7-tl', 'white-7-top', 'monster-grey-hound'] },
    'white-5-fl': { id: 'white-5-fl', type: 'REGULAR', label: '5', value: 5, row: 4, col: 0, x: 4.0, y: 41.0, connectedCellIds: ['start-12-fl', 'white-6-fl', 'activate-4-fl'] },
    'white-6-fl': { id: 'white-6-fl', type: 'REGULAR', label: '6', value: 6, row: 4, col: 1, x: 11.0, y: 41.0, connectedCellIds: ['start-3-fl', 'white-5-fl', 'monster-grey-hound'] },
    'activate-4-fl': { id: 'activate-4-fl', type: 'GRAY_ACTIVATION', label: '4 (Star)', value: 4, row: 5, col: 1, x: 5.5, y: 51.0, connectedCellIds: ['white-5-fl', 'white-12-bl'] },
    'white-12-bl': { id: 'white-12-bl', type: 'REGULAR', label: '12 (Equal Dice)', value: 12, requiresEqualDice: true, row: 6, col: 1, x: 5.5, y: 61.0, connectedCellIds: ['activate-4-fl', 'white-2-bl'] },
    'white-2-bl': { id: 'white-2-bl', type: 'REGULAR', label: '2 (Equal Dice)', value: 2, requiresEqualDice: true, row: 6, col: 2, x: 13.0, y: 61.0, connectedCellIds: ['white-12-bl', 'white-5-bl'] },
    'white-5-bl': { id: 'white-5-bl', type: 'REGULAR', label: '5', value: 5, row: 5, col: 3, x: 20.5, y: 53.0, connectedCellIds: ['white-2-bl', 'white-7-bm', 'monster-grey-hound', 'activate-6-bl'] },
    'white-7-bm': { id: 'white-7-bm', type: 'REGULAR', label: '7', value: 7, row: 6, col: 4, x: 28.0, y: 57.0, connectedCellIds: ['white-5-bl', 'monster-grey-hound', 'activate-6-bl'] },

    // Monster 1: Purple Pup (Unified Node)
    'monster-purple-pup': {
      id: 'monster-purple-pup',
      type: 'MONSTER',
      label: 'Purple Pup',
      monsterId: 'purple-pup',
      row: 1,
      col: 5,
      x: 35.5,
      y: 14.5,
      connectedCellIds: ['white-4-tl', 'white-3-top'],
      monsterLifeBoxes: [
        { cellId: 'm-purple-3', value: 3 },
        { cellId: 'm-purple-4', value: 4 },
        { cellId: 'm-purple-11', value: 11 },
      ],
    },

    // Monster 2: Grey Hound (Unified Node)
    'monster-grey-hound': {
      id: 'monster-grey-hound',
      type: 'MONSTER',
      label: 'Grey Hound',
      monsterId: 'grey-hound',
      row: 5,
      col: 3,
      x: 23.0,
      y: 43.0,
      connectedCellIds: ['white-10-tl', 'white-6-fl', 'white-5-bl', 'white-7-bm', 'white-9-mid'],
      monsterLifeBoxes: [
        { cellId: 'm-grey-6', value: 6 },
        { cellId: 'm-grey-8', value: 8 },
        { cellId: 'm-grey-10', value: 10 },
      ],
    },

    // === ZONE 2: TOP-CENTER & CHEST 11 AREA ===
    'white-7-top': { id: 'white-7-top', type: 'REGULAR', label: '7', value: 7, row: 2, col: 4, x: 32.5, y: 23.5, connectedCellIds: ['white-4-tl', 'white-10-tl', 'white-3-top', 'white-9-mid'] },
    'white-3-top': { id: 'white-3-top', type: 'REGULAR', label: '3', value: 3, row: 2, col: 5, x: 39.5, y: 23.5, connectedCellIds: ['white-7-top', 'monster-purple-pup', 'white-9-mid'] },
    'white-9-mid': { id: 'white-9-mid', type: 'REGULAR', label: '9', value: 9, row: 3, col: 4, x: 34.0, y: 36.0, connectedCellIds: ['white-7-top', 'white-3-top', 'monster-grey-hound', 'chest-11'] },
    'chest-11': { id: 'chest-11', type: 'CHEST', label: 'Chest 11 (+1 Torch)', row: 3, col: 5, x: 38.5, y: 32.0, connectedCellIds: ['white-9-mid', 'white-12-gem', 'white-10-gem'], chestReward: 'TORCH' },
    'activate-10-top': { id: 'activate-10-top', type: 'GRAY_ACTIVATION', label: '10 (Star)', value: 10, row: 0, col: 6, x: 45.5, y: 7.0, connectedCellIds: ['white-12-uc'] },
    'white-12-uc': { id: 'white-12-uc', type: 'REGULAR', label: '12 (Equal Dice)', value: 12, requiresEqualDice: true, row: 1, col: 6, x: 47.5, y: 15.0, connectedCellIds: ['activate-10-top', 'activate-12-tr', 'white-10-gem'] },
    'white-10-gem': { id: 'white-10-gem', type: 'REGULAR', label: '10', value: 10, row: 2, col: 6, x: 45.0, y: 26.0, connectedCellIds: ['white-12-uc', 'chest-11', 'white-12-gem', 'white-9-center'] },
    'white-12-gem': { id: 'white-12-gem', type: 'REGULAR', label: '12', value: 12, row: 3, col: 6, x: 43.0, y: 37.5, connectedCellIds: ['white-10-gem', 'chest-11', 'white-3-center', 'white-10-boss-left'] },
    'white-9-center': { id: 'white-9-center', type: 'REGULAR', label: '9', value: 9, row: 2, col: 7, x: 53.0, y: 30.0, connectedCellIds: ['white-10-gem', 'white-6-center', 'white-3-center', 'white-2-tr'] },
    'white-3-center': { id: 'white-3-center', type: 'REGULAR', label: '3', value: 3, row: 3, col: 7, x: 49.5, y: 38.5, connectedCellIds: ['white-9-center', 'white-12-gem', 'monster-boss-bearpion'] },
    'white-6-center': { id: 'white-6-center', type: 'REGULAR', label: '6', value: 6, row: 2, col: 8, x: 60.0, y: 30.0, connectedCellIds: ['white-9-center', 'white-2-tr', 'white-11-center'] },
    'white-11-center': { id: 'white-11-center', type: 'REGULAR', label: '11', value: 11, row: 3, col: 8, x: 63.5, y: 38.5, connectedCellIds: ['white-6-center', 'white-7-tr'] },
    'white-10-boss-left': { id: 'white-10-boss-left', type: 'REGULAR', label: '10', value: 10, row: 4, col: 6, x: 42.0, y: 48.5, connectedCellIds: ['white-12-gem', 'white-5-boss-left'] },
    'white-5-boss-left': { id: 'white-5-boss-left', type: 'REGULAR', label: '5', value: 5, row: 5, col: 6, x: 46.0, y: 57.0, connectedCellIds: ['white-10-boss-left', 'white-7-bm-low'] },

    // === ZONE 3: TOP-RIGHT & MIDDLE RIGHT ===
    'activate-12-tr': { id: 'activate-12-tr', type: 'GRAY_ACTIVATION', label: '12 (Star)', value: 12, row: 0, col: 8, x: 54.5, y: 10.0, connectedCellIds: ['white-12-uc', 'white-2-tr'] },
    'white-2-tr': { id: 'white-2-tr', type: 'REGULAR', label: '2 (Equal Dice)', value: 2, requiresEqualDice: true, row: 1, col: 8, x: 58.5, y: 17.5, connectedCellIds: ['activate-12-tr', 'white-8-tr', 'white-6-center', 'white-9-center'] },
    'white-8-tr': { id: 'white-8-tr', type: 'REGULAR', label: '8 (Equal Dice)', value: 8, requiresEqualDice: true, row: 2, col: 8.5, x: 57.0, y: 24.5, connectedCellIds: ['white-2-tr', 'white-9-tr', 'white-7-tr'] },
    'start-3-tr': { id: 'start-3-tr', type: 'START', label: '3', value: 3, row: 0, col: 10, x: 67.0, y: 10.5, connectedCellIds: ['start-4-tr'] },
    'start-4-tr': { id: 'start-4-tr', type: 'START', label: '4', value: 4, row: 0, col: 11, x: 74.0, y: 10.5, connectedCellIds: ['start-3-tr', 'start-5-tr'] },
    'start-5-tr': { id: 'start-5-tr', type: 'START', label: '5', value: 5, row: 1, col: 11, x: 76.0, y: 18.0, connectedCellIds: ['start-4-tr', 'start-8-tr'] },
    'start-8-tr': { id: 'start-8-tr', type: 'START', label: '8', value: 8, row: 2, col: 11, x: 76.5, y: 26.0, connectedCellIds: ['start-5-tr', 'start-10-tr', 'white-9-tr'] },
    'start-10-tr': { id: 'start-10-tr', type: 'START', label: '10', value: 10, row: 3, col: 11, x: 76.0, y: 34.0, connectedCellIds: ['start-8-tr', 'start-11-tr', 'white-2-gem-tr'] },
    'start-11-tr': { id: 'start-11-tr', type: 'START', label: '11', value: 11, row: 4, col: 11, x: 77.5, y: 42.0, connectedCellIds: ['start-10-tr', 'chest-3-mr'] },
    'white-9-tr': { id: 'white-9-tr', type: 'REGULAR', label: '9', value: 9, row: 2, col: 10, x: 70.0, y: 24.5, connectedCellIds: ['start-8-tr', 'white-8-tr', 'monster-green-growler'] },
    'white-7-tr': { id: 'white-7-tr', type: 'REGULAR', label: '7', value: 7, row: 3, col: 9.5, x: 65.5, y: 34.5, connectedCellIds: ['white-8-tr', 'white-11-center', 'white-2-gem-tr', 'monster-green-growler'] },
    'white-2-gem-tr': { id: 'white-2-gem-tr', type: 'REGULAR', label: '2 (Equal Dice)', value: 2, requiresEqualDice: true, row: 3, col: 10, x: 70.5, y: 34.0, connectedCellIds: ['white-7-tr', 'start-10-tr', 'chest-3-mr'] },
    'chest-3-mr': { id: 'chest-3-mr', type: 'CHEST', label: 'Chest 3 (+3 HP & Gem)', row: 5, col: 10, x: 76.5, y: 50.5, connectedCellIds: ['start-11-tr', 'white-2-gem-tr', 'white-12-gem-mr', 'white-4-mr'], chestReward: 'EXTRA_HEALTH' },
    'white-12-gem-mr': { id: 'white-12-gem-mr', type: 'REGULAR', label: '12 (Equal Dice)', value: 12, requiresEqualDice: true, row: 5, col: 11, x: 84.0, y: 48.0, connectedCellIds: ['chest-3-mr'] },
    'white-4-mr': { id: 'white-4-mr', type: 'REGULAR', label: '4', value: 4, row: 6, col: 10, x: 71.5, y: 55.5, connectedCellIds: ['chest-3-mr', 'white-7-br-mid'] },

    // Monster 3: Green Growler (Unified Node)
    'monster-green-growler': {
      id: 'monster-green-growler',
      type: 'MONSTER',
      label: 'Green Growler',
      monsterId: 'green-growler',
      row: 2,
      col: 10,
      x: 64.5,
      y: 22.5,
      connectedCellIds: ['white-7-tr', 'white-9-tr'],
      monsterLifeBoxes: [
        { cellId: 'm-growler-3', value: 3 },
        { cellId: 'm-growler-5', value: 5 },
        { cellId: 'm-growler-9', value: 9 },
      ],
    },

    // === ZONE 4: BOTTOM-LEFT & WHITE WOLF AREA ===
    'activate-6-bl': { id: 'activate-6-bl', type: 'GRAY_ACTIVATION', label: '6 (Star)', value: 6, row: 7, col: 3, x: 14.0, y: 69.0, connectedCellIds: ['white-5-bl', 'white-7-bm', 'white-2-bl-gem'] },
    'white-2-bl-gem': { id: 'white-2-bl-gem', type: 'REGULAR', label: '2 (Equal Dice)', value: 2, requiresEqualDice: true, row: 7, col: 4, x: 21.0, y: 66.5, connectedCellIds: ['activate-6-bl', 'white-5-bl-low', 'white-6-bm'] },
    'white-5-bl-low': { id: 'white-5-bl-low', type: 'REGULAR', label: '5', value: 5, row: 8, col: 4, x: 21.0, y: 77.5, connectedCellIds: ['white-2-bl-gem', 'monster-white-wolf'] },
    'white-6-bm': { id: 'white-6-bm', type: 'REGULAR', label: '6', value: 6, row: 7, col: 5, x: 28.5, y: 66.5, connectedCellIds: ['white-2-bl-gem', 'white-8-bm'] },
    'white-8-bm': { id: 'white-8-bm', type: 'REGULAR', label: '8 (Equal Dice)', value: 8, requiresEqualDice: true, row: 7, col: 6, x: 35.5, y: 66.5, connectedCellIds: ['white-6-bm', 'white-7-bm-low'] },
    'white-7-bm-low': { id: 'white-7-bm-low', type: 'REGULAR', label: '7', value: 7, row: 7, col: 7, x: 42.0, y: 68.0, connectedCellIds: ['white-8-bm', 'white-5-boss-left', 'monster-primal-hare'] },

    // Monster 4: White Wolf (Unified Node)
    'monster-white-wolf': {
      id: 'monster-white-wolf',
      type: 'MONSTER',
      label: 'White Wolf',
      monsterId: 'white-wolf',
      row: 10,
      col: 5,
      x: 29.5,
      y: 82.5,
      connectedCellIds: ['white-5-bl-low'],
      monsterLifeBoxes: [
        { cellId: 'm-wolf-4', value: 4 },
        { cellId: 'm-wolf-5', value: 5 },
        { cellId: 'm-wolf-8', value: 8 },
      ],
    },

    // === ZONE 5: BOTTOM-CENTER & PRIMAL HARE AREA ===
    'activate-8-bm': { id: 'activate-8-bm', type: 'GRAY_ACTIVATION', label: '8 (Star)', value: 8, row: 7, col: 8, x: 58.0, y: 62.5, connectedCellIds: ['white-9-bm', 'monster-boss-bearpion'] },
    'white-6-bm-right': { id: 'white-6-bm-right', type: 'REGULAR', label: '6', value: 6, row: 8, col: 8, x: 56.5, y: 73.0, connectedCellIds: ['monster-primal-hare', 'white-10-bm-right'] },
    'white-10-bm-right': { id: 'white-10-bm-right', type: 'REGULAR', label: '10', value: 10, row: 8, col: 9, x: 63.0, y: 69.0, connectedCellIds: ['white-6-bm-right', 'white-9-bm', 'white-8-br-low'] },
    'white-9-bm': { id: 'white-9-bm', type: 'REGULAR', label: '9', value: 9, row: 7, col: 9, x: 64.0, y: 62.5, connectedCellIds: ['white-10-bm-right', 'activate-8-bm', 'white-7-br-mid'] },
    'white-7-br-mid': { id: 'white-7-br-mid', type: 'REGULAR', label: '7', value: 7, row: 7, col: 10, x: 67.0, y: 57.0, connectedCellIds: ['white-9-bm', 'white-4-mr', 'white-9-br-mid'] },
    'white-9-br-mid': { id: 'white-9-br-mid', type: 'REGULAR', label: '9', value: 9, row: 7, col: 11, x: 74.0, y: 59.5, connectedCellIds: ['white-7-br-mid', 'activate-2-br'] },

    // Monster 5: Primal Hare (Unified Node)
    'monster-primal-hare': {
      id: 'monster-primal-hare',
      type: 'MONSTER',
      label: 'Primal Hare',
      monsterId: 'primal-hare',
      row: 9,
      col: 7,
      x: 49.0,
      y: 77.5,
      connectedCellIds: ['white-7-bm-low', 'white-6-bm-right'],
      monsterLifeBoxes: [
        { cellId: 'm-primal-2', value: 2 },
        { cellId: 'm-primal-12', value: 12 },
      ],
    },

    // === ZONE 6: BOTTOM-RIGHT & PUNK HARE AREA ===
    'white-8-br-low': { id: 'white-8-br-low', type: 'REGULAR', label: '8 (Equal Dice)', value: 8, requiresEqualDice: true, row: 8, col: 10, x: 73.0, y: 69.0, connectedCellIds: ['white-10-bm-right', 'monster-punk-hare', 'activate-2-br'] },
    'activate-2-br': { id: 'activate-2-br', type: 'GRAY_ACTIVATION', label: '2 (Star)', value: 2, row: 8, col: 11, x: 81.0, y: 69.0, connectedCellIds: ['white-8-br-low', 'white-9-br-mid', 'monster-punk-hare'] },

    // Monster 6: Punk Hare (Unified Node)
    'monster-punk-hare': {
      id: 'monster-punk-hare',
      type: 'MONSTER',
      label: 'Punk Hare',
      monsterId: 'punk-hare',
      row: 9,
      col: 10,
      x: 76.5,
      y: 78.0,
      connectedCellIds: ['white-8-br-low', 'activate-2-br'],
      monsterLifeBoxes: [
        { cellId: 'm-punk-3', value: 3 },
        { cellId: 'm-punk-11', value: 11 },
      ],
    },

    // === ZONE 7: BOSS BEEFY BEARPION (Unified Node) ===
    'monster-boss-bearpion': {
      id: 'monster-boss-bearpion',
      type: 'MONSTER',
      label: 'Beefy Bearpion',
      monsterId: 'boss-bearpion',
      row: 5,
      col: 7,
      x: 58.0,
      y: 50.0,
      connectedCellIds: ['white-3-center', 'activate-8-bm'],
      monsterLifeBoxes: [
        { cellId: 'm-boss-3', value: 3 },
        { cellId: 'm-boss-4', value: 4 },
        { cellId: 'm-boss-5', value: 5 },
        { cellId: 'm-boss-8', value: 8 },
        { cellId: 'm-boss-11a', value: 11 },
        { cellId: 'm-boss-11b', value: 11, requiresActivationCellId: 'activate-8-bm' },
      ],
    },
  },
  monsters: {
    'purple-pup': {
      id: 'purple-pup',
      name: 'Purple Pup',
      isBoss: false,
      rewardGems: 2,
      lifePenaltyOnDefeat: 0,
      lifeBoxes: [
        { cellId: 'm-purple-3', value: 3 },
        { cellId: 'm-purple-4', value: 4 },
        { cellId: 'm-purple-11', value: 11 },
      ],
    },
    'green-growler': {
      id: 'green-growler',
      name: 'Green Growler',
      isBoss: false,
      rewardGems: 2,
      lifePenaltyOnDefeat: 0,
      lifeBoxes: [
        { cellId: 'm-growler-3', value: 3 },
        { cellId: 'm-growler-5', value: 5 },
        { cellId: 'm-growler-9', value: 9 },
      ],
    },
    'grey-hound': {
      id: 'grey-hound',
      name: 'Grey Hound',
      isBoss: false,
      rewardGems: 2,
      lifePenaltyOnDefeat: 0,
      lifeBoxes: [
        { cellId: 'm-grey-6', value: 6 },
        { cellId: 'm-grey-8', value: 8 },
        { cellId: 'm-grey-10', value: 10 },
      ],
    },
    'white-wolf': {
      id: 'white-wolf',
      name: 'White Wolf',
      isBoss: false,
      rewardGems: 2,
      lifePenaltyOnDefeat: 0,
      lifeBoxes: [
        { cellId: 'm-wolf-4', value: 4 },
        { cellId: 'm-wolf-5', value: 5 },
        { cellId: 'm-wolf-8', value: 8 },
      ],
    },
    'primal-hare': {
      id: 'primal-hare',
      name: 'Primal Hare',
      isBoss: false,
      rewardGems: 3,
      lifePenaltyOnDefeat: 0,
      lifeBoxes: [
        { cellId: 'm-primal-2', value: 2 },
        { cellId: 'm-primal-12', value: 12 },
      ],
    },
    'punk-hare': {
      id: 'punk-hare',
      name: 'Punk Hare',
      isBoss: false,
      rewardGems: 3,
      lifePenaltyOnDefeat: 0,
      lifeBoxes: [
        { cellId: 'm-punk-3', value: 3 },
        { cellId: 'm-punk-11', value: 11 },
      ],
    },
    'boss-bearpion': {
      id: 'boss-bearpion',
      name: 'Beefy Bearpion',
      isBoss: true,
      rewardGems: 5,
      lifePenaltyOnDefeat: 2,
      lifeBoxes: [
        { cellId: 'm-boss-3', value: 3 },
        { cellId: 'm-boss-4', value: 4 },
        { cellId: 'm-boss-5', value: 5 },
        { cellId: 'm-boss-8', value: 8 },
        { cellId: 'm-boss-11a', value: 11 },
        { cellId: 'm-boss-11b', value: 11, requiresActivationCellId: 'activate-8-bm' },
      ],
    },
  },
};
