resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = "boardgametime-repo"
  description   = "Docker repository for BoardGameTime applications (API & Web)"
  format        = "DOCKER"
}
