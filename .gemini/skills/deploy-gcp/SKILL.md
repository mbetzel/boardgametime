---
name: deploy-gcp
description: Workflow and instructions for building, pushing, and deploying BoardGameTime container images to Google Cloud Platform (GCP) Cloud Run via Terraform and Artifact Registry.
---

# Deploy BoardGameTime to Google Cloud Platform (GCP)

This skill provides step-by-step guidance and automation rules for building, pushing, and deploying the BoardGameTime monorepo services (`@boardgametime/api` and `@boardgametime/web`) to Google Cloud Platform (GCP).

---

## 1. Prerequisites & Environment Setup

- **WSL Directive**: All terminal commands MUST be executed inside WSL using:
  ```bash
  wsl -d Ubuntu --cd /home/mike/github/boardgametime /usr/bin/env PATH=/home/mike/.nvm/versions/node/v26.5.0/bin:/usr/local/bin:/usr/bin:/bin:$PATH <command>
  ```
- **GCP Project ID**: `boardgametime-app`
- **GCP Region**: `us-central1`
- **Artifact Registry Repository**: `us-central1-docker.pkg.dev/boardgametime-app/boardgametime-repo`

---

## 2. Step-by-Step Deployment Workflow

### Step 1: Docker Authentication
Authenticate local Docker daemon with GCP Artifact Registry:
```bash
wsl -d Ubuntu --cd /home/mike/github/boardgametime /usr/bin/env PATH=/home/mike/.nvm/versions/node/v26.5.0/bin:/usr/local/bin:/usr/bin:/bin:$PATH gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
```

### Step 2: Build & Push Container Images

#### Fastify API Service
```bash
wsl -d Ubuntu --cd /home/mike/github/boardgametime /usr/bin/env PATH=/home/mike/.nvm/versions/node/v26.5.0/bin:/usr/local/bin:/usr/bin:/bin:$PATH docker build -t us-central1-docker.pkg.dev/boardgametime-app/boardgametime-repo/api:latest -f apps/api/Dockerfile .

wsl -d Ubuntu --cd /home/mike/github/boardgametime /usr/bin/env PATH=/home/mike/.nvm/versions/node/v26.5.0/bin:/usr/local/bin:/usr/bin:/bin:$PATH docker push us-central1-docker.pkg.dev/boardgametime-app/boardgametime-repo/api:latest
```

#### Next.js Web Frontend Service
```bash
wsl -d Ubuntu --cd /home/mike/github/boardgametime /usr/bin/env PATH=/home/mike/.nvm/versions/node/v26.5.0/bin:/usr/local/bin:/usr/bin:/bin:$PATH docker build -t us-central1-docker.pkg.dev/boardgametime-app/boardgametime-repo/web:latest --build-arg NEXT_PUBLIC_API_URL=https://boardgameti.me -f apps/web/Dockerfile .

wsl -d Ubuntu --cd /home/mike/github/boardgametime /usr/bin/env PATH=/home/mike/.nvm/versions/node/v26.5.0/bin:/usr/local/bin:/usr/bin:/bin:$PATH docker push us-central1-docker.pkg.dev/boardgametime-app/boardgametime-repo/web:latest
```

---

### Step 3: Apply Infrastructure via Terraform

Pass the OAuth access token (`GOOGLE_OAUTH_ACCESS_TOKEN`) when running `terraform apply`:
```bash
wsl -d Ubuntu --cd /home/mike/github/boardgametime/infra/terraform /usr/bin/env PATH=/home/mike/.nvm/versions/node/v26.5.0/bin:/usr/local/bin:/usr/bin:/bin:$PATH /bin/bash -c 'export GOOGLE_OAUTH_ACCESS_TOKEN=$(/usr/bin/gcloud auth print-access-token); terraform apply -auto-approve'
```

---

## 3. Deployment Verification & Health Checks

Verify Cloud Run service URLs and health checks:

1. **Get Service URLs**:
   ```bash
   wsl -d Ubuntu --cd /home/mike/github/boardgametime /usr/bin/env PATH=/home/mike/.nvm/versions/node/v26.5.0/bin:/usr/local/bin:/usr/bin:/bin:$PATH gcloud run services list --project=boardgametime-app --region=us-central1
   ```

2. **Verify API Health Endpoint**:
   ```bash
   wsl -d Ubuntu --cd /home/mike/github/boardgametime /usr/bin/env PATH=/home/mike/.nvm/versions/node/v26.5.0/bin:/usr/local/bin:/usr/bin:/bin:$PATH curl -s https://boardgametime-api-841295688410.us-central1.run.app/health
   ```
   *Expected Output*: `{"status":"ok","service":"boardgametime-api","timestamp":"..."}`

3. **Verify Web Frontend Status**:
   ```bash
   wsl -d Ubuntu --cd /home/mike/github/boardgametime /usr/bin/env PATH=/home/mike/.nvm/versions/node/v26.5.0/bin:/usr/local/bin:/usr/bin:/bin:$PATH curl -I -s https://boardgametime-web-841295688410.us-central1.run.app
   ```
   *Expected Output*: `HTTP/2 200`
