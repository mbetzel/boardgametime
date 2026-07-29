# Service Account for GitHub Actions deployment pipeline
resource "google_service_account" "github_actions_deployer" {
  account_id   = "igithub-actions-deployer"
  display_name = "GitHub Actions Deployer"
  description  = "Service account used by GitHub Actions CI/CD pipeline for building and deploying BoardGameTime"
}

# IAM Role bindings for GitHub Actions Service Account
resource "google_project_iam_member" "github_actions_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member = "serviceAccount:${google_service_account.github_actions_deployer.email}"
}

resource "google_project_iam_member" "github_actions_artifact_registry" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member = "serviceAccount:${google_service_account.github_actions_deployer.email}"
}

resource "google_project_iam_member" "github_actions_sa_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member = "serviceAccount:${google_service_account.github_actions_deployer.email}"
}

# Network Admin role required for CDN URL map cache invalidation (compute.urlMaps.invalidateCache)
resource "google_project_iam_member" "github_actions_network_admin" {
  project = var.project_id
  role    = "roles/compute.networkAdmin"
  member = "serviceAccount:${google_service_account.github_actions_deployer.email}"
}
