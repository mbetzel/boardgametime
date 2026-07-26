import { GameEngine } from '@boardgametime/game-core';
import { getMapDefinition } from './maps';
import { scoreGame } from './scoring';
import {
  DiceRoll,
  DungeonMapDefinition,
  DungeonsDiceDangerAction,
  DungeonsDiceDangerGameState,
  MapId,
  PairSubmission,
  PairTarget,
  PlayerSheetState,
} from './types';

export const DUNGEONS_DICE_DANGER_GAME_ID = 'dungeons-dice-danger';

const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

export class DungeonsDiceDangerGameEngine
  implements GameEngine<DungeonsDiceDangerGameState, DungeonsDiceDangerAction>
{
  readonly gameId = DUNGEONS_DICE_DANGER_GAME_ID;
  readonly minPlayers = 1;
  readonly maxPlayers = 4;

  createInitialState(
    playerIds: string[],
    seedRandom?: () => number,
    options?: { mapId?: MapId }
  ): DungeonsDiceDangerGameState {
    if (playerIds.length < this.minPlayers || playerIds.length > this.maxPlayers) {
      throw new Error(`Dungeons, Dice & Danger requires between ${this.minPlayers} and ${this.maxPlayers} players.`);
    }

    const selectedMapId: MapId = options?.mapId || 'annoyed-animals';
    const playerStates: Record<string, PlayerSheetState> = {};

    playerIds.forEach((pid) => {
      playerStates[pid] = {
        id: pid,
        score: 0,
        visitedCellIds: [],
        damagedMonsterBoxes: {},
        defeatedMonsterIds: [],
        blackDieCharges: 3,
        torches: 0,
        health: 10,
        skullsCrossed: 0,
        gems: 0,
        gold: 0,
        extraHealthUnlocked: false,
      };
    });

    return {
      gameId: 'dungeons-dice-danger',
      mapId: selectedMapId,
      round: 1,
      turnOrder: [...playerIds],
      activePlayerId: playerIds[0],
      phase: 'ROLLING',
      currentRoll: null,
      pendingSubmissions: {},
      playerStates,
      isComplete: false,
      winnerPlayerId: null,
    };
  }

  validateAction(
    state: DungeonsDiceDangerGameState,
    action: DungeonsDiceDangerAction
  ): { valid: boolean; reason?: string } {
    if (state.isComplete) {
      return { valid: false, reason: 'Game is already complete.' };
    }

    const player = state.playerStates[action.playerId];
    if (!player) {
      return { valid: false, reason: 'Player not found in state.' };
    }

    const mapDef = getMapDefinition(state.mapId);

    if (action.type === 'ROLL_DICE') {
      if (state.phase !== 'ROLLING') {
        return { valid: false, reason: 'Dice have already been rolled for this round.' };
      }
      if (action.playerId !== state.activePlayerId) {
        return { valid: false, reason: `Only active player (${state.activePlayerId}) can roll the dice.` };
      }
      return { valid: true };
    }

    if (action.type === 'USE_TORCH') {
      if (player.torches <= 0) {
        return { valid: false, reason: 'No torches available.' };
      }
      const cell = mapDef.cells[action.targetCellId];
      if (!cell) {
        return { valid: false, reason: 'Target cell does not exist.' };
      }
      if (player.visitedCellIds.includes(cell.id)) {
        return { valid: false, reason: 'Cell already visited.' };
      }
      const isAdjacent = this.isAdjacentToVisited(cell.id, player.visitedCellIds, mapDef);
      if (!isAdjacent && cell.type !== 'START') {
        return { valid: false, reason: 'Torch target must be adjacent to a visited space or a Start space.' };
      }
      return { valid: true };
    }

    if (action.type === 'SUBMIT_PAIRS') {
      if (state.phase !== 'SUBMITTING_PAIRS') {
        return { valid: false, reason: 'Not in submission phase.' };
      }
      if (!state.currentRoll) {
        return { valid: false, reason: 'No active roll found.' };
      }
      if (state.pendingSubmissions[action.playerId]) {
        return { valid: false, reason: 'Player has already submitted pairs for this round.' };
      }

      const isActivePlayer = action.playerId === state.activePlayerId;
      const sub = action.submission;

      // Validate Black Die usage for passive players
      const usesBlackDie =
        sub.pair1.diceIndices.includes(4) || sub.pair2.diceIndices.includes(4);

      if (usesBlackDie && !isActivePlayer) {
        if (!sub.useBlackDie) {
          return { valid: false, reason: 'Passive players using the black die must specify useBlackDie: true.' };
        }
        if (player.blackDieCharges <= 0) {
          return { valid: false, reason: 'No black die charges remaining.' };
        }
      }

      // Validate Pair Targets
      const val1 = this.validatePairTarget(player, sub.pair1, state.currentRoll, mapDef);
      if (!val1.valid) return val1;

      const val2 = this.validatePairTarget(player, sub.pair2, state.currentRoll, mapDef);
      if (!val2.valid) return val2;

      return { valid: true };
    }

    if (action.type === 'CONFIRM_TURN' || action.type === 'CANCEL_TURN') {
      return { valid: true };
    }

    return { valid: false, reason: 'Unknown action type.' };
  }

  applyAction(
    state: DungeonsDiceDangerGameState,
    action: DungeonsDiceDangerAction,
    seedRandom?: () => number
  ): { newState: DungeonsDiceDangerGameState; events: unknown[] } {
    const validation = this.validateAction(state, action);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid action');
    }

    const newState: DungeonsDiceDangerGameState = JSON.parse(JSON.stringify(state));
    const events: unknown[] = [];
    const getRandom = seedRandom || Math.random;
    const mapDef = getMapDefinition(newState.mapId);

    if (action.type === 'CANCEL_TURN') {
      delete newState.pendingSubmissions[action.playerId];
      return { newState, events };
    }

    if (action.type === 'CONFIRM_TURN') {
      // Check if all players submitted
      const allPlayerIds = Object.keys(newState.playerStates);
      const allSubmitted = allPlayerIds.every((pid) => !!newState.pendingSubmissions[pid]);
      if (allSubmitted) {
        this.resolveRoundSubmissions(newState, events, mapDef);
      }
      return { newState, events };
    }

    if (action.type === 'ROLL_DICE') {
      const roll1 = Math.floor(getRandom() * 6) + 1;
      const roll2 = Math.floor(getRandom() * 6) + 1;
      const roll3 = Math.floor(getRandom() * 6) + 1;
      const roll4 = Math.floor(getRandom() * 6) + 1;
      const black = Math.floor(getRandom() * 6) + 1;

      newState.currentRoll = {
        whiteDice: [roll1, roll2, roll3, roll4],
        blackDie: black,
      };
      newState.phase = 'SUBMITTING_PAIRS';

      events.push({
        type: 'DICE_ROLLED',
        activePlayerId: action.playerId,
        roll: newState.currentRoll,
      });
    } else if (action.type === 'USE_TORCH') {
      const player = newState.playerStates[action.playerId];
      player.torches -= 1;
      player.visitedCellIds.push(action.targetCellId);

      const cell = mapDef.cells[action.targetCellId];
      if (cell && cell.type === 'CHEST' && cell.chestReward) {
        this.applyChestReward(player, cell.chestReward);
      }

      events.push({
        type: 'TORCH_USED',
        playerId: action.playerId,
        cellId: action.targetCellId,
      });
    } else if (action.type === 'SUBMIT_PAIRS') {
      newState.pendingSubmissions[action.playerId] = action.submission;
      events.push({ type: 'PAIRS_SUBMITTED', playerId: action.playerId });

      const allPlayerIds = Object.keys(newState.playerStates);
      const allSubmitted = allPlayerIds.every((pid) => !!newState.pendingSubmissions[pid]);

      if (allSubmitted) {
        this.resolveRoundSubmissions(newState, events, mapDef);
      }
    }

    return { newState, events };
  }

  sanitizeStateForPlayer(
    state: DungeonsDiceDangerGameState,
    playerId: string
  ): DungeonsDiceDangerGameState {
    return JSON.parse(JSON.stringify(state));
  }

  private validatePairTarget(
    player: PlayerSheetState,
    pair: PairTarget,
    roll: DiceRoll,
    mapDef: DungeonMapDefinition
  ): { valid: boolean; reason?: string } {
    if (pair.forfeit) return { valid: true };

    if (!pair.targetCellId) {
      return { valid: false, reason: 'Target cell ID is required unless forfeiting.' };
    }

    const allDice = [...roll.whiteDice, roll.blackDie];
    const d1 = allDice[pair.diceIndices[0]];
    const d2 = allDice[pair.diceIndices[1]];
    if (d1 === undefined || d2 === undefined) {
      return { valid: false, reason: 'Invalid dice index selected.' };
    }

    const sum = d1 + d2;
    const cell = mapDef.cells[pair.targetCellId];
    if (!cell) {
      return { valid: false, reason: `Target cell ${pair.targetCellId} not found.` };
    }

    if (cell.value && cell.value !== sum && !pair.useTorch) {
      return { valid: false, reason: `Selected dice sum ${sum} does not match cell value ${cell.value}.` };
    }

    // Check visit state
    if (player.visitedCellIds.includes(cell.id)) {
      return { valid: false, reason: 'Cell already visited.' };
    }

    // Check activation requirement
    if (cell.requiresActivationCellId) {
      if (!player.visitedCellIds.includes(cell.requiresActivationCellId)) {
        return {
          valid: false,
          reason: `Requires activating space ${cell.requiresActivationCellId} to be visited first.`,
        };
      }
    }

    // Adjacency / Start space check (Errata 1)
    if (cell.type !== 'START') {
      const isAdj = this.isAdjacentToVisited(cell.id, player.visitedCellIds, mapDef);
      if (!isAdj) {
        return { valid: false, reason: 'Space must be adjacent to an already visited space.' };
      }
    }

    return { valid: true };
  }

  private isAdjacentToVisited(
    cellId: string,
    visitedIds: string[],
    mapDef: DungeonMapDefinition
  ): boolean {
    if (visitedIds.length === 0) return false;
    const cell = mapDef.cells[cellId];
    if (!cell) return false;

    return cell.connectedCellIds.some((id) => visitedIds.includes(id));
  }

  private applyChestReward(player: PlayerSheetState, reward: string): void {
    if (reward === 'BLACK_DICE') {
      player.blackDieCharges += 3;
    } else if (reward === 'TORCH') {
      player.torches += 1;
    } else if (reward === 'EXTRA_HEALTH') {
      player.health += 3;
      player.gems += 1;
      player.extraHealthUnlocked = true;
    }
  }

  private resolveRoundSubmissions(
    state: DungeonsDiceDangerGameState,
    events: unknown[],
    mapDef: DungeonMapDefinition
  ): void {
    const isSolo = Object.keys(state.playerStates).length === 1;

    Object.entries(state.pendingSubmissions).forEach(([pid, sub]) => {
      const player = state.playerStates[pid];
      let damageDealtThisRound = 0;

      // Handle Black Die Charge deduction for passive players
      if (pid !== state.activePlayerId && sub.useBlackDie) {
        player.blackDieCharges = Math.max(0, player.blackDieCharges - 1);
      }

      // Process Pair 1 & Pair 2
      [sub.pair1, sub.pair2].forEach((pair) => {
        if (pair.forfeit) {
          player.health -= 1;
          player.skullsCrossed += 1;
        } else if (pair.targetCellId) {
          const cell = mapDef.cells[pair.targetCellId];
          if (cell) {
            player.visitedCellIds.push(cell.id);

            if (cell.type === 'CHEST' && cell.chestReward) {
              this.applyChestReward(player, cell.chestReward);
            }

            if (cell.monsterId) {
              damageDealtThisRound += 1;
              const mDef = mapDef.monsters[cell.monsterId];
              if (!player.damagedMonsterBoxes[cell.monsterId]) {
                player.damagedMonsterBoxes[cell.monsterId] = [];
              }
              if (!player.damagedMonsterBoxes[cell.monsterId].includes(cell.id)) {
                player.damagedMonsterBoxes[cell.monsterId].push(cell.id);
              }

              // Check monster defeat
              if (mDef && player.damagedMonsterBoxes[cell.monsterId].length === mDef.lifeBoxes.length) {
                if (!player.defeatedMonsterIds.includes(cell.monsterId)) {
                  player.defeatedMonsterIds.push(cell.monsterId);

                  // First player defeat rewards
                  player.gems += mDef.rewardGems;
                  player.health -= mDef.lifePenaltyOnDefeat;
                  if (mDef.lifePenaltyOnDefeat > 0) {
                    player.skullsCrossed += mDef.lifePenaltyOnDefeat;
                  }

                  events.push({
                    type: 'MONSTER_DEFEATED',
                    playerId: pid,
                    monsterId: cell.monsterId,
                    gemsAwarded: mDef.rewardGems,
                  });
                }
              }
            }
          }
        }
      });

      // Solo Damage Penalty (Errata Solo): Lose 1 life if no monster hit
      if (isSolo && damageDealtThisRound === 0) {
        player.health -= 1;
        player.skullsCrossed += 1;
      }
    });

    // Check game end conditions
    const allMonstersDefeated = Object.keys(mapDef.monsters).every((mId) =>
      Object.values(state.playerStates).some((p) => p.defeatedMonsterIds.includes(mId))
    );

    const soloDied = isSolo && Object.values(state.playerStates)[0].health <= 0;

    if (allMonstersDefeated || soloDied) {
      state.isComplete = true;
      const scoringResult = scoreGame(state.playerStates, mapDef);
      state.lastScoringResult = scoringResult;
      state.winnerPlayerId = scoringResult.winnerPlayerId;

      events.push({
        type: 'GAME_COMPLETED',
        winnerPlayerId: state.winnerPlayerId,
        scoring: scoringResult,
      });
    } else {
      // Reset for next round
      state.round += 1;
      state.phase = 'ROLLING';
      state.currentRoll = null;
      state.pendingSubmissions = {};

      const currentIdx = state.turnOrder.indexOf(state.activePlayerId);
      const nextIdx = (currentIdx + 1) % state.turnOrder.length;
      state.activePlayerId = state.turnOrder[nextIdx];

      events.push({
        type: 'ROUND_COMPLETED',
        nextRound: state.round,
        nextActivePlayerId: state.activePlayerId,
      });
    }
  }
}
