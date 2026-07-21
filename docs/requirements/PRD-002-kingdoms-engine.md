# PRD-002: Kingdoms Game Engine Specification

- **Status**: Drafted / Pending Review
- **Author**: Antigravity & User
- **Date**: 2026-07-21
- **Game Credit**: Reiner Knizia / Fantasy Flight Games (2002 Edition)
- **Target Engine Package**: \packages/games/kingdoms\

---

## 1. Overview

This document specifies the exact game rules, data structures, state machine, turn validation, and scoring algorithms for **Kingdoms**. The game engine implemented in \packages/games/kingdoms\ MUST be deterministic, pure, and server-authoritative.

---

## 2. Components & Initial State

### 2.1 Board Layout
- Grid: **5 Columns × 6 Rows** (30 total board spaces).
- Coordinate system: \(row, col)\ where \
ow ∈ [0, 5]\ and \col ∈ [0, 4]\.

### 2.2 Castles Inventory per Player
Each player chooses a color. Starting castles depend on player count:

| Player Count | Rank 1 Castles | Rank 2 Castles | Rank 3 Castles | Rank 4 Castles | Total Castles per Player |
|---|---|---|---|---|---|
| **2 Players** | 4 | 1 | 1 | 1 | 7 |
| **3 Players** | 3 | 1 | 1 | 1 | 6 |
| **4 Players** | 2 | 1 | 1 | 1 | 5 |

- Starting Gold Capital: **50 Gold** per player.
- Player order: Randomly selected for Epoch 1; highest gold player starts Epoch 2 & 3.

### 2.3 Tile Inventory (22 Total Tiles)
- **12 Resource Tiles**: Positive values \+1\ through \+6\.
- **6 Hazard Tiles**: Negative values \-1\ through \-6\.
- **1 Gold Mine Tile**: Doubles all tile values (+ and -) in its row & column segment.
- **2 Mountain Tiles**: Obstacles that split their row and column into two independent scoring segments.
- **1 Dragon Tile**: Cancels all positive Resource Tiles in its row & column segment.

---

## 3. Game Lifecycle & Epoch Structure

The game lasts exactly **3 Epochs (rounds)**.

### 3.1 Setup Phase (At start of each Epoch)
1. Shuffle all 22 tiles into a face-down draw pile (bank).
2. Each player secretly draws **1 tile** from the draw pile into their hand (\secret_tile\).
3. Set Epoch counter (Epoch 1, 2, or 3).
4. Board is completely empty.

### 3.2 Turn Execution Phase
Play rotates clockwise. On a player's turn, they MUST execute exactly **one** of the following actions:

1. **\PLACE_CASTLE**: Select an available castle from personal reserve and place face-up on any empty board space \(r, c)\.
2. **\DRAW_AND_PLACE_TILE**: Draw top tile from draw pile, inspect it, and place face-up on any empty board space \(r, c)\.
3. **\PLACE_SECRET_TILE**: Place secret tile (drawn during setup) face-up on any empty board space \(r, c)\.

- **Pass Rule**: A player MAY PASS only if they have no legal actions available (e.g., all castles played and no tiles remaining).
- **Immutability Rule**: Placed tiles and castles cannot be moved or replaced for the remainder of the epoch.

### 3.3 Epoch End & Scoring Phase
An Epoch ends when **all 30 board spaces are filled** (or no player can make a legal move).

#### Segmented Scoring Algorithm
Each row and column (or line segment split by a Mountain) is scored independently:
1. **Mountain Split**: If a Mountain is present in a row/column, split that line into two independent segments at the Mountain space.
2. **Dragon Cancellation**: If a Dragon is present in a segment, ignore all positive Resource Tiles in that segment. Hazard Tiles still count.
3. **Gold Mine Doubler**: If a Gold Mine is present in a segment, double the combined base value of the tiles in that segment.
4. **Player Payout**:
- {Segment Value} = {Sum of effective tiles} times {Doubler factor (if Gold Mine)}
- {Player Payout} = {Segment Value} times {sum Ranks of Player's Castles in Segment}
5. Each tile/castle scores **twice** (once for its row segment, once for its column segment).
6. Players add (or subtract) payout to/from their gold total. Players CAN go into debt (negative gold).

### 3.4 Epoch Cleanup Phase
1. Remove all tiles from the board.
2. **Rank 1 Castles**: Returned to players' hands.
3. **Rank 2, 3, 4 Castles**: Placed castles of Rank 2, 3, or 4 are **permanently removed** from the game.
4. Advance Epoch marker. If Epoch 3 has ended, declare winner (highest Gold).

---

## 4. State Machine Interface (packages/games/kingdoms\)

```typescript
export interface KingdomsGameState {
  epoch: 1 | 2 | 3;
  board: (BoardSpace | null)[][]; // 6x5 grid
  players: Record<string, PlayerState>;
  drawPile: Tile[];
  turnOrder: string[];
  activePlayerId: string;
  isComplete: boolean;
}

export type KingdomsAction =
  | { type: 'PLACE_CASTLE'; playerId: string; rank: 1 | 2 | 3 | 4; row: number; col: number }
  | { type: 'DRAW_AND_PLACE_TILE'; playerId: string; row: number; col: number }
  | { type: 'PLACE_SECRET_TILE'; playerId: string; row: number; col: number }
  | { type: 'PASS'; playerId: string };
```
