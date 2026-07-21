# BoardGameTime — Multiplayer Board Game Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/mbetzel/boardgametime)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)

**BoardGameTime** is a modern, web-based multiplayer board game platform supporting both **real-time WebSockets** and **async turn-based** play across multiple games. 

Our flagship title is **Kingdoms** (Reiner Knizia / Fantasy Flight Games 2002 rules edition).

---

## 🏗️ Architecture Overview

- **Monorepo Layout**: Turborepo + pnpm workspaces.
- **Rules Engine**: 100% server-authoritative TypeScript state machine (`packages/games/kingdoms`).
- **Backend API & Realtime**: Fastify REST API + Socket.IO server (`apps/api`).
- **Database & Persistence**: PostgreSQL 16 + Prisma ORM (`packages/db`) with append-only event sourcing (`MatchEvent` log).
- **Front-End Client**: Next.js 14 App Router, sleek dark-mode glassmorphism UI, interactive 5x6 game board (`apps/web`).
- **Cloud Infrastructure**: GCP (`us-central1`) provisioned via Terraform (`infra/terraform`).

---

## 💻 Local Development Guide

### 📋 Prerequisites

Before running the platform locally, ensure you have the following installed:

1. **Node.js**: `v20.0.0` or higher
2. **pnpm**: `v9.0.0` or higher (`npm install -g pnpm`)
3. **Docker & Docker Compose**: (For local PostgreSQL & Redis containers)
4. **WSL / Linux Environment**: Recommended for Windows users

---

### 🚀 Quick Start (One-Command Launch)

To start the local database containers, run schema migrations, seed test data, and launch all dev servers concurrently:

```bash
# 1. Clone & install dependencies
git clone https://github.com/mbetzel/boardgametime.git
cd boardgametime
pnpm install

# 2. Copy local environment variables
cp .env.example .env

# 3. Launch full stack (Database services + DB Seed + API & Web Dev Servers)
pnpm dev:all
```

Once running:
- 🌐 **Web Client**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **API Server**: [http://localhost:4000/health](http://localhost:4000/health)

---

### 🔑 Pre-Seeded Test Credentials

Running `pnpm dev:db` (or `pnpm dev:all`) populates your local PostgreSQL database with initial test users and a sample lobby:

| Username | Email | Password | Role / Details |
|---|---|---|---|
| `alice` | `alice@boardgametime.com` | `Password123!` | Host of sample lobby `KING01` |
| `bob` | `bob@boardgametime.com` | `Password123!` | Joined player in lobby `KING01` |
| `charlie` | `charlie@boardgametime.com` | `Password123!` | Test Player 3 |

---

### 🛠️ Step-by-Step Execution Commands

If you prefer to run services individually:

#### 1. Start Local Infrastructure (Postgres & Redis)
```bash
pnpm dev:services
```
*Spins up PostgreSQL 16 on port `5432` and Redis 7 on port `6379` via Docker Compose.*

#### 2. Push Database Schema & Seed Data
```bash
pnpm dev:db
```
*Applies Prisma schema migrations to PostgreSQL and executes `packages/db/prisma/seed.ts`.*

#### 3. Start Development Application Servers
```bash
pnpm dev
```
*Runs Turborepo dev pipeline: Fastify API on port 4000 (with `tsx watch`) and Next.js Web on port 3000.*

---

## 🧪 Testing & Build Verification

```bash
# Run all unit and integration test suites across monorepo
pnpm test

# Run clean production build for all packages
pnpm build
```

---

## 📂 Repository Structure

```
boardgametime/
├── apps/
│   ├── web/                     # Next.js 14 Web Frontend (App Router, Tailwind/CSS, Board UI)
│   └── api/                     # Fastify REST API & Socket.IO Real-Time Engine
├── packages/
│   ├── games/
│   │   ├── core/                # Shared GameEngine & BasePlayerState primitives
│   │   └── kingdoms/            # Kingdoms rules engine, scoring calculator, & Vitest suites
│   ├── db/                      # Prisma ORM schema, migrations, & database seeder
│   ├── types/                   # Shared DTOs, API payloads, & Socket.IO interface types
│   └── config/                  # Shared TSConfig & linting rules
├── docs/                        # PRD Specifications & Architecture Decision Records (ADRs)
├── infra/                       # GCP Terraform Infrastructure modules & deployment guide
├── docker-compose.yml           # Local PostgreSQL 16 & Redis 7 container orchestration
└── package.json                 # Monorepo scripts & Turborepo pipelines
```

---

## 📜 License

Distributed under the MIT License.
