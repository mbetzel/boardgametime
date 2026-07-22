# PRD-001: BoardGameTime Platform Specifications

- **Document ID**: PRD-001
- **Status**: Approved / Active
- **Target Release**: MVP v1.0
- **Game PRD Mapping**: [PRD-002 Kingdoms Game Specifications](file:///Z:/home/mike/github/boardgametime/docs/requirements/PRD-002-kingdoms.md)

---

## 1. Product Vision & Architecture Strategy

BoardGameTime is a web-based, multi-game platform supporting both **real-time WebSockets** and **async turn-based** play. The system is designed to host multiple board games in a monorepo architecture (`packages/games/*`), starting with *Kingdoms*.

---

## 2. User Experience & Wireframe Requirements

The web application frontend adheres to the Pencil Wireframe specification (Pages 1–5):

### 2.1 Home Page (`/`)
- **Header**: App title ("Board Game Time"). Displays a "Sign In" button when unauthenticated, and user avatar/username + "Sign Out" button when authenticated.
- **Games Section**: Display gallery of available titles (*Kingdoms*) alongside coming-soon cards for future games (e.g., *Catan*, *Carcassonne* placeholders).
- **Active Game Rooms Section**: Displays list of open public game rooms with instant "Join" actions.
- **My Games (Current Games) Section**: Displays a list of active matches in progress that the currently logged-in user is participating in (with match ID, game title, current epoch/turn status, and instant "Rejoin Match" action). Visible when authenticated.

### 2.2 Sign In (`/auth/login`)
- Dedicated URL route: `/auth/login`.
- Form with Username and Password fields.
- "Sign In" primary action button connected to JWT authentication.
- "Sign In with Google" button:
  - Local Dev Environment: Triggers a mock Google sign-in flow for easy testing without external credentials.
  - Production Environment: Triggers Google OAuth 2.0 redirect flow.
- Link to Create Account (`/auth/register`).

### 2.3 Create Account (`/auth/register`)
- Dedicated URL route: `/auth/register`.
- Form fields: Email Address, Username, Password.
- Client & Server Validation:
  - **Username**: Must be unique across platform.
  - **Email**: Valid email address formatting.
  - **Password Strength**: Minimum 8 characters, requiring a combination of uppercase, lowercase, numbers, and special characters.

### 2.4 Create Game Room (`/lobbies/new`)
- Dedicated screen for room creation:
  - **Select Game**: Dropdown selecting target game (default: *Kingdoms*).
  - **Player Settings**: Number of players selector (variable per game, e.g. 2–4 for *Kingdoms*).
  - **Game Settings**: Play mode (`REALTIME` vs `ASYNC`), Visibility (`PUBLIC` vs `PRIVATE` with 6-char invite code).
  - **Action**: "Create Lobby" button creating room and redirecting host to waiting room.

### 2.5 Game Play Container (`/matches/[id]`)
- **Container Layout**: Two-column responsive interface matching Wireframe Page 5:
  - **Left Section (Main Canvas)**: Renders the active game board grid, action controls, and tile/castle placement preview overlays (delegated to individual game engines as specified in game PRDs such as [PRD-002](file:///Z:/home/mike/github/boardgametime/docs/requirements/PRD-002-kingdoms.md)).
  - **Right Sidebar (Stacked Cards & History)**:
    - **Player Info Cards**: Stacked cards (Players 1–4) showing player color badge, gold/score, remaining inventory, and active turn glow.
    - **Turn History Log**: Scrollable timeline recording every action performed in the match (`MatchEvent` feed).

---

## 3. Non-Functional Requirements & Security

- **Server Authority**: 100% server-authoritative rules enforcement. Clients submit actions; server validates and returns state updates.
- **Event Sourcing**: Every move is saved to `MatchEvent` with `(matchId, sequenceNum)` for full move replays.
- **Single Cloud GCP**: Hosted in `us-central1` via Terraform (Cloud Run, Cloud SQL PostgreSQL 16, Cloud Memorystore Redis).
