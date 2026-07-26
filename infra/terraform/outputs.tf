output "api_cloud_run_url" {
  description = "URL of the deployed Fastify API Cloud Run v2 service"
  value       = google_cloud_run_v2_service.api_service.uri
}

output "web_cloud_run_url" {
  description = "URL of the deployed Next.js Web Cloud Run v2 service"
  value       = google_cloud_run_v2_service.web_service.uri
}

output "cloud_sql_connection_name" {
  description = "Connection name of the Cloud SQL PostgreSQL instance"
  value       = google_sql_database_instance.postgres.connection_name
}

output "redis_host_ip" {
  description = "Host IP address of the Cloud Memorystore Redis instance"
  value       = google_redis_instance.redis.host
}

output "cdn_ip_address" {
  description = "Global IP address of the Cloud CDN External Load Balancer"
  value       = google_compute_global_address.cdn_ip.address
}

output "cdn_web_url" {
  description = "HTTP entry point URL for the Cloud CDN Load Balancer"
  value       = "http://${google_compute_global_address.cdn_ip.address}"
}

