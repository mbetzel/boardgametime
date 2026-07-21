resource "google_compute_network" "vpc_network" {
  name                    = "boardgametime-vpc"
  auto_create_subnetworks = true
}

# Global IP allocation for Private Service Access (Cloud SQL & Memorystore)
resource "google_compute_global_address" "private_ip_alloc" {
  name          = "boardgametime-private-ip-alloc"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc_network.id
}

# Private Service Access Connection
resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_alloc.name]
}

# Serverless VPC Access Connector for Cloud Run to access internal VPC resources
resource "google_vpc_access_connector" "connector" {
  name          = "boardgametime-vpc-conn"
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc_network.name

  min_instances = 2
  max_instances = 10
}
