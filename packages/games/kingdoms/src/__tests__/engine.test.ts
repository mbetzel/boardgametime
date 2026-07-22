import { describe, expect, it } from 'vitest';
import { KingdomsGameEngine } from '../engine';
import { BOARD_COLS, BOARD_ROWS } from '../scoring';

describe('Kingdoms Game Engine State Machine', () => {
  const engine = new KingdomsGameEngine();
  const playerIds = ['p1', 'p2'];

  it('creates valid initial state for 2 players', () => {
    const state = engine.createInitialState(playerIds);

    expect(state.epoch).toBe(1);
    expect(state.isComplete).toBe(false);
    expect(state.activePlayerId).toBe('p1');
    expect(state.drawPile.length).toBe(20); // 22 total - 2 secret tiles dealt = 20

    playerIds.forEach((pid) => {
      const p = state.players[pid];
      expect(p.gold).toBe(50);
      expect(p.secretTile).not.toBeNull();
      const rank1 = p.availableCastles.find((c) => c.rank === 1);
      expect(rank1?.count).toBe(4); // 2 players = 4 Rank 1 castles each
    });

    // Board 6x5
    expect(state.board).toHaveLength(BOARD_ROWS);
    expect(state.board[0]).toHaveLength(BOARD_COLS);
  });

  it('validates and applies PLACE_CASTLE action', () => {
    const state = engine.createInitialState(playerIds);

    const actionValidation = engine.validateAction(state, {
      type: 'PLACE_CASTLE',
      playerId: 'p1',
      rank: 1,
      row: 0,
      col: 0,
    });
    expect(actionValidation.valid).toBe(true);

    const { newState } = engine.applyAction(state, {
      type: 'PLACE_CASTLE',
      playerId: 'p1',
      rank: 1,
      row: 0,
      col: 0,
    });

    expect(newState.board[0][0]).toEqual({
      type: 'CASTLE',
      playerId: 'p1',
      rank: 1,
    });
    expect(newState.players['p1'].availableCastles.find((c) => c.rank === 1)?.count).toBe(3);
    expect(newState.activePlayerId).toBe('p2'); // Rotates turn
  });

  it('rejects out-of-turn actions', () => {
    const state = engine.createInitialState(playerIds);

    const validation = engine.validateAction(state, {
      type: 'PLACE_CASTLE',
      playerId: 'p2', // Active player is p1
      rank: 1,
      row: 0,
      col: 0,
    });

    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain("It is player p1's turn");
  });

  it('validates DRAW_AND_PLACE_TILE action', () => {
    const state = engine.createInitialState(playerIds);
    const initialDrawCount = state.drawPile.length;

    const { newState } = engine.applyAction(state, {
      type: 'DRAW_AND_PLACE_TILE',
      playerId: 'p1',
      row: 1,
      col: 1,
    });

    expect(newState.board[1][1].type).toBe('TILE');
    expect(newState.drawPile.length).toBe(initialDrawCount - 1);
    expect(newState.activePlayerId).toBe('p2');
  });

  it('validates PLACE_SECRET_TILE action', () => {
    const state = engine.createInitialState(playerIds);
    const secretTile = state.players['p1'].secretTile;
    expect(secretTile).not.toBeNull();

    const { newState } = engine.applyAction(state, {
      type: 'PLACE_SECRET_TILE',
      playerId: 'p1',
      row: 2,
      col: 2,
    });

    expect(newState.board[2][2]).toEqual({
      type: 'TILE',
      tile: secretTile,
    });
    expect(newState.players['p1'].secretTile).toBeNull();
  });

  it('sanitizes state for player hiding opponents secret tiles', () => {
    const state = engine.createInitialState(playerIds);

    const sanitizedForP1 = engine.sanitizeStateForPlayer(state, 'p1');

    // P1 sees their own secret tile
    expect(sanitizedForP1.players!['p1'].secretTile?.id).toBe(state.players['p1'].secretTile?.id);

    // P1 does NOT see P2 secret tile details
    expect(sanitizedForP1.players!['p2'].secretTile?.id).toBe('hidden_secret');
  });

  it('handles filling the board, scoring, and advancing from Epoch 1 to Epoch 2', () => {
    let state = engine.createInitialState(['p1', 'p2']);

    // Fill board alternating between castles, secret tiles, and deck tiles
    let cellCount = 0;
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        if (r === 5 && c === 4) break; // Leave (5,4) empty for final move

        const activePid = state.activePlayerId;
        const player = state.players[activePid];

        let actionToTake: any;
        const availableCastle = player.availableCastles.find((castle) => castle.count > 0);

        if (availableCastle) {
          actionToTake = {
            type: 'PLACE_CASTLE',
            playerId: activePid,
            rank: availableCastle.rank,
            row: r,
            col: c,
          };
        } else if (player.secretTile) {
          actionToTake = {
            type: 'PLACE_SECRET_TILE',
            playerId: activePid,
            row: r,
            col: c,
          };
        } else {
          actionToTake = {
            type: 'DRAW_AND_PLACE_TILE',
            playerId: activePid,
            row: r,
            col: c,
          };
        }

        const { newState } = engine.applyAction(state, actionToTake);
        state = newState;
        cellCount++;
      }
    }

    expect(cellCount).toBe(29);
    expect(state.epoch).toBe(1);

    // Place final 30th tile to trigger Epoch 1 scoring & transition to Epoch 2
    const finalActivePid = state.activePlayerId;
    const { newState: epoch2State, events } = engine.applyAction(state, {
      type: 'DRAW_AND_PLACE_TILE',
      playerId: finalActivePid,
      row: 5,
      col: 4,
    });

    expect(epoch2State.epoch).toBe(2);
    expect(events.some((e: any) => e.type === 'EPOCH_SCORED')).toBe(true);
    expect(events.some((e: any) => e.type === 'EPOCH_STARTED')).toBe(true);
    expect(epoch2State.lastScoringResult).toBeDefined();
    expect(epoch2State.lastScoringResult?.epoch).toBe(1);

    // Board cleared for Epoch 2
    expect(epoch2State.board[0][0].type).toBe('EMPTY');

    // Subsequent action in Epoch 2 retains Epoch 1 lastScoringResult without resetting or corrupting it
    const activeInEpoch2 = epoch2State.activePlayerId;
    const { newState: epoch2NextState } = engine.applyAction(epoch2State, {
      type: 'PLACE_CASTLE',
      playerId: activeInEpoch2,
      rank: 1,
      row: 0,
      col: 0,
    });
    expect(epoch2NextState.epoch).toBe(2);
    expect(epoch2NextState.lastScoringResult).toBeDefined();
    expect(epoch2NextState.lastScoringResult?.epoch).toBe(1);
  });
});

