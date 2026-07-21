# Fastify API Cloud Run v2 Service
resource "google_cloud_run_v2_service" "api_service" {
  name     = "boardgametime-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }

    containers {
      image = var.api_container_image

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "3000"
      }
      env {
        name  = "DATABASE_URL"
        value = "postgresql://${google_sql_user.db_user.name}:${var.db_password}@${google_sql_database_instance.postgres.private_ip_address}:5432/${google_sql_database.database.name}"
      }
      env {
        name  = "REDIS_HOST"
        value = google_redis_instance.redis.host
      }
      env {
        name  = "REDIS_PORT"
        value = "6379"
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
    }
  }
}

# Next.js Web Cloud Run v2 Service
resource "google_cloud_run_v2_service" "web_service" {
  name     = "boardgametime-web"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }

    containers {
      image = var.web_container_image

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "3000"
      }
      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = google_cloud_run_v2_service.api_service.uri
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
    }
  }
}

# IAM Member for public access to API service
resource "google_cloud_run_v2_service_iam_member" "api_noauth" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.api_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# IAM Member for public access to Web service
resource "google_cloud_run_v2_service_iam_member" "web_noauth" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.web_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
