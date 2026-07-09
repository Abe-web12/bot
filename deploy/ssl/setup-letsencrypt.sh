#!/bin/bash
# =============================================================================
# ForexBot — Let's Encrypt SSL Setup
# =============================================================================
# Usage: ./deploy/ssl/setup-letsencrypt.sh [domain] [email]
#
# Prerequisites:
#   - Docker Compose running with nginx on ports 80/443
#   - DNS A record pointing to this server's IP
# =============================================================================

set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 bot.example.com admin@example.com"
    exit 1
fi

echo "=== ForexBot SSL Setup ==="
echo "Domain: $DOMAIN"
echo "Email:  $EMAIL"
echo ""

# Step 1: Ensure nginx is running
echo "[1/5] Checking nginx..."
if ! docker ps --format '{{.Names}}' | grep -q forexbot-nginx; then
    echo "ERROR: Nginx container 'forexbot-nginx' is not running."
    echo "Start with: docker compose -f deploy/docker/docker-compose.yml -f deploy/docker/docker-compose.prod.yml up -d nginx"
    exit 1
fi
echo "  Nginx is running."

# Step 2: Request initial certificate
echo "[2/5] Requesting Let's Encrypt certificate..."
docker compose -f deploy/docker/docker-compose.yml -f deploy/docker/docker-compose.prod.yml run --rm certbot sh -c "
    certbot certonly --webroot -w /var/www/certbot \
        --email $EMAIL \
        -d $DOMAIN \
        --non-interactive --agree-tos \
        --keep-until-expiring
"
echo "  Certificate obtained."

# Step 3: Reload nginx to pick up new certs
echo "[3/5] Reloading nginx..."
docker exec forexbot-nginx nginx -s reload
echo "  Nginx reloaded."

# Step 4: Test HTTPS
echo "[4/5] Testing HTTPS..."
curl -sfI "https://$DOMAIN/health" > /dev/null 2>&1 && echo "  HTTPS OK." || echo "  WARNING: HTTPS test failed. Check nginx logs."

# Step 5: Set up auto-renewal (runs daily via certbot container)
echo "[5/5] Auto-renewal configuration:"
echo "  The certbot container in docker-compose.prod.yml runs renewal"
echo "  every 12 hours automatically."
echo "  To test renewal:"
echo "    docker compose -f deploy/docker/docker-compose.yml -f deploy/docker/docker-compose.prod.yml run --rm certbot renew --dry-run"
echo ""

echo "=== SSL Setup Complete ==="
echo "Your site should now be available at: https://$DOMAIN"
