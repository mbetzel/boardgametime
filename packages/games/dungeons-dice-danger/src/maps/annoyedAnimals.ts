import { DungeonMapDefinition } from '../types';

export const ANNOYED_ANIMALS_MAP: DungeonMapDefinition = {
  id: 'annoyed-animals',
  name: 'Annoyed Animals',
  difficulty: 'Novice',
  startCellIds: [
    'start-2-tl', 'start-9-tl', 'start-6-tl', 'start-7-tl', 'start-12-fl', 'start-3-fl', 'start-5-fl', 'start-6-fl', 'start-4-fl',
    'start-3-tr', 'start-4-tr', 'start-5-tr', 'start-8-tr', 'start-10-tr', 'start-11-tr',
    'start-6-bl', 'start-2-bl', 'start-5-bl', 'start-4-bl', 'start-5-b2', 'start-8-bl',
    'start-4-br', 'start-10-br', 'start-7-br', 'start-9-br', 'start-8-br', 'start-2-br'
  ],
  cells: {
    // === TOP-LEFT GREEN START PERIMETER ===
    'start-2-tl': { id: 'start-2-tl', type: 'START', label: '2', value: 2, row: 0, col: 2, x: 13.0, y: 9.0, connectedCellIds: ['start-9-tl', 'reg-4-topleft'] },
    'start-9-tl': { id: 'start-9-tl', type: 'START', label: '9', value: 9, row: 1, col: 2, x: 13.0, y: 15.5, connectedCellIds: ['start-2-tl', 'start-6-tl', 'reg-4-topleft'] },
    'start-6-tl': { id: 'start-6-tl', type: 'START', label: '6', value: 6, row: 2, col: 2, x: 13.0, y: 22.0, connectedCellIds: ['start-9-tl', 'start-7-tl', 'reg-10-topleft'] },
    'start-7-tl': { id: 'start-7-tl', type: 'START', label: '7', value: 7, row: 2, col: 1, x: 8.0, y: 22.0, connectedCellIds: ['start-6-tl', 'start-12-fl'] },
    'start-12-fl': { id: 'start-12-fl', type: 'START', label: '12', value: 12, row: 3, col: 0, x: 3.5, y: 28.5, connectedCellIds: ['start-7-tl', 'start-3-fl', 'start-5-fl'] },
    'start-3-fl': { id: 'start-3-fl', type: 'START', label: '3', value: 3, row: 3, col: 1, x: 8.0, y: 28.5, connectedCellIds: ['start-12-fl', 'start-6-fl', 'gray-4-topleft'] },
    'start-5-fl': { id: 'start-5-fl', type: 'START', label: '5', value: 5, row: 4, col: 0, x: 3.5, y: 35.0, connectedCellIds: ['start-12-fl', 'start-4-fl', 'start-6-fl'] },
    'start-6-fl': { id: 'start-6-fl', type: 'START', label: '6', value: 6, row: 4, col: 1, x: 8.0, y: 35.0, connectedCellIds: ['start-5-fl', 'start-3-fl', 'm-grey-6'] },
    'start-4-fl': { id: 'start-4-fl', type: 'START', label: '4', value: 4, row: 5, col: 0, x: 3.5, y: 41.5, connectedCellIds: ['start-5-fl', 'gray-4-topleft'] },

    // === TOP-RIGHT GREEN START PERIMETER ===
    'start-3-tr': { id: 'start-3-tr', type: 'START', label: '3', value: 3, row: 0, col: 10, x: 64.5, y: 9.0, connectedCellIds: ['start-4-tr', 'reg-2-topright'] },
    'start-4-tr': { id: 'start-4-tr', type: 'START', label: '4', value: 4, row: 0, col: 11, x: 69.5, y: 9.0, connectedCellIds: ['start-3-tr', 'start-5-tr'] },
    'start-5-tr': { id: 'start-5-tr', type: 'START', label: '5', value: 5, row: 1, col: 11, x: 69.5, y: 15.5, connectedCellIds: ['start-4-tr', 'start-8-tr'] },
    'start-8-tr': { id: 'start-8-tr', type: 'START', label: '8', value: 8, row: 2, col: 11, x: 69.5, y: 22.0, connectedCellIds: ['start-5-tr', 'start-10-tr', 'reg-7-topright'] },
    'start-10-tr': { id: 'start-10-tr', type: 'START', label: '10', value: 10, row: 3, col: 11, x: 69.5, y: 28.5, connectedCellIds: ['start-8-tr', 'start-11-tr', 'reg-10-midright'] },
    'start-11-tr': { id: 'start-11-tr', type: 'START', label: '11', value: 11, row: 4, col: 11, x: 69.5, y: 35.0, connectedCellIds: ['start-10-tr', 'reg-11-midright'] },

    // === BOTTOM-LEFT GREEN START PERIMETER ===
    'start-6-bl': { id: 'start-6-bl', type: 'START', label: '6', value: 6, row: 7, col: 1, x: 8.0, y: 56.5, connectedCellIds: ['start-2-bl', 'reg-12-leftmid'] },
    'start-2-bl': { id: 'start-2-bl', type: 'START', label: '2', value: 2, row: 7, col: 2, x: 13.0, y: 56.5, connectedCellIds: ['start-6-bl', 'start-5-bl', 'reg-6-leftmid'] },
    'start-5-bl': { id: 'start-5-bl', type: 'START', label: '5', value: 5, row: 8, col: 2, x: 13.0, y: 63.0, connectedCellIds: ['start-2-bl', 'start-4-bl', 'reg-2-leftbot'] },
    'start-4-bl': { id: 'start-4-bl', type: 'START', label: '4', value: 4, row: 8, col: 3, x: 17.5, y: 63.0, connectedCellIds: ['start-5-bl', 'start-5-b2', 'm-wolf-4'] },
    'start-5-b2': { id: 'start-5-b2', type: 'START', label: '5', value: 5, row: 9, col: 3, x: 17.5, y: 69.5, connectedCellIds: ['start-4-bl', 'start-8-bl'] },
    'start-8-bl': { id: 'start-8-bl', type: 'START', label: '8', value: 8, row: 9, col: 4, x: 22.0, y: 69.5, connectedCellIds: ['start-5-b2', 'm-wolf-5'] },

    // === BOTTOM-RIGHT GREEN START PERIMETER ===
    'start-4-br': { id: 'start-4-br', type: 'START', label: '4', value: 4, row: 9, col: 8, x: 55.5, y: 69.5, connectedCellIds: ['start-10-br', 'reg-9-botright'] },
    'start-10-br': { id: 'start-10-br', type: 'START', label: '10', value: 10, row: 9, col: 9, x: 60.0, y: 69.5, connectedCellIds: ['start-4-br', 'start-7-br', 'm-punk-3'] },
    'start-7-br': { id: 'start-7-br', type: 'START', label: '7', value: 7, row: 10, col: 8, x: 55.5, y: 76.0, connectedCellIds: ['start-10-br', 'start-9-br'] },
    'start-9-br': { id: 'start-9-br', type: 'START', label: '9', value: 9, row: 10, col: 9, x: 60.0, y: 76.0, connectedCellIds: ['start-7-br', 'start-8-br', 'reg-8-botright'] },
    'start-8-br': { id: 'start-8-br', type: 'START', label: '8', value: 8, row: 10, col: 10, x: 64.5, y: 76.0, connectedCellIds: ['start-9-br', 'start-2-br'] },
    'start-2-br': { id: 'start-2-br', type: 'START', label: '2', value: 2, row: 10, col: 11, x: 69.5, y: 76.0, connectedCellIds: ['start-8-br', 'm-punk-11'] },

    // === CHESTS ===
    'chest-black-dice': { id: 'chest-black-dice', type: 'CHEST', label: 'Chest (+3 Black Dice)', row: 6, col: 0, x: 3.5, y: 48.0, connectedCellIds: ['reg-12-leftmid'], chestReward: 'BLACK_DICE' },
    'chest-11-gold': { id: 'chest-11-gold', type: 'CHEST', label: 'Chest 11 (+1 Torch)', row: 3, col: 4, x: 26.5, y: 28.5, connectedCellIds: ['reg-7-topcen', 'reg-12-midcen'], chestReward: 'TORCH' },
    'chest-12-gold': { id: 'chest-12-gold', type: 'CHEST', label: 'Chest 12 (+3 Health & Gem)', row: 3, col: 9, x: 58.0, y: 28.5, connectedCellIds: ['reg-10-midright'], chestReward: 'EXTRA_HEALTH' },
    'chest-3-gold': { id: 'chest-3-gold', type: 'CHEST', label: 'Chest 3 (+3 Health & Gem)', row: 6, col: 9, x: 58.0, y: 48.0, connectedCellIds: ['reg-4-botright', 'reg-7-botright'], chestReward: 'EXTRA_HEALTH' },

    // === REGULAR PASSAGE ROOMS ===
    'reg-4-topleft': { id: 'reg-4-topleft', type: 'REGULAR', label: '4', value: 4, row: 0, col: 3, x: 17.5, y: 9.0, connectedCellIds: ['start-2-tl', 'm-purple-3'] },
    'reg-10-topleft': { id: 'reg-10-topleft', type: 'REGULAR', label: '10', value: 10, row: 2, col: 3, x: 17.5, y: 22.0, connectedCellIds: ['start-6-tl', 'reg-7-topcen', 'm-grey-6'] },
    'gray-4-topleft': { id: 'gray-4-topleft', type: 'GRAY_ACTIVATION', label: '4 (Gray)', value: 4, row: 5, col: 1, x: 8.0, y: 41.5, connectedCellIds: ['start-3-fl', 'start-4-fl', 'reg-12-leftmid'] },
    'reg-12-leftmid': { id: 'reg-12-leftmid', type: 'REGULAR', label: '12', value: 12, row: 6, col: 1, x: 8.0, y: 48.0, connectedCellIds: ['chest-black-dice', 'gray-4-topleft', 'reg-2-leftmid', 'start-6-bl'] },
    'reg-2-leftmid': { id: 'reg-2-leftmid', type: 'REGULAR', label: '2', value: 2, row: 6, col: 2, x: 13.0, y: 48.0, connectedCellIds: ['reg-12-leftmid', 'reg-5-leftmid'] },
    'reg-5-leftmid': { id: 'reg-5-leftmid', type: 'REGULAR', label: '5', value: 5, row: 6, col: 3, x: 17.5, y: 48.0, connectedCellIds: ['reg-2-leftmid', 'reg-7-leftmid', 'reg-6-leftmid'] },
    'reg-7-leftmid': { id: 'reg-7-leftmid', type: 'REGULAR', label: '7', value: 7, row: 6, col: 4, x: 22.0, y: 48.0, connectedCellIds: ['reg-5-leftmid', 'reg-2-leftbot'] },
    'reg-6-leftmid': { id: 'reg-6-leftmid', type: 'REGULAR', label: '6', value: 6, row: 7, col: 3, x: 17.5, y: 56.5, connectedCellIds: ['reg-5-leftmid', 'start-2-bl'] },
    'reg-2-leftbot': { id: 'reg-2-leftbot', type: 'REGULAR', label: '2', value: 2, row: 7, col: 4, x: 22.0, y: 56.5, connectedCellIds: ['reg-7-leftmid', 'start-5-bl'] },

    'reg-7-topcen': { id: 'reg-7-topcen', type: 'REGULAR', label: '7', value: 7, row: 2, col: 4, x: 22.0, y: 22.0, connectedCellIds: ['reg-10-topleft', 'reg-3-topcen', 'chest-11-gold'] },
    'reg-3-topcen': { id: 'reg-3-topcen', type: 'REGULAR', label: '3', value: 3, row: 2, col: 5, x: 26.5, y: 22.0, connectedCellIds: ['reg-7-topcen', 'reg-10-topcen'] },
    'reg-10-topcen': { id: 'reg-10-topcen', type: 'REGULAR', label: '10', value: 10, row: 2, col: 6, x: 31.0, y: 22.0, connectedCellIds: ['reg-3-topcen', 'reg-12-midcen', 'm-boss-3'] },
    'reg-12-midcen': { id: 'reg-12-midcen', type: 'REGULAR', label: '12', value: 12, row: 3, col: 5, x: 31.0, y: 28.5, connectedCellIds: ['chest-11-gold', 'reg-10-topcen', 'reg-3-midcen'] },
    'reg-3-midcen': { id: 'reg-3-midcen', type: 'REGULAR', label: '3', value: 3, row: 3, col: 6, x: 35.5, y: 28.5, connectedCellIds: ['reg-12-midcen', 'reg-9-midcen'] },
    'reg-9-midcen': { id: 'reg-9-midcen', type: 'REGULAR', label: '9', value: 9, row: 2, col: 7, x: 35.5, y: 22.0, connectedCellIds: ['reg-3-midcen', 'reg-6-midcen'] },
    'reg-6-midcen': { id: 'reg-6-midcen', type: 'REGULAR', label: '6', value: 6, row: 2, col: 8, x: 40.0, y: 22.0, connectedCellIds: ['reg-9-midcen', 'reg-11-midcen'] },
    'reg-11-midcen': { id: 'reg-11-midcen', type: 'REGULAR', label: '11', value: 11, row: 2, col: 9, x: 44.5, y: 22.0, connectedCellIds: ['reg-6-midcen', 'reg-8-topright'] },

    'reg-12-topright': { id: 'reg-12-topright', type: 'REGULAR', label: '12', value: 12, row: 0, col: 7, x: 35.5, y: 9.0, connectedCellIds: ['reg-12-star'] },
    'reg-12-star': { id: 'reg-12-star', type: 'REGULAR', label: '12 (Star)', value: 12, row: 0, col: 8, x: 40.0, y: 9.0, connectedCellIds: ['reg-12-topright', 'reg-2-topright'] },
    'reg-2-topright': { id: 'reg-2-topright', type: 'REGULAR', label: '2', value: 2, row: 1, col: 9, x: 44.5, y: 15.5, connectedCellIds: ['reg-12-star', 'start-3-tr', 'reg-8-topright'] },
    'reg-8-topright': { id: 'reg-8-topright', type: 'REGULAR', label: '8', value: 8, row: 2, col: 9, x: 44.5, y: 22.0, connectedCellIds: ['reg-2-topright', 'reg-7-topright', 'reg-11-midcen'] },
    'reg-7-topright': { id: 'reg-7-topright', type: 'REGULAR', label: '7', value: 7, row: 2, col: 10, x: 49.0, y: 22.0, connectedCellIds: ['reg-8-topright', 'reg-2-topright2', 'm-growler-3'] },
    'reg-2-topright2': { id: 'reg-2-topright2', type: 'REGULAR', label: '2', value: 2, row: 2, col: 10.5, x: 53.5, y: 22.0, connectedCellIds: ['reg-7-topright', 'start-8-tr'] },
    'reg-10-midright': { id: 'reg-10-midright', type: 'REGULAR', label: '10', value: 10, row: 3, col: 10.5, x: 53.5, y: 28.5, connectedCellIds: ['chest-12-gold', 'start-10-tr'] },
    'reg-11-midright': { id: 'reg-11-midright', type: 'REGULAR', label: '11', value: 11, row: 4, col: 10.5, x: 53.5, y: 35.0, connectedCellIds: ['start-11-tr', 'reg-4-botright'] },

    'reg-5-midleft2': { id: 'reg-5-midleft2', type: 'REGULAR', label: '5', value: 5, row: 4, col: 5, x: 31.0, y: 35.0, connectedCellIds: ['reg-10-midleft2'] },
    'reg-10-midleft2': { id: 'reg-10-midleft2', type: 'REGULAR', label: '10', value: 10, row: 5, col: 5, x: 31.0, y: 41.5, connectedCellIds: ['reg-5-midleft2', 'reg-5-midleft3'] },
    'reg-5-midleft3': { id: 'reg-5-midleft3', type: 'REGULAR', label: '5', value: 5, row: 6, col: 5, x: 31.0, y: 48.0, connectedCellIds: ['reg-10-midleft2', 'reg-7-botcen'] },
    'reg-7-botcen': { id: 'reg-7-botcen', type: 'REGULAR', label: '7', value: 7, row: 6, col: 6, x: 35.5, y: 48.0, connectedCellIds: ['reg-5-midleft3', 'gray-8-botcen'] },
    'gray-8-botcen': { id: 'gray-8-botcen', type: 'GRAY_ACTIVATION', label: '8 (Gray)', value: 8, row: 6, col: 7, x: 40.0, y: 48.0, connectedCellIds: ['reg-7-botcen', 'reg-6-botcen'] },
    'reg-6-botcen': { id: 'reg-6-botcen', type: 'REGULAR', label: '6', value: 6, row: 7, col: 7, x: 40.0, y: 54.5, connectedCellIds: ['gray-8-botcen', 'reg-10-botcen'] },
    'reg-10-botcen': { id: 'reg-10-botcen', type: 'REGULAR', label: '10', value: 10, row: 7, col: 8, x: 44.5, y: 54.5, connectedCellIds: ['reg-6-botcen', 'reg-9-botcen'] },
    'reg-9-botcen': { id: 'reg-9-botcen', type: 'REGULAR', label: '9', value: 9, row: 8, col: 8, x: 44.5, y: 61.0, connectedCellIds: ['reg-10-botcen'] },

    'reg-4-botright': { id: 'reg-4-botright', type: 'REGULAR', label: '4', value: 4, row: 6, col: 10.5, x: 53.5, y: 48.0, connectedCellIds: ['chest-3-gold', 'reg-7-botright'] },
    'reg-7-botright': { id: 'reg-7-botright', type: 'REGULAR', label: '7', value: 7, row: 7, col: 10.5, x: 53.5, y: 54.5, connectedCellIds: ['reg-4-botright', 'reg-9-botright'] },
    'reg-9-botright': { id: 'reg-9-botright', type: 'REGULAR', label: '9', value: 9, row: 8, col: 10.5, x: 53.5, y: 61.0, connectedCellIds: ['reg-7-botright', 'reg-8-botright', 'start-4-br'] },
    'reg-8-botright': { id: 'reg-8-botright', type: 'REGULAR', label: '8', value: 8, row: 8, col: 11, x: 58.0, y: 61.0, connectedCellIds: ['reg-9-botright', 'start-9-br'] },

    // === MONSTER LIFE BOXES ===
    // Purple Pup
    'm-purple-3': { id: 'm-purple-3', type: 'MONSTER', label: 'Purple Pup: 3', value: 3, row: 0, col: 5, x: 27.0, y: 9.0, monsterId: 'purple-pup', connectedCellIds: ['reg-4-topleft', 'm-purple-4'] },
    'm-purple-4': { id: 'm-purple-4', type: 'MONSTER', label: 'Purple Pup: 4', value: 4, row: 1, col: 5, x: 27.0, y: 13.0, monsterId: 'purple-pup', connectedCellIds: ['m-purple-3', 'm-purple-11'] },
    'm-purple-11': { id: 'm-purple-11', type: 'MONSTER', label: 'Purple Pup: 11', value: 11, row: 2, col: 5, x: 27.0, y: 17.0, monsterId: 'purple-pup', connectedCellIds: ['m-purple-4'] },

    // Green Growler
    'm-growler-3': { id: 'm-growler-3', type: 'MONSTER', label: 'Green Growler: 3', value: 3, row: 1, col: 10, x: 57.0, y: 15.5, monsterId: 'green-growler', connectedCellIds: ['reg-7-topright', 'm-growler-5'] },
    'm-growler-5': { id: 'm-growler-5', type: 'MONSTER', label: 'Green Growler: 5', value: 5, row: 2, col: 10, x: 57.0, y: 19.5, monsterId: 'green-growler', connectedCellIds: ['m-growler-3', 'm-growler-9'] },
    'm-growler-9': { id: 'm-growler-9', type: 'MONSTER', label: 'Green Growler: 9', value: 9, row: 3, col: 10, x: 57.0, y: 23.5, monsterId: 'green-growler', connectedCellIds: ['m-growler-5', 'reg-9-tr'] },

    // Grey Hound
    'm-grey-6': { id: 'm-grey-6', type: 'MONSTER', label: 'Grey Hound: 6', value: 6, row: 4, col: 3, x: 19.0, y: 32.5, monsterId: 'grey-hound', connectedCellIds: ['start-6-fl', 'reg-10-topleft', 'm-grey-8'] },
    'm-grey-8': { id: 'm-grey-8', type: 'MONSTER', label: 'Grey Hound: 8', value: 8, row: 5, col: 3, x: 19.0, y: 36.5, monsterId: 'grey-hound', connectedCellIds: ['m-grey-6', 'm-grey-10'] },
    'm-grey-10': { id: 'm-grey-10', type: 'MONSTER', label: 'Grey Hound: 10', value: 10, row: 6, col: 3, x: 19.0, y: 40.5, monsterId: 'grey-hound', connectedCellIds: ['m-grey-8'] },

    // White Wolf
    'm-wolf-4': { id: 'm-wolf-4', type: 'MONSTER', label: 'White Wolf: 4', value: 4, row: 9, col: 5, x: 24.5, y: 69.5, monsterId: 'white-wolf', connectedCellIds: ['start-4-bl', 'm-wolf-5'] },
    'm-wolf-5': { id: 'm-wolf-5', type: 'MONSTER', label: 'White Wolf: 5', value: 5, row: 10, col: 5, x: 24.5, y: 73.5, monsterId: 'white-wolf', connectedCellIds: ['m-wolf-4', 'm-wolf-8'] },
    'm-wolf-8': { id: 'm-wolf-8', type: 'MONSTER', label: 'White Wolf: 8', value: 8, row: 11, col: 5, x: 24.5, y: 77.5, monsterId: 'white-wolf', connectedCellIds: ['m-wolf-5'] },

    // Primal Hare
    'm-primal-2': { id: 'm-primal-2', type: 'MONSTER', label: 'Primal Hare: 2', value: 2, row: 9, col: 7, x: 44.5, y: 69.5, monsterId: 'primal-hare', connectedCellIds: ['m-primal-12'] },
    'm-primal-12': { id: 'm-primal-12', type: 'MONSTER', label: 'Primal Hare: 12', value: 12, row: 10, col: 7, x: 44.5, y: 73.5, monsterId: 'primal-hare', connectedCellIds: ['m-primal-2'] },

    // Punk Hare
    'm-punk-3': { id: 'm-punk-3', type: 'MONSTER', label: 'Punk Hare: 3', value: 3, row: 9, col: 9, x: 60.0, y: 69.5, monsterId: 'punk-hare', connectedCellIds: ['start-10-br', 'm-punk-11'] },
    'm-punk-11': { id: 'm-punk-11', type: 'MONSTER', label: 'Punk Hare: 11', value: 11, row: 10, col: 9, x: 60.0, y: 73.5, monsterId: 'punk-hare', connectedCellIds: ['m-punk-3', 'start-2-br'] },

    // Boss: Beefy Bearpion
    'm-boss-3': { id: 'm-boss-3', type: 'MONSTER', label: 'Boss: 3', value: 3, row: 5, col: 7, x: 50.5, y: 41.5, monsterId: 'boss-bearpion', connectedCellIds: ['reg-10-topcen', 'm-boss-4'] },
    'm-boss-4': { id: 'm-boss-4', type: 'MONSTER', label: 'Boss: 4', value: 4, row: 6, col: 7, x: 50.5, y: 45.5, monsterId: 'boss-bearpion', connectedCellIds: ['m-boss-3', 'm-boss-5'] },
    'm-boss-5': { id: 'm-boss-5', type: 'MONSTER', label: 'Boss: 5', value: 5, row: 7, col: 7, x: 50.5, y: 49.5, monsterId: 'boss-bearpion', connectedCellIds: ['m-boss-4', 'm-boss-8'] },
    'm-boss-8': { id: 'm-boss-8', type: 'MONSTER', label: 'Boss: 8', value: 8, row: 8, col: 7, x: 50.5, y: 53.5, monsterId: 'boss-bearpion', connectedCellIds: ['m-boss-5', 'm-boss-11a'] },
    'm-boss-11a': { id: 'm-boss-11a', type: 'MONSTER', label: 'Boss: 11', value: 11, row: 9, col: 7, x: 50.5, y: 57.5, monsterId: 'boss-bearpion', connectedCellIds: ['m-boss-8', 'm-boss-11b'] },
    'm-boss-11b': { id: 'm-boss-11b', type: 'MONSTER', label: 'Boss: 11 (Req Gray 8)', value: 11, row: 10, col: 7, x: 50.5, y: 61.5, monsterId: 'boss-bearpion', requiresActivationCellId: 'gray-8-botcen', connectedCellIds: ['m-boss-11a', 'gray-8-botcen'] },
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
        { cellId: 'm-boss-11b', value: 11, requiresActivationCellId: 'gray-8-botcen' },
      ],
    },
  },
};
