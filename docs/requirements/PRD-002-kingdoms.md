# PRD-002: Kingdoms Game Engine & Interface Specifications

- **Document ID**: PRD-002
- **Status**: Approved / Active
- **Target Release**: MVP v1.0
- **Parent Platform PRD**: [PRD-001 Platform Specifications](file:///Z:/home/mike/github/boardgametime/docs/requirements/PRD-001-platform.md)
- **Source Game**: *Kingdoms* (Fantasy Flight Games 2002 Edition by Reiner Knizia)

---

## 1. Game Overview & Core Rules

*Kingdoms* is a tile-laying strategy board game for 2 to 4 players. Players take turns placing castles and drawing/placing tiles onto a 5x6 grid over 3 Epochs to maximize their total Gold score.

### 1.1 Player Count & Castle Inventory
- **Player Count**: 2 to 4 players.
- **Castle Inventory per Player**:
  - **2 Players**: 4 Rank-1 castles, 1 Rank-2 castle, 1 Rank-3 castle, 1 Rank-4 castle.
  - **3 Players**: 3 Rank-1 castles, 1 Rank-2 castle, 1 Rank-3 castle, 1 Rank-4 castle.
  - **4 Players**: 2 Rank-1 castles, 1 Rank-2 castle, 1 Rank-3 castle, 1 Rank-4 castle.
- **Starting Conditions**:
  - Each player starts with 50 Gold coins.
  - Each player receives 1 secret face-down tile from the shuffled deck.

---

## 2. Tile Set & Board System

### 2.1 Board Dimensions
- 5 Rows by 6 Columns (30 total board cells).

### 2.2 Tile Set (22 Tiles Total)
1. **Resource Tiles (12 tiles)**: Positive values ranging from +1 to +6.
2. **Hazard Tiles (6 tiles)**: Negative values ranging from -1 to -6.
3. **Special Tiles (4 tiles)**:
   - **Gold Mine**: Doubles the total row and column score where placed.
   - **Mountain**: Divides a row and column into two independent scoring segments.
   - **Dragon**: Cancels all positive Resource tiles in its row and column.
   - **Wizard**: Increases the rank of all adjacent castles by +1 for scoring calculations.

---

## 3. Game Play Interface (`/matches/[id]`)

### 3.1 Game Controls & Action Trays
- **Castle Selection Tray**: Allows players to select available Castle Ranks (1–4) with count indicators per rank.
- **Draw Tile Pile**: Remaining tile stack counter with "Draw & Place Tile" action button.
- **Secret Tile View**: View and place the player's starting secret tile.
- **Pass Action**: Allowed only when no legal placement moves remain.

### 3.2 Action Preview Systems
- **Tile Draw Preview**: When "Draw & Place Tile" or "Secret Tile" is selected, the UI displays a prominent tile badge adjacent to the action button and in the selection status bar showing the drawn tile's name, type, icon, and score value.
- **Mouseover Cell Placement Preview**: Hovering over an empty board cell while targeting a placement action renders a live, semi-transparent ghost overlay displaying:
  - **Castle Placement**: Ghosted castle rank in player color (`🏰 Rank X`).
  - **Tile Placement**: Ghosted tile icon, name, score value, and type glow (`+X`, `-X`, `🐉`, `🔮`, `⛰️`, `🪙`).

### 3.3 Status Sidebar & Replay Log
- **Player Status Cards**: Stacked cards (Players 1–4) displaying player avatar badge, username, total Gold score (`🪙 Gold`), castle inventory counts, and active turn glow.
- **Turn History Log**: Scrollable timeline recording every action and epoch scoring summary in real-time.

---

## 4. Epoch & Scoring Engine

1. **Epoch Duration**: A single Epoch ends immediately when all 30 board cells are occupied or no legal actions remain.
2. **Scoring Calculation**:
   - Each row and column score is calculated based on tile modifiers (Resource + Hazard, doubled by Gold Mine, split by Mountain, cancelled by Dragon).
   - Castles multiply the row and column scores by their rank (1, 2, 3, or 4, modified +1 by Wizard).
3. **Epoch Transition (3 Epochs total)**:
   - At the end of Epoch 1 and Epoch 2:
     - Rank-1 castles are returned to player hands.
     - Rank 2, 3, and 4 castles used on the board are removed from the game.
     - All tiles are cleared, reshuffled, and a new secret tile is dealt to each player.
     - The player with the highest current Gold total takes the first turn of the new Epoch.
   - At the end of Epoch 3: The player with the highest total Gold wins the game.
