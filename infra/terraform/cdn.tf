# Serverless Network Endpoint Group (NEG) for Next.js Web Cloud Run Service
resource "google_compute_region_network_endpoint_group" "web_neg" {
  name                  = "boardgametime-web-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_v2_service.web_service.name
  }
}

# Backend Service with Cloud CDN Enabled
resource "google_compute_backend_service" "web_cdn_backend" {
  name                  = "boardgametime-web-cdn-backend"
  protocol              = "HTTPS"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  enable_cdn            = true

  backend {
    group = google_compute_region_network_endpoint_group.web_neg.id
  }

  cdn_policy {
    cache_mode  = "CACHE_ALL_STATIC"
    default_ttl = 3600
    max_ttl     = 31536000
    client_ttl  = 3600

    negative_caching = true

    cache_key_policy {
      include_host         = true
      include_protocol     = true
      include_query_string = true
    }
  }
}

# Global URL Map routing traffic to the CDN Backend Service
resource "google_compute_url_map" "web_cdn_url_map" {
  name            = "boardgametime-web-cdn-urlmap"
  default_service = google_compute_backend_service.web_cdn_backend.id
}

# Global External Static IP Address for CDN / Load Balancer
resource "google_compute_global_address" "cdn_ip" {
  name = "boardgametime-web-cdn-ip"
}

# Target HTTP Proxy
resource "google_compute_target_http_proxy" "web_cdn_http_proxy" {
  name    = "boardgametime-web-cdn-http-proxy"
  url_map = google_compute_url_map.web_cdn_url_map.id
}

# Global Forwarding Rule
resource "google_compute_global_forwarding_rule" "web_cdn_forwarding_rule" {
  name                  = "boardgametime-web-cdn-forwarding-rule"
  ip_protocol           = "TCP"
  port_range            = "80"
  target                = google_compute_target_http_proxy.web_cdn_http_proxy.id
  ip_address            = google_compute_global_address.cdn_ip.id
  load_balancing_scheme = "EXTERNAL_MANAGED"
}
