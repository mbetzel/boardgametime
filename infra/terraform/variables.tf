variable "gcp_project_id" {
  type        = string
  description = "GCP Project ID"
  default     = "boardgametime-dev"
}

variable "gcp_region" {
  type        = string
  description = "GCP Deployment Region"
  default     = "us-central1"
}

variable "api_container_image" {
  type        = string
  description = "Docker image for boardgametime API server"
  default     = "gcr.io/boardgametime-dev/api:latest"
}
