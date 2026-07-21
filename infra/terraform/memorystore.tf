resource "google_redis_instance" "redis" {
  name               = "boardgametime-redis"
  tier               = "BASIC"
  memory_size_gb     = 1
  region             = var.region
  authorized_network = google_compute_network.vpc_network.id
  redis_version      = "REDIS_7_0"

  depends_on = [google_service_networking_connection.private_vpc_connection]
}
