# BoardGameTime — Full-Stack Architecture Artifact

This document details the architectural layout, component interactions, data flows, and infrastructure layout for the **BoardGameTime** multiplayer board game platform.

---

## 🏗️ 1. Full-Stack System Architecture

```mermaid
flowchart TB
    %% ==========================================
    %% CLIENT TIER
    %% ==========================================
    subgraph ClientTier["🌐 Client Layer (apps/web)"]
        direction TB
        User["User / Web Browser"]
        NextApp["Next.js 14 App Router\n(React / TypeScript / CSS)"]
        UIBoard["Interactive 5x6 Board UI\n& Lobby Manager"]
        SocketClient["Socket.IO Client\n(WebSockets)"]
        RestClient["Axios / Fetch REST Client\n(HTTP/HTTPS)"]

        User --> NextApp
        NextApp --> UIBoard
        UIBoard --> SocketClient
        UIBoard --> RestClient
    end

    %% ==========================================
    %% API & REALTIME SERVER TIER
    %% ==========================================
    subgraph ServerTier["⚙️ Backend & Realtime Layer (apps/api)"]
        direction TB
        Fastify["Fastify REST Server\n(Port 4000)"]
        SocketServer["Socket.IO Realtime Engine\n(WebSocket Server)"]
        AuthMiddleware["JWT Authentication\n& Request Validation"]
        RouteControllers["REST Routes\n(/auth, /lobbies, /matches)"]
        MatchOrchestrator["Game Match Orchestrator\n& Turn Dispatcher"]

        Fastify --> AuthMiddleware
        AuthMiddleware --> RouteControllers
        SocketServer --> MatchOrchestrator
        RouteControllers --> MatchOrchestrator
    end

    %% ==========================================
    %% MONOREPO DOMAIN & RULES PACKAGES
    %% ==========================================
    subgraph DomainTier["📦 Monorepo Domain Packages (packages/*)"]
        direction TB
        PkgTypes["@boardgametime/types\n(DTOs, Socket Payload Contracts)"]
        PkgGamesCore["@boardgametime/games/core\n(Base Game Engine & State Machine)"]
        PkgKingdoms["@boardgametime/games/kingdoms\n(Server-Authoritative Kingdoms Rules)"]
        PkgDB["@boardgametime/db\n(Prisma ORM & Persistence Helpers)"]

        PkgGamesCore --> PkgKingdoms
    end

    %% ==========================================
    %% DATA & PERSISTENCE TIER
    %% ==========================================
    subgraph DataTier["🗄️ Persistence & Caching Layer"]
        direction TB
        Postgres[("PostgreSQL 16\n- Users & Lobbies\n- Match State Snapshots\n- Append-Only MatchEvent Log")]
        Redis[("Redis 7 Memorystore\n- Session Storage\n- Socket.IO Adapter & Pub/Sub")]
    end

    %% ==========================================
    %% CLOUD & INFRASTRUCTURE TIER
    %% ==========================================
    subgraph InfraTier["☁️ GCP Cloud Infrastructure (infra/terraform)"]
        direction TB
        VPC["Google VPC Network (boardgametime-vpc)"]
        VPCConn["Serverless VPC Access Connector"]
        CloudRunWeb["Cloud Run: boardgametime-web"]
        CloudRunAPI["Cloud Run: boardgametime-api"]
        CloudSQL["Managed Cloud SQL (PostgreSQL 16)"]
        CloudRedis["Cloud Memorystore for Redis"]
        ArtifactReg["Artifact Registry (Docker Repository)"]

        VPC --> VPCConn
        VPCConn --> CloudSQL
        VPCConn --> CloudRedis
        ArtifactReg -.-> CloudRunWeb
        ArtifactReg -.-> CloudRunAPI
    end

    %% ==========================================
    %% CROSS-TIER CONNECTIONS
    %% ==========================================
    RestClient -->|"HTTP/HTTPS REST (Auth, Lobbies)"| Fastify
    SocketClient -->|"WSS / WebSockets (Real-time Turns)"| SocketServer

    ServerTier --> PkgTypes
    ClientTier --> PkgTypes
    MatchOrchestrator -->|"Invoke Validation & State Transitions"| PkgKingdoms
    ServerTier --> PkgDB

    PkgDB -->|"Prisma Client Queries"| Postgres
    MatchOrchestrator -->|"Broadcast & Session Cache"| Redis
```

---

## 🔄 2. Real-Time Turn Execution Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor PlayerA as Player 1 (Active Web Client)
    participant SocketAPI as Socket.IO / Fastify (apps/api)
    participant Engine as Kingdoms Engine (packages/games)
    participant DB as PostgreSQL (Prisma ORM)
    participant Redis as Redis (Pub/Sub)
    actor PlayerB as Player 2 (Opponent Web Client)

    PlayerA->>SocketAPI: Send action payload: `place_tile` (x, y)
    SocketAPI->>SocketAPI: Verify JWT token & active match seat
    SocketAPI->>Engine: Evaluate action against `KingdomsState`

    alt Invalid Move
        Engine-->>SocketAPI: Return Validation Error
        SocketAPI-->>PlayerA: Emit `error` (Illegal Move)
    else Valid Move
        Engine->>Engine: Calculate state transition & update epoch score
        SocketAPI->>DB: Append event to `MatchEvent` log & update `Match.stateSnapshot`
        SocketAPI->>Redis: Publish state update to Redis channel
        Redis-->>SocketAPI: Broadcast to all lobby connections
        SocketAPI-->>PlayerA: Emit `match_updated` (New Game State)
        SocketAPI-->>PlayerB: Emit `match_updated` (New Game State)
    end
```

---

## 🧩 3. Component Details & Subsystem Responsibilities

| Subsystem / Layer | Monorepo Path | Technologies | Core Responsibilities |
|---|---|---|---|
| **Web Frontend** | `apps/web` | Next.js 14 (App Router), React, Tailwind CSS | Sleek dark-mode glassmorphism UI, interactive 5x6 board grid, client-side Socket.IO hooks, REST communication. |
| **API & Realtime Server** | `apps/api` | Fastify, Socket.IO Server, JWT | REST endpoints for auth/lobby control, Socket.IO gateway for real-time player actions, session validation. |
| **Rules Engine Core** | `packages/games/core` | Pure TypeScript | Base engine abstractions, state machine interfaces (`GameEngine`, `BasePlayerState`). |
| **Kingdoms Engine** | `packages/games/kingdoms` | Pure TypeScript, Vitest | Server-authoritative rules, tile placement, castle positioning, epoch scoring calculator. |
| **Database & Persistence** | `packages/db` | Prisma ORM, PostgreSQL 16 | User accounts, lobby states, match snapshots, append-only `MatchEvent` audit/replay log. |
| **Shared Contracts & Types** | `packages/types` | TypeScript DTOs | Shared API payloads, Socket event schemas, match state shapes. |
| **Cloud Infrastructure** | `infra/terraform` | GCP, HashiCorp Terraform | Managed GCP deployment via Cloud Run v2, Serverless VPC Access Connector, Cloud SQL, Cloud Memorystore Redis. |

---

## 🔒 4. Security & Network Isolation

1. **VPC Network Isolation**: Cloud SQL PostgreSQL and Cloud Memorystore Redis are deployed with private IP addresses inside the `boardgametime-vpc` Virtual Private Cloud.
2. **Serverless VPC Access**: Cloud Run services access database and Redis instances exclusively through the `boardgametime-vpc-conn` Serverless VPC Connector (`10.8.0.0/28`).
3. **Stateless Authentication**: HTTP and Socket.IO connection handshakes require signed JSON Web Tokens (JWT).
4. **Server Authoritative Architecture**: Game engine logic is executed exclusively on the server (`apps/api`); the client software only sends requested player move intent.
