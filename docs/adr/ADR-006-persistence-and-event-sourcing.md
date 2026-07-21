# ADR-006: Persistence Architecture & Hybrid Event-Sourcing Schema

- **Status**: Approved
- **Date**: 2026-07-21
- **Deciders**: Engineering Lead & Product Owner

---

## Context and Problem Statement

We need a database persistence model that supports fast match hydration, move auditing, turn history replay, and async turn tracking.

## Decision Drivers

- Complete, unalterable history of every move made in every match.
- Sub-millisecond game state retrieval for active matches.
- Ability to replay games move-by-move.
- Schema flexibility for supporting multiple board games.

## Decision Outcome

Chosen Option: **Hybrid Event Sourcing with PostgreSQL & Prisma (packages/db)**.

### Schema Overview

1. **users**: User profiles, auth provider credentials, stats.
2. **lobbies**: Active lobby rooms, game settings, player slots.
3. **matches**:
   - id: UUID
   - game_id: String (e.g. 'kingdoms')
   - status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
   - current_turn_player_id: UUID
   - current_state: JSONB (Latest serialized state snapshot)
4. **match_events** (Append-Only Event Log):
   - id: BigInt / UUID
   - match_id: UUID (Foreign Key)
   - sequence_num: Int (Incremental move index: 1, 2, 3...)
   - player_id: UUID
   - ction_type: String (e.g. 'PLACE_CASTLE')
   - ction_payload: JSONB (e.g. { rank: 2, row: 1, col: 3 })
   - created_at: Timestamp

### Read/Write Pattern

- **On Player Action**:
  1. Load current_state from matches.
  2. Compute next state via packages/games/kingdoms.
  3. In a single Postgres transaction:
     - Insert row into match_events.
     - Update current_state and current_turn_player_id in matches.

### Consequences

- **Positive**: Complete audit log of every game ever played.
- **Positive**: Replay engine can reconstruct board state at any move index N by replaying match_events from 1 to N.
- **Positive**: Fast reads because matches.current_state contains the pre-computed latest snapshot.
