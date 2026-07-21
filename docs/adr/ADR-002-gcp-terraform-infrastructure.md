# ADR-002: GCP Hosting Infrastructure Provisioned via Terraform

- **Status**: Approved
- **Date**: 2026-07-21
- **Deciders**: Engineering Lead & Product Owner

---

## Context and Problem Statement

The platform requires production deployment on Google Cloud Platform (GCP) with managed relational database persistence, fast caching/session state, persistent WebSockets, and automated Infrastructure-as-Code (IaC).

## Decision Drivers

- Reproducible infrastructure managed via git.
- Region lock: us-central1.
- Fully managed serverless compute and managed database offerings.
- Scalable real-time WebSocket support.

## Decision Outcome

Chosen Option: **GCP Managed Services provisioned via Terraform (infra/terraform/)**.

### Infrastructure Map

| Component | Service Target | Purpose |
|---|---|---|
| **Cloud Region** | us-central1 | Primary deployment region |
| **IaC Provisioner** | Terraform | Manage GCS, Cloud Run, Cloud SQL, Memorystore |
| **Front End Hosting** | GCP Cloud Run (pps/web) | Next.js 14 container execution |
| **API Server Hosting** | GCP Cloud Run (pps/api) | Fastify REST API & Socket.IO server |
| **Database** | GCP Cloud SQL for PostgreSQL 16 | Relational data, user accounts, match state snapshots |
| **Cache & Pub/Sub** | GCP Cloud Memorystore for Redis | Socket.IO scaling adapter and session store |
| **Asset Storage** | GCP Cloud Storage (GCS) | Game assets, avatars, static media |

### Consequences

- **Positive**: 100% cloud resources defined declaratively in infra/terraform.
- **Positive**: Cloud Run automatically scales containers based on incoming web and socket traffic.
- **Negative**: Cloud Run WebSocket connections require session affinity enabled in Terraform settings.
