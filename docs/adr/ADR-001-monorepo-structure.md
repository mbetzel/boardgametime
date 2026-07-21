# ADR-001: Monorepo Architecture and Multi-Game Directory Layout

- **Status**: Approved
- **Date**: 2026-07-21
- **Deciders**: Engineering Lead & Product Owner

---

## Context and Problem Statement

BoardGameTime is designed to host multiple board games, starting with **Kingdoms**. We need a repository layout that allows shared code (auth, lobby primitives, DB schema, UI components, WebSocket protocol definitions) to be reused cleanly across front-end (pps/web), back-end (pps/api), and game engines without package publication overhead.

## Decision Drivers

- Clean separation between platform features and game-specific rules.
- Fast local build times and dependency linking.
- Type safety across client, API, and game engines.
- Future extensibility for adding new games alongside Kingdoms.

## Considered Options

1. **Multi-Repo Architecture**: Separate repos for web, api, kingdoms-engine, db.
2. **Monorepo with Turborepo & pnpm Workspaces** (Selected).

## Decision Outcome

Chosen Option: **Monorepo with Turborepo & pnpm Workspaces**.

### Workspace Layout

\\\
boardgametime/
├── apps/
│   ├── web/                          ← Next.js 14 front end (App Router)
│   └── api/                          ← Fastify REST API + Socket.IO server
├── packages/
│   ├── games/
│   │   ├── core/                     ← Shared game engine interfaces (TurnResult, GameStatus)
│   │   └── kingdoms/                 ← Kingdoms game rules & state machine engine
│   ├── db/                           ← Prisma schema, migrations, DB client factory
│   ├── types/                        ← Shared DTOs, API payloads, Socket event definitions
│   └── config/                       ← Shared TSConfig, ESLint, Prettier configs
├── docs/
│   ├── requirements/                 ← PRDs
│   └── adr/                          ← ADRs
└── infra/
    └── terraform/                    ← GCP Terraform modules
\\\

### Consequences

- **Positive**: Adding a new game (e.g. packages/games/catan) requires zero platform refactoring.
- **Positive**: Changes to shared types or DB schema are reflected instantly across pps/web and pps/api.
- **Negative**: Requires pnpm for monorepo linking and Turborepo for build caching.
