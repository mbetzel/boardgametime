# ADR-004: Real-Time Transport via Socket.IO and Fastify

- **Status**: Approved
- **Date**: 2026-07-21
- **Deciders**: Engineering Lead & Product Owner

---

## Context and Problem Statement

Both real-time matches and live lobby updates require bidirectional, low-latency communication between client and server.

## Decision Drivers

- Room/Namespace management for lobbies and matches.
- Automatic reconnection and fallback transports.
- Scaling across multiple API container instances in Cloud Run.
- Type-safe socket event contracts.

## Decision Outcome

Chosen Option: **Socket.IO over Fastify with Redis Adapter**.

### Key Mechanisms

- **Namespaces**:
  - /lobbies: Real-time lobby list changes, player join/leave, ready state.
  - /matches: Live game moves, turn notifications, active match state broadcasts.
- **Scaling Adapter**: @socket.io/redis-adapter using GCP Memorystore Redis to broadcast events across multiple API instances.
- **Authentication**: Sockets authenticate via JWT token passed in connection handshake headers.

### Consequences

- **Positive**: Native room support matches board-game lobbies perfectly (socket.join('match:123')).
- **Positive**: Automatic reconnection prevents state desync during brief mobile/network dropouts.
