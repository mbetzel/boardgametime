resource "google_sql_database_instance" "postgres" {
  name             = "boardgametime-db"
  database_version = "POSTGRES_16"
  region           = var.region

  deletion_protection = false

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.vpc_network.id
      enable_private_path_for_google_cloud_services = true
    }
  }

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

resource "google_sql_database" "database" {
  name     = "boardgametime"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "db_user" {
  name     = "boardgametime_user"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}
