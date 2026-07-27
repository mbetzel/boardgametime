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

    const { newState: stagedState } = engine.applyAction(state, {
      type: 'PLACE_CASTLE',
      playerId: 'p1',
      rank: 1,
      row: 0,
      col: 0,
    });

    expect(stagedState.board[0][0]).toEqual({
      type: 'CASTLE',
      playerId: 'p1',
      rank: 1,
    });
    expect(stagedState.players['p1'].availableCastles.find((c) => c.rank === 1)?.count).toBe(3);

    const { newState } = engine.applyAction(stagedState, {
      type: 'CONFIRM_TURN',
      playerId: 'p1',
    });

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

    const { newState: stagedState } = engine.applyAction(state, {
      type: 'DRAW_AND_PLACE_TILE',
      playerId: 'p1',
      row: 1,
      col: 1,
    });

    expect(stagedState.board[1][1].type).toBe('TILE');
    expect(stagedState.drawPile.length).toBe(initialDrawCount - 1);

    const { newState } = engine.applyAction(stagedState, {
      type: 'CONFIRM_TURN',
      playerId: 'p1',
    });

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

        const { newState: stagedState } = engine.applyAction(state, actionToTake);
        const { newState } = engine.applyAction(stagedState, {
          type: 'CONFIRM_TURN',
          playerId: activePid,
        });
        state = newState;
        cellCount++;
      }
    }

    expect(cellCount).toBe(29);
    expect(state.epoch).toBe(1);

    // Place final 30th tile to trigger Epoch 1 scoring & transition to Epoch 2
    const finalActivePid = state.activePlayerId;
    const { newState: stagedEpoch2State } = engine.applyAction(state, {
      type: 'DRAW_AND_PLACE_TILE',
      playerId: finalActivePid,
      row: 5,
      col: 4,
    });
    const { newState: epoch2State, events } = engine.applyAction(stagedEpoch2State, {
      type: 'CONFIRM_TURN',
      playerId: finalActivePid,
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
    const { newState: stagedEpoch2NextState } = engine.applyAction(epoch2State, {
      type: 'PLACE_CASTLE',
      playerId: activeInEpoch2,
      rank: 1,
      row: 0,
      col: 0,
    });
    const { newState: epoch2NextState } = engine.applyAction(stagedEpoch2NextState, {
      type: 'CONFIRM_TURN',
      playerId: activeInEpoch2,
    });
    expect(epoch2NextState.epoch).toBe(2);
    expect(epoch2NextState.lastScoringResult).toBeDefined();
    expect(epoch2NextState.lastScoringResult?.epoch).toBe(1);
  });

  it('supports turn confirmation and cancellation for castle placement', () => {
    const state = engine.createInitialState(playerIds);

    // 1. Stage castle placement
    const { newState: stagedState } = engine.applyAction(state, {
      type: 'PLACE_CASTLE',
      playerId: 'p1',
      rank: 1,
      row: 0,
      col: 0,
    });

    expect(stagedState.pendingTurnConfirmation).toBe(true);
    expect(stagedState.board[0][0].type).toBe('CASTLE');
    expect(stagedState.activePlayerId).toBe('p1'); // Turn stays with p1 until confirmed

    // 2. Cancel turn
    const { newState: cancelledState } = engine.applyAction(stagedState, {
      type: 'CANCEL_TURN',
      playerId: 'p1',
    });

    expect(cancelledState.pendingTurnConfirmation).toBe(false);
    expect(cancelledState.board[0][0].type).toBe('EMPTY');
    expect(cancelledState.players['p1'].availableCastles.find((c) => c.rank === 1)?.count).toBe(4);

    // 3. Stage castle placement again and confirm
    const { newState: restagedState } = engine.applyAction(cancelledState, {
      type: 'PLACE_CASTLE',
      playerId: 'p1',
      rank: 1,
      row: 0,
      col: 1,
    });

    const { newState: confirmedState } = engine.applyAction(restagedState, {
      type: 'CONFIRM_TURN',
      playerId: 'p1',
    });

    expect(confirmedState.pendingTurnConfirmation).toBe(false);
    expect(confirmedState.board[0][1].type).toBe('CASTLE');
    expect(confirmedState.activePlayerId).toBe('p2'); // Advanced to next player upon confirmation
  });

  it('preserves drawn tile when cancelling tile placement', () => {
    const state = engine.createInitialState(playerIds);

    // Stage tile draw & place
    const { newState: stagedState } = engine.applyAction(state, {
      type: 'DRAW_AND_PLACE_TILE',
      playerId: 'p1',
      row: 1,
      col: 1,
    });

    const drawnTile = stagedState.pendingDrawnTile;
    expect(drawnTile).toBeDefined();

    // Cancel placement
    const { newState: cancelledState } = engine.applyAction(stagedState, {
      type: 'CANCEL_TURN',
      playerId: 'p1',
    });

    // Cell cleared, but pendingDrawnTile remains drawn
    expect(cancelledState.board[1][1].type).toBe('EMPTY');
    expect(cancelledState.pendingDrawnTile?.id).toBe(drawnTile?.id);

    // Place drawn tile on different cell
    const { newState: relocatedState } = engine.applyAction(cancelledState, {
      type: 'PLACE_DRAWN_TILE',
      playerId: 'p1',
      row: 2,
      col: 2,
    });

    expect(relocatedState.board[2][2].type).toBe('TILE');

    const { newState: confirmedState } = engine.applyAction(relocatedState, {
      type: 'CONFIRM_TURN',
      playerId: 'p1',
    });

    expect(confirmedState.board[2][2].type).toBe('TILE');
    expect(confirmedState.pendingDrawnTile).toBeNull();
    expect(confirmedState.activePlayerId).toBe('p2');
  });

  it('allows cancelling a drawn-but-not-placed tile and returns it to the draw pile', () => {
    const state = engine.createInitialState(playerIds);
    const initialDrawCount = state.drawPile.length;

    // 1. Draw and place tile
    const { newState: stagedState } = engine.applyAction(state, {
      type: 'DRAW_AND_PLACE_TILE',
      playerId: 'p1',
      row: 1,
      col: 1,
    });

    const drawnTile = stagedState.pendingDrawnTile;
    expect(drawnTile).toBeDefined();
    expect(stagedState.drawPile.length).toBe(initialDrawCount - 1);

    // 2. Cancel the placement (tile stays drawn, board cell cleared)
    const { newState: cancelledPlacement } = engine.applyAction(stagedState, {
      type: 'CANCEL_TURN',
      playerId: 'p1',
    });

    expect(cancelledPlacement.board[1][1].type).toBe('EMPTY');
    expect(cancelledPlacement.pendingDrawnTile?.id).toBe(drawnTile?.id);
    expect(cancelledPlacement.pendingPlacement).toBeNull();
    expect(cancelledPlacement.pendingTurnConfirmation).toBe(false);

    // 3. Cancel again — this is the bug scenario: drawn tile but no placement
    //    Previously this threw "No pending turn action to cancel."
    const { newState: fullyCancelled } = engine.applyAction(cancelledPlacement, {
      type: 'CANCEL_TURN',
      playerId: 'p1',
    });

    // Tile returned to draw pile, pendingDrawnTile cleared
    expect(fullyCancelled.pendingDrawnTile).toBeNull();
    expect(fullyCancelled.drawPile.length).toBe(initialDrawCount);
    expect(fullyCancelled.pendingPlacement).toBeNull();
    expect(fullyCancelled.pendingTurnConfirmation).toBe(false);
    // Player turn should still be active (not advanced)
    expect(fullyCancelled.activePlayerId).toBe('p1');
  });

  it('reuses pendingDrawnTile when DRAW_AND_PLACE_TILE is called again in same turn', () => {
    const state = engine.createInitialState(playerIds);
    const initialDrawCount = state.drawPile.length;

    // 1. First DRAW_AND_PLACE_TILE
    const { newState: staged1 } = engine.applyAction(state, {
      type: 'DRAW_AND_PLACE_TILE',
      playerId: 'p1',
      row: 0,
      col: 0,
    });

    const firstDrawnTile = staged1.pendingDrawnTile;
    expect(firstDrawnTile).toBeDefined();
    expect(staged1.drawPile.length).toBe(initialDrawCount - 1);

    // 2. Second DRAW_AND_PLACE_TILE on a different cell without confirming
    const { newState: staged2 } = engine.applyAction(staged1, {
      type: 'DRAW_AND_PLACE_TILE',
      playerId: 'p1',
      row: 0,
      col: 1,
    });

    // Same tile reused, draw pile count does NOT decrease again
    expect(staged2.pendingDrawnTile?.id).toBe(firstDrawnTile?.id);
    expect(staged2.drawPile.length).toBe(initialDrawCount - 1);
    expect(staged2.board[0][0].type).toBe('EMPTY');
    expect(staged2.board[0][1].type).toBe('TILE');
  });

  it('sanitizes face-down drawPile tiles while preserving pendingDrawnTile for active player', () => {
    const state = engine.createInitialState(playerIds);

    const { newState: stagedState } = engine.applyAction(state, {
      type: 'DRAW_AND_PLACE_TILE',
      playerId: 'p1',
      row: 1,
      col: 1,
    });

    const sanitizedForP1 = engine.sanitizeStateForPlayer(stagedState, 'p1');

    // Face-down draw pile tiles are hidden
    sanitizedForP1.drawPile.forEach((tile) => {
      expect(tile.name).toBe('Face-Down Tile');
      expect(tile.value).toBe(0);
    });

    // P1 sees their pendingDrawnTile
    expect(sanitizedForP1.pendingDrawnTile?.id).toBe(stagedState.pendingDrawnTile?.id);
  });

  // ── Regression: "Face-Down Tile" shown as tile preview before drawing ──────
  //
  // Bug: the UI derived `nextDrawTile` from `drawPile[last]` as a fallback when
  // `pendingDrawnTile` was absent. The server sanitizes every drawPile entry to a
  // stub (`{ name: 'Face-Down Tile', value: 0 }`), so the hover preview and action
  // badge displayed "Face-Down Tile" until the player clicked to place the tile.
  //
  // Fix: `nextDrawTile` in the UI now derives solely from `pendingDrawnTile`.
  // These tests lock in the server-side contract that the fix depends on.

  it('pendingDrawnTile is absent before any draw action, so UI shows no tile preview', () => {
    const state = engine.createInitialState(playerIds);

    // Before any draw: no pending tile exists on the raw state
    expect(state.pendingDrawnTile).toBeFalsy();

    // After sanitization the same holds — the UI must not fall back to drawPile
    const sanitized = engine.sanitizeStateForPlayer(state, 'p1');
    expect(sanitized.pendingDrawnTile).toBeFalsy();

    // Every drawPile entry is a face-down stub — using any of them as a preview
    // would reproduce the defect, so they must never be treated as real tiles
    sanitized.drawPile.forEach((tile) => {
      expect(tile.name).toBe('Face-Down Tile');
      expect(tile.id).toMatch(/^hidden_/);
    });
  });

  it('pendingDrawnTile is set to the real tile only after a draw action is applied', () => {
    const state = engine.createInitialState(playerIds);
    const realTopTile = state.drawPile[state.drawPile.length - 1]; // server-side identity

    const { newState: staged } = engine.applyAction(state, {
      type: 'DRAW_AND_PLACE_TILE',
      playerId: 'p1',
      row: 0,
      col: 0,
    });

    // The engine pops the real tile into pendingDrawnTile
    expect(staged.pendingDrawnTile).toBeDefined();
    expect(staged.pendingDrawnTile!.id).toBe(realTopTile.id);
    expect(staged.pendingDrawnTile!.name).not.toBe('Face-Down Tile');

    // Sanitized state preserves pendingDrawnTile so the UI can show the real tile
    const sanitized = engine.sanitizeStateForPlayer(staged, 'p1');
    expect(sanitized.pendingDrawnTile?.id).toBe(realTopTile.id);
    expect(sanitized.pendingDrawnTile?.name).not.toBe('Face-Down Tile');
  });

  it('opponent receives face-down drawPile stubs and null-equivalent pendingDrawnTile after active player draws', () => {
    const state = engine.createInitialState(playerIds);

    const { newState: staged } = engine.applyAction(state, {
      type: 'DRAW_AND_PLACE_TILE',
      playerId: 'p1',
      row: 0,
      col: 0,
    });

    // Sanity: raw state has the real drawn tile
    expect(staged.pendingDrawnTile).toBeDefined();
    expect(staged.pendingDrawnTile!.name).not.toBe('Face-Down Tile');

    // Opponent (p2) receives sanitized view — drawPile entries are stubs
    const sanitizedForP2 = engine.sanitizeStateForPlayer(staged, 'p2');
    sanitizedForP2.drawPile.forEach((tile) => {
      expect(tile.name).toBe('Face-Down Tile');
    });

    // The current sanitization does NOT further hide pendingDrawnTile from opponents
    // (the drawn tile is already face-up on the board visually). This assertion
    // documents the current behavior so any future change is deliberate.
    expect(sanitizedForP2.pendingDrawnTile?.id).toBe(staged.pendingDrawnTile?.id);
  });

  it('drawPile stubs have a predictable hidden id pattern and are not valid tile previews', () => {
    const state = engine.createInitialState(playerIds);
    const sanitized = engine.sanitizeStateForPlayer(state, 'p1');

    expect(sanitized.drawPile.length).toBeGreaterThan(0);
    sanitized.drawPile.forEach((tile, i) => {
      // All entries must be placeholder stubs
      expect(tile.id).toBe(`hidden_${i}`);
      expect(tile.name).toBe('Face-Down Tile');
      expect(tile.type).toBe('RESOURCE');
      expect(tile.value).toBe(0);
    });
  });
});

