# PRD-001: BoardGameTime Platform Core Requirements

- **Status**: Drafted / Pending Review
- **Author**: Antigravity & User
- **Date**: 2026-07-21
- **Target Release**: MVP v1.0

---

## 1. Executive Summary

**BoardGameTime** is a web-based multiplayer board game platform designed to support both real-time (synchronous WebSockets) and turn-based asynchronous play across multiple games. The platform's initial release features **Kingdoms** (designed by Reiner Knizia, Fantasy Flight Games 2002 rules) as its flagship title, with an architecture designed to easily onboard additional board games over time.

---

## 2. Product Objectives & Scope

### 2.1 Core Capabilities
- **Multi-Game Support**: Standardized API, DB, and client interfaces allowing distinct game packages (\packages/games/<game-id>\) to plug into a shared platform infrastructure.
- **Authentication & Authorization**: Seamless signup/login via Username/Password or Google OAuth 2.0.
- **Lobby & Match Creation**: Create public or private games for 2 to 4 players in either real-time or asynchronous mode.
- **Asynchronous Play**: Untimed turns for MVP with in-app notification badges informing players when it is their turn to act.
- **Persistence & Replayability**: Complete event-sourcing log (\match_events\) storing every move made in a match alongside latest state snapshots.

### 2.2 Out of Scope for MVP
- Spectator mode.
- Native mobile apps (responsive web design only).
- Email or push notifications (in-app notifications only).
- Configurable turn expiration timers (turns are untimed in MVP).

---

## 3. Detailed Requirements

### 3.1 Authentication & User Profiles
- **REQ-AUTH-1**: User Registration via Credentials (email, username, password with bcrypt hashing).
- **REQ-AUTH-2**: Third-Party Authentication via Google OAuth 2.0.
- **REQ-AUTH-3**: JWT Token Issuance by NextAuth v5, readable and validated by both Next.js client and Fastify API / Socket.IO server.
- **REQ-AUTH-4**: User Profile displaying display name, avatar, match statistics (wins, losses, games played).

### 3.2 Game Lobbies & Matchmaking
- **REQ-LOBBY-1**: Lobby Creation — Host selects:
  - Game Type (default: **Kingdoms**)
  - Player Count (2, 3, or 4 players)
  - Play Mode (**Real-Time** or **Asynchronous**)
  - Visibility (**Public** or **Private** via 6-character invite code)
- **REQ-LOBBY-2**: Lobby Browser — List active public lobbies with real-time updates via Socket.IO (player join/leave, ready state).
- **REQ-LOBBY-3**: Player Ready State — All joined players must toggle " Ready\
