# ADR-005: Authentication Strategy using NextAuth.js v5 (Auth.js)

- **Status**: Approved
- **Date**: 2026-07-21
- **Deciders**: Engineering Lead & Product Owner

---

## Context and Problem Statement

The platform requires secure authentication supporting both traditional Username/Password credentials and Google OAuth 2.0.

## Decision Drivers

- First-class integration with Next.js 14 App Router.
- Sharing authentication state with Fastify API and Socket.IO servers.
- Secure password hashing.

## Decision Outcome

Chosen Option: **NextAuth.js v5 (Auth.js) with Prisma Adapter**.

### Integration Details

1. **Providers**:
   - **Credentials Provider**: Local username/email + password auth using bcrypt for hashing.
   - **Google Provider**: OAuth 2.0 sign-in via Google accounts.
2. **Session Strategy**: **JWT (JSON Web Tokens)**.
   - NextAuth signs JWTs using a shared AUTH_SECRET.
   - Fastify API server (apps/api) verifies these JWT tokens directly from authorization headers (Bearer <token>).
3. **Database Integration**: Prisma Adapter stores users, accounts, sessions in PostgreSQL.

### Consequences

- **Positive**: Single auth system handles both web UI routes and backend API requests seamless.
- **Positive**: Easy configuration for Google OAuth.
