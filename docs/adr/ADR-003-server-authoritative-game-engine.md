# ADR-003: Server-Authoritative Game Engine Architecture

- **Status**: Approved
- **Date**: 2026-07-21
- **Deciders**: Engineering Lead & Product Owner

---

## Context and Problem Statement

Multiplayer board games require strict enforcement of game rules, turn ordering, secret tile visibility, and cheat prevention. We must decide where game logic and state validation reside.

## Decision Drivers

- Absolute prevention of client-side state manipulation or illegal move submission.
- Deterministic state machine behavior.
- Support for secret state (e.g. initial secret face-down tiles in Kingdoms).
- Lightweight web client.

## Decision Outcome

Chosen Option: **100% Server-Authoritative Execution (packages/games/*)**.

### Architecture Pattern

1. **State Machine (packages/games/kingdoms)**:
   - Implemented as pure TypeScript functions taking (currentState, action) and returning { newState, events, errors }.
   - Contains zero network or DB dependencies.
2. **Server Execution (apps/api)**:
   - The API server receives player action payloads.
   - Validates action legality against the current match state snapshot.
   - Computes state mutation and appends to match_events table.
   - Sanitizes state before sending to clients (e.g., hiding opponent secret tiles).
3. **Lightweight Client (apps/web)**:
   - Renders received board state.
   - Dispatches user intent actions (e.g. PLACE_CASTLE, 
ow: 2, col: 3) to API via WebSocket/REST.
   - Does not independently advance match state.

### Consequences

- **Positive**: Complete cheat protection; secret information never leaks to client DOM/JS bundle.
- **Positive**: Easy to test with Vitest unit tests without mocking UI or network layers.
- **Negative**: Action responsiveness relies on network latency to API server (mitigated via optimistic UI rendering where applicable).
