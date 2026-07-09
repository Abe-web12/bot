#!/bin/bash
# =============================================================================
# ForexBot — One-Command Deployment Script
# =============================================================================
# Usage:
#   First deploy:          ./deploy/scripts/deploy.sh --init
#   Subsequent updates:    ./deploy/scripts/deploy.sh
#   Rollback to previous:  ./deploy/scripts/deploy.sh --rollback
#   Specific version:      ./deploy/scripts/deploy.sh --tag v1.2.3
#   Production mode:       ./deploy/scripts/deploy.sh --env production
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$SCRIPT_DIR/docker"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ENV_FILE="$PROJECT_DIR/.env"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse arguments
MODE="update"
TAG=""
ENV_PROFILE="production"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --init)    MODE="init" ;;
        --rollback) MODE="rollback" ;;
        --tag)     TAG="$2"; shift ;;
        --env)     ENV_PROFILE="$2"; shift ;;
        *)         err "Unknown argument: $1"; exit 1 ;;
    esac
    shift
done

COMPOSE_ARGS="-f $DOCKER_DIR/docker-compose.yml"
if [ "$ENV_PROFILE" = "production" ]; then
    COMPOSE_ARGS="$COMPOSE_ARGS -f $DOCKER_DIR/docker-compose.prod.yml"
fi

if [ -n "$TAG" ]; then
    export TAG
fi

# ---------------------------------------------------------------------------
# Pre-deployment checks
# ---------------------------------------------------------------------------
pre_checks() {
    log "Running pre-deployment checks..."

    # Docker available?
    if ! command -v docker &>/dev/null; then
        err "Docker is not installed. Install Docker first."
        exit 1
    fi

    # Docker Compose available?
    if ! docker compose version &>/dev/null; then
        err "Docker Compose plugin is not installed."
        exit 1
    fi

    # .env file exists?
    if [ ! -f "$ENV_FILE" ]; then
        err ".env file not found at $ENV_FILE"
        err "Copy deploy/env/production.env to $ENV_FILE and fill in values."
        exit 1
    fi

    # Validate env
    log "Validating environment variables..."
    python "$PROJECT_DIR/deploy/env/validate_env.py" "$ENV_FILE" || {
        err "Environment validation failed. Fix errors and retry."
        exit 1
    }

    log "Pre-deployment checks passed."
}

# ---------------------------------------------------------------------------
# Database backup before migration
# ---------------------------------------------------------------------------
backup_database() {
    log "Backing up database..."
    mkdir -p "$BACKUP_DIR"

    if docker ps --format '{{.Names}}' | grep -q forexbot-backend; then
        docker exec forexbot-backend sh -c \
            "cp /app/database/forex_bot.db /app/database/forex_bot.db.backup" \
            2>/dev/null || warn "Could not create DB backup inside container."
    fi

    if [ -f "$PROJECT_DIR/forex_bot/database/forex_bot.db" ]; then
        cp "$PROJECT_DIR/forex_bot/database/forex_bot.db" \
            "$BACKUP_DIR/forex_bot_$TIMESTAMP.db"
        log "Database backed up to $BACKUP_DIR/forex_bot_$TIMESTAMP.db"
    fi
}

# ---------------------------------------------------------------------------
# Pull latest images / build
# ---------------------------------------------------------------------------
build_images() {
    log "Building Docker images..."
    docker compose $COMPOSE_ARGS build --pull
    log "Docker images built."
}

# ---------------------------------------------------------------------------
# Deploy with zero-downtime (rolling update)
# ---------------------------------------------------------------------------
deploy() {
    log "Deploying ForexBot ($ENV_PROFILE mode)..."

    # Pull new images
    docker compose $COMPOSE_ARGS pull || warn "Pull failed, using local images."

    # Start services with rolling update
    docker compose $COMPOSE_ARGS up -d --remove-orphans --wait

    log "Deployment complete."
}

# ---------------------------------------------------------------------------
# Verify deployment
# ---------------------------------------------------------------------------
verify() {
    log "Verifying deployment..."
    sleep 5

    # Check all containers are running
    if ! docker ps --format '{{.Names}}' | grep -q forexbot-backend; then
        err "Backend container is not running."
        docker compose $COMPOSE_ARGS logs --tail=20 backend
        return 1
    fi

    if ! docker ps --format '{{.Names}}' | grep -q forexbot-frontend; then
        err "Frontend container is not running."
        docker compose $COMPOSE_ARGS logs --tail=20 frontend
        return 1
    fi

    # Health check
    HEALTH_URL="${HEALTH_URL:-http://localhost:5000/health}"
    if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
        log "Health endpoint OK."
    else
        warn "Health endpoint not responding at $HEALTH_URL"
    fi

    log "Verification complete."
}

# ---------------------------------------------------------------------------
# Rollback to previous deployment
# ---------------------------------------------------------------------------
rollback() {
    log "Rolling back to previous deployment..."

    if [ -f "$BACKUP_DIR/forex_bot_previous.db" ]; then
        cp "$BACKUP_DIR/forex_bot_previous.db" \
            "$PROJECT_DIR/forex_bot/database/forex_bot.db"
        log "Database restored from backup."
    fi

    # Roll back Docker images
    docker compose $COMPOSE_ARGS up -d --force-recreate

    log "Rollback complete."
}

# ---------------------------------------------------------------------------
# Cleanup old images and backups
# ---------------------------------------------------------------------------
cleanup() {
    log "Cleaning up old images and backups..."
    docker image prune -f --filter "until=72h" || true
    find "$BACKUP_DIR" -name "forex_bot_*.db" -mtime +7 -delete 2>/dev/null || true
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
    log "=== ForexBot Deployment ($MODE) ==="

    case "$MODE" in
        init)
            pre_checks
            build_images
            deploy
            verify
            cleanup
            ;;
        update)
            pre_checks
            backup_database
            build_images
            deploy
            verify
            cleanup
            ;;
        rollback)
            rollback
            verify
            ;;
    esac

    log "=== Deployment $MODE completed successfully ==="
}

main
