# BoardGameTime Infrastructure & Deployment Guide

This directory contains the Infrastructure as Code (IaC) configuration managed via Terraform for provisioning and deploying the **BoardGameTime** platform to Google Cloud Platform (GCP).

---

## 🏗️ Architecture Overview

The BoardGameTime GCP infrastructure consists of the following components:

- **Google VPC Network (`boardgametime-vpc`)**: Custom Virtual Private Cloud network providing isolated networking for backend resources.
- **Private Service Access**: Private peering range (`10.0.0.0/16`) for internal communication between GCP services.
- **Serverless VPC Access Connector (`boardgametime-vpc-conn`)**: Subnet connector (`10.8.0.0/28`) enabling Cloud Run services to access private Cloud SQL and Redis instances.
- **Cloud SQL PostgreSQL 16 (`boardgametime-db`)**: Managed PostgreSQL 16 database instance provisioned with private IP only.
- **Cloud Memorystore Redis (`boardgametime-redis`)**: Managed Redis 7 instance for fast caching, session storage, and pub/sub.
- **Artifact Registry Repository (`boardgametime-repo`)**: Centralized Docker repository (`us-central1-docker.pkg.dev`) storing container images.
- **Cloud Run v2 Services**:
  - `boardgametime-api`: Production Fastify API server & Socket.IO websocket engine.
  - `boardgametime-web`: Production Next.js 14 web application frontend.

---

## 📋 Prerequisites

Before starting, ensure you have installed and configured:

1. **Google Cloud SDK (`gcloud`)**: Logged in and authorized for your target project.
2. **Terraform CLI** (v1.5.0 or higher).
3. **Docker Engine**: Installed and running locally.
4. **Active GCP Billing Account**: Linked to your GCP project.

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Authenticate and Configure GCP Project

Set your active project ID and authenticate with GCP CLI:

```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
```

Enable the necessary GCP Service APIs:

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  vpcaccess.googleapis.com \
  servicenetworking.googleapis.com \
  artifactregistry.googleapis.com \
  compute.googleapis.com
```

---

### Step 2: Provision Infrastructure using Terraform

1. Navigate to the Terraform configuration directory:
   ```bash
   cd infra/terraform
   ```

2. Initialize Terraform and install required providers (`hashicorp/google`):
   ```bash
   terraform init
   ```

3. Preview the infrastructure plan:
   ```bash
   terraform plan \
     -var="project_id=YOUR_GCP_PROJECT_ID" \
     -var="region=us-central1" \
     -var="db_password=YourSecurePassword123!"
   ```

4. Apply the configuration to provision all GCP resources:
   ```bash
   terraform apply \
     -var="project_id=YOUR_GCP_PROJECT_ID" \
     -var="region=us-central1" \
     -var="db_password=YourSecurePassword123!"
   ```

---

### Step 3: Build & Push Container Images to Artifact Registry

1. Authenticate Docker with your Artifact Registry region:
   ```bash
   gcloud auth configure-docker us-central1-docker.pkg.dev
   ```

2. Return to the monorepo root directory:
   ```bash
   cd ../..
   ```

3. Build and push the Fastify API Docker image:
   ```bash
   docker build -t us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/boardgametime-repo/api:latest -f apps/api/Dockerfile .
   docker push us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/boardgametime-repo/api:latest
   ```

4. Build and push the Next.js Web Docker image:
   ```bash
   docker build -t us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/boardgametime-repo/web:latest -f apps/web/Dockerfile .
   docker push us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/boardgametime-repo/web:latest
   ```

---

### Step 4: Verify Deployment and Retrieve Service Endpoints

Retrieve the provisioned Cloud Run URLs and connection endpoints using Terraform outputs:

```bash
cd infra/terraform
terraform output
```

Expected Outputs:
- `api_cloud_run_url`: `https://boardgametime-api-xxxxxx-uc.a.run.app`
- `web_cloud_run_url`: `https://boardgametime-web-xxxxxx-uc.a.run.app`
- `cloud_sql_connection_name`: `YOUR_GCP_PROJECT_ID:us-central1:boardgametime-db`
- `redis_host_ip`: `10.x.x.x`

Verify the API health endpoint:

```bash
curl $(terraform output -raw api_cloud_run_url)/health
```

Expected response:
```json
{"status":"ok","service":"boardgametime-api","timestamp":"..."}
```

---

## 🧹 Teardown & Clean-up

To destroy all provisioned GCP infrastructure and release resources:

```bash
cd infra/terraform
terraform destroy \
  -var="project_id=YOUR_GCP_PROJECT_ID" \
  -var="region=us-central1"
```
