import { describe, expect, it } from 'vitest';
import { DungeonsDiceDangerGameEngine, DUNGEONS_DICE_DANGER_GAME_ID } from '../engine';

describe('DungeonsDiceDangerGameEngine', () => {
  const engine = new DungeonsDiceDangerGameEngine();

  it('has correct gameId and player limits', () => {
    expect(engine.gameId).toBe(DUNGEONS_DICE_DANGER_GAME_ID);
    expect(engine.minPlayers).toBe(1);
    expect(engine.maxPlayers).toBe(4);
  });

  it('initializes single player (solo) state correctly', () => {
    const state = engine.createInitialState(['player-1']);

    expect(state.gameId).toBe('dungeons-dice-danger');
    expect(state.mapId).toBe('annoyed-animals');
    expect(state.round).toBe(1);
    expect(state.phase).toBe('ROLLING');
    expect(state.activePlayerId).toBe('player-1');
    expect(state.playerStates['player-1'].health).toBe(10);
    expect(state.playerStates['player-1'].blackDieCharges).toBe(3);
    expect(state.playerStates['player-1'].torches).toBe(0);
  });

  it('allows active player to roll dice', () => {
    let state = engine.createInitialState(['p1', 'p2']);

    const { newState } = engine.applyAction(
      state,
      { type: 'ROLL_DICE', playerId: 'p1' },
      () => 0.5
    );

    expect(newState.phase).toBe('SUBMITTING_PAIRS');
    expect(newState.currentRoll).not.toBeNull();
    expect(newState.currentRoll?.whiteDice.length).toBe(4);
    expect(newState.currentRoll?.blackDie).toBeGreaterThanOrEqual(1);
  });

  it('handles pair submission and forfeiting correctly', () => {
    let state = engine.createInitialState(['p1']);
    state = engine.applyAction(state, { type: 'ROLL_DICE', playerId: 'p1' }, () => 0.5).newState;

    // Submit pair with forfeit
    const { newState } = engine.applyAction(state, {
      type: 'SUBMIT_PAIRS',
      playerId: 'p1',
      submission: {
        pair1: { diceIndices: [0, 1], forfeit: true },
        pair2: { diceIndices: [2, 3], forfeit: true },
      },
    });

    expect(newState.round).toBe(2);
    expect(newState.phase).toBe('ROLLING');
    expect(newState.playerStates['p1'].health).toBeLessThan(10);
  });
});
