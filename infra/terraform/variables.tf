variable "project_id" {
  type        = string
  description = "GCP Project ID"
  default     = "boardgametime-dev"
}

variable "gcp_project_id" {
  type        = string
  description = "GCP Project ID (alias for project_id)"
  default     = "boardgametime-dev"
}

variable "region" {
  type        = string
  description = "GCP Deployment Region"
  default     = "us-central1"
}

variable "gcp_region" {
  type        = string
  description = "GCP Deployment Region (alias for region)"
  default     = "us-central1"
}

variable "db_password" {
  type        = string
  description = "Password for Cloud SQL PostgreSQL user"
  sensitive   = true
  default     = "SuperSecretDBPassword123!"
}

variable "api_container_image" {
  type        = string
  description = "Docker image for boardgametime Fastify API server"
  default     = "us-central1-docker.pkg.dev/boardgametime-dev/boardgametime-repo/api:latest"
}

variable "web_container_image" {
  type        = string
  description = "Docker image for boardgametime Next.js web application"
  default     = "us-central1-docker.pkg.dev/boardgametime-dev/boardgametime-repo/web:latest"
}
