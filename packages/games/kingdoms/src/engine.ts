import { GameEngine } from '@boardgametime/game-core';
import { OFFICIAL_KINGDOMS_TILES, shuffleDeck } from './tiles';
import { BOARD_COLS, BOARD_ROWS, scoreBoard } from './scoring';
import {
  BoardCell,
  GameScoringSummary,
  KingdomsAction,
  KingdomsGameState,
  KingdomsPlayerState,
  Tile,
} from './types';

export const KINGDOMS_GAME_ID = 'kingdoms';

const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

export class KingdomsGameEngine
  implements GameEngine<KingdomsGameState, KingdomsAction>
{
  readonly gameId = KINGDOMS_GAME_ID;
  readonly minPlayers = 2;
  readonly maxPlayers = 4;

  createInitialState(playerIds: string[], seedRandom?: () => number): KingdomsGameState {
    if (playerIds.length < this.minPlayers || playerIds.length > this.maxPlayers) {
      throw new Error(`Kingdoms requires between ${this.minPlayers} and ${this.maxPlayers} players.`);
    }

    const rank1Count = playerIds.length === 2 ? 4 : playerIds.length === 3 ? 3 : 2;
    const shuffledDeck = shuffleDeck(OFFICIAL_KINGDOMS_TILES, seedRandom);

    const players: Record<string, KingdomsPlayerState> = {};
    const deck = [...shuffledDeck];

    playerIds.forEach((pid, idx) => {
      const secretTile = deck.pop() || null;
      players[pid] = {
        id: pid,
        color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
        gold: 50,
        availableCastles: [
          { rank: 1, count: rank1Count },
          { rank: 2, count: 1 },
          { rank: 3, count: 1 },
          { rank: 4, count: 1 },
        ],
        secretTile,
      };
    });

    const board: BoardCell[][] = Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => ({ type: 'EMPTY' }))
    );

    return {
      epoch: 1,
      board,
      players,
      drawPile: deck,
      turnOrder: [...playerIds],
      activePlayerId: playerIds[0],
      isComplete: false,
    };
  }

  validateAction(
    state: KingdomsGameState,
    action: KingdomsAction
  ): { valid: boolean; reason?: string } {
    if (state.isComplete) {
      return { valid: false, reason: 'Game is already complete.' };
    }

    if (action.playerId !== state.activePlayerId) {
      return { valid: false, reason: `It is player ${state.activePlayerId}'s turn, not ${action.playerId}'s.` };
    }

    const player = state.players[action.playerId];
    if (!player) {
      return { valid: false, reason: 'Player not found in state.' };
    }

    if (action.type === 'PASS') {
      const canPlaceCastle = player.availableCastles.some((c) => c.count > 0) && this.hasEmptyCell(state.board);
      const canDrawTile = state.drawPile.length > 0 && this.hasEmptyCell(state.board);
      const canPlaceSecret = player.secretTile !== null && this.hasEmptyCell(state.board);

      if (canPlaceCastle || canDrawTile || canPlaceSecret) {
        return { valid: false, reason: 'Passing is allowed ONLY if no legal action can be taken.' };
      }
      return { valid: true };
    }

    // Validate cell bounds for placement actions
    if (!this.isValidCell(action.row, action.col)) {
      return { valid: false, reason: `Invalid cell coordinates (${action.row}, ${action.col}).` };
    }

    if (state.board[action.row][action.col].type !== 'EMPTY') {
      return { valid: false, reason: `Cell (${action.row}, ${action.col}) is not empty.` };
    }

    if (action.type === 'PLACE_CASTLE') {
      const castleSlot = player.availableCastles.find((c) => c.rank === action.rank);
      if (!castleSlot || castleSlot.count <= 0) {
        return { valid: false, reason: `Player has no available Rank ${action.rank} castles.` };
      }
      return { valid: true };
    }

    if (action.type === 'DRAW_AND_PLACE_TILE') {
      if (state.drawPile.length === 0) {
        return { valid: false, reason: 'Draw pile is empty.' };
      }
      return { valid: true };
    }

    if (action.type === 'PLACE_SECRET_TILE') {
      if (!player.secretTile) {
        return { valid: false, reason: 'Player has no secret tile in hand.' };
      }
      return { valid: true };
    }

    return { valid: false, reason: 'Unknown action type.' };
  }

  applyAction(
    state: KingdomsGameState,
    action: KingdomsAction,
    seedRandom?: () => number
  ): { newState: KingdomsGameState; events: unknown[] } {
    const validation = this.validateAction(state, action);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid action');
    }

    // Deep clone state for immutability
    const newState: KingdomsGameState = JSON.parse(JSON.stringify(state));
    const events: unknown[] = [];
    const player = newState.players[action.playerId];

    if (action.type === 'PLACE_CASTLE') {
      newState.board[action.row][action.col] = {
        type: 'CASTLE',
        playerId: action.playerId,
        rank: action.rank,
      };
      const castleSlot = player.availableCastles.find((c) => c.rank === action.rank);
      if (castleSlot) {
        castleSlot.count -= 1;
      }
      events.push({
        type: 'CASTLE_PLACED',
        playerId: action.playerId,
        rank: action.rank,
        row: action.row,
        col: action.col,
      });
    } else if (action.type === 'DRAW_AND_PLACE_TILE') {
      const drawnTile = newState.drawPile.pop()!;
      newState.board[action.row][action.col] = {
        type: 'TILE',
        tile: drawnTile,
      };
      events.push({
        type: 'TILE_DRAWN_AND_PLACED',
        playerId: action.playerId,
        tile: drawnTile,
        row: action.row,
        col: action.col,
      });
    } else if (action.type === 'PLACE_SECRET_TILE') {
      const secret = player.secretTile!;
      newState.board[action.row][action.col] = {
        type: 'TILE',
        tile: secret,
      };
      player.secretTile = null;
      events.push({
        type: 'SECRET_TILE_PLACED',
        playerId: action.playerId,
        tile: secret,
        row: action.row,
        col: action.col,
      });
    } else if (action.type === 'PASS') {
      events.push({ type: 'PLAYER_PASSED', playerId: action.playerId });
    }

    // Check if board is full or no moves remain
    const isBoardFull = !this.hasEmptyCell(newState.board);

    if (isBoardFull) {
      this.handleEpochEnd(newState, events, seedRandom);
    } else {
      // Advance to next active player
      const currentIndex = newState.turnOrder.indexOf(newState.activePlayerId);
      const nextIndex = (currentIndex + 1) % newState.turnOrder.length;
      newState.activePlayerId = newState.turnOrder[nextIndex];
    }

    return { newState, events };
  }

  sanitizeStateForPlayer(
    state: KingdomsGameState,
    playerId: string
  ): KingdomsGameState {
    const sanitized: KingdomsGameState = JSON.parse(JSON.stringify(state));

    // Hide draw pile tiles (keep length)
    sanitized.drawPile = sanitized.drawPile.map((_, i) => ({
      id: `hidden_${i}`,
      type: 'RESOURCE',
      value: 0,
      name: 'Face-Down Tile',
    }));

    // Hide opponents' secret tiles
    Object.keys(sanitized.players).forEach((pid) => {
      if (pid !== playerId && sanitized.players[pid].secretTile) {
        sanitized.players[pid].secretTile = {
          id: 'hidden_secret',
          type: 'RESOURCE',
          value: 0,
          name: 'Secret Tile (Face-Down)',
        };
      }
    });

    return sanitized;
  }

  private handleEpochEnd(
    state: KingdomsGameState,
    events: unknown[],
    seedRandom?: () => number
  ): void {
    const playerIds = Object.keys(state.players);
    const currentGold: Record<string, number> = {};
    playerIds.forEach((pid) => (currentGold[pid] = state.players[pid].gold));

    // 1. Calculate scoring
    const scoringSummary: GameScoringSummary = scoreBoard(
      state.board,
      state.epoch,
      playerIds,
      currentGold
    );

    state.lastScoringResult = scoringSummary;

    // 2. Update player gold totals
    playerIds.forEach((pid) => {
      state.players[pid].gold = scoringSummary.totalGoldAfterEpoch[pid];
    });

    events.push({ type: 'EPOCH_SCORED', epoch: state.epoch, summary: scoringSummary });

    if (state.epoch >= 3) {
      // End of Game!
      state.isComplete = true;
      let highestGold = -Infinity;
      let winnerId = playerIds[0];

      playerIds.forEach((pid) => {
        if (state.players[pid].gold > highestGold) {
          highestGold = state.players[pid].gold;
          winnerId = pid;
        }
      });

      state.winnerPlayerId = winnerId;
      events.push({ type: 'GAME_COMPLETED', winnerPlayerId: winnerId, finalGold: state.players[winnerId].gold });
    } else {
      // Advance to next Epoch (Epoch 2 or 3)
      state.epoch = (state.epoch + 1) as 2 | 3;

      // Reset board
      state.board = Array.from({ length: BOARD_ROWS }, () =>
        Array.from({ length: BOARD_COLS }, () => ({ type: 'EMPTY' }))
      );

      // Rank 1 castles return to hand. Rank 2, 3, 4 played castles are lost.
      // Reset player available castles: Rank 1 count is restored, Rank 2-4 count remains 0 if played.
      const rank1Count = playerIds.length === 2 ? 4 : playerIds.length === 3 ? 3 : 2;

      playerIds.forEach((pid) => {
        const player = state.players[pid];
        const rank1Slot = player.availableCastles.find((c) => c.rank === 1);
        if (rank1Slot) {
          rank1Slot.count = rank1Count;
        }
      });

      // Highest gold player goes first in Epoch 2 & 3
      const sortedPlayersByGold = [...playerIds].sort(
        (a, b) => state.players[b].gold - state.players[a].gold
      );
      state.turnOrder = sortedPlayersByGold;
      state.activePlayerId = sortedPlayersByGold[0];

      // Reshuffle all 22 tiles & deal new secret tile to each player
      const freshDeck = shuffleDeck(OFFICIAL_KINGDOMS_TILES, seedRandom);
      playerIds.forEach((pid) => {
        state.players[pid].secretTile = freshDeck.pop() || null;
      });
      state.drawPile = freshDeck;

      events.push({ type: 'EPOCH_STARTED', epoch: state.epoch, startingPlayerId: state.activePlayerId });
    }
  }

  private hasEmptyCell(board: BoardCell[][]): boolean {
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        if (board[r][c].type === 'EMPTY') return true;
      }
    }
    return false;
  }

  private isValidCell(row: number, col: number): boolean {
    return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
  }
}
