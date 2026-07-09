#!/bin/bash
# =============================================================================
# ForexBot — Auto-Recovery Script
# =============================================================================
# This script is called by systemd or cron to automatically recover from
# common failure modes:
#   - Container crash          -> restart container
#   - MT5 disconnect           -> reconnect (handled by bot internally)
#   - WebSocket failure        -> restart API server
#   - Telegram service failure -> restart bot
#   - Database corruption      -> restore from backup
#   - Disk full                -> rotate logs + clean backups
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$SCRIPT_DIR/docker"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$PROJECT_DIR/forex_bot/logs/recovery.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ---------------------------------------------------------------------------
# Check and restart failed containers
# ---------------------------------------------------------------------------
check_containers() {
    local restarted=0

    for container in forexbot-backend forexbot-frontend forexbot-nginx; do
        if docker ps --filter "name=$container" --filter "status=exited" --format "{{.Names}}" | grep -q "$container"; then
            log "RESTARTING failed container: $container"
            docker compose -f "$DOCKER_DIR/docker-compose.yml" -f "$DOCKER_DIR/docker-compose.prod.yml" up -d --no-deps "$container"
            restarted=$((restarted + 1))
        fi

        # Check health status
        local health
        health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "none")
        if [ "$health" = "unhealthy" ]; then
            log "RESTARTING unhealthy container: $container (health: $health)"
            docker compose -f "$DOCKER_DIR/docker-compose.yml" -f "$DOCKER_DIR/docker-compose.prod.yml" up -d --no-deps "$container"
            restarted=$((restarted + 1))
        fi
    done

    if [ $restarted -gt 0 ]; then
        log "Recovery: $restarted container(s) restarted."
    fi
    return $restarted
}

# ---------------------------------------------------------------------------
# Health endpoint check
# ---------------------------------------------------------------------------
check_health() {
    local url="${1:-http://localhost:5000/health}"
    if ! curl -sf "$url" > /dev/null 2>&1; then
        log "WARNING: Health endpoint not responding at $url"
        return 1
    fi
    return 0
}

# ---------------------------------------------------------------------------
# Check disk usage
# ---------------------------------------------------------------------------
check_disk() {
    local threshold=90
    local usage
    usage=$(df / | awk 'NR==2 {print $5}' | tr -d '%')

    if [ "$usage" -gt "$threshold" ]; then
        log "WARNING: Disk usage at ${usage}% (threshold: ${threshold}%)"

        # Rotate Docker logs
        log "Pruning Docker logs..."
        docker system prune -f --volumes 2>/dev/null || true
        find "$PROJECT_DIR/forex_bot/logs" -name "*.log.*" -mtime +2 -delete 2>/dev/null || true
        find "$BACKUP_DIR" -name "forex_bot_*.db" -mtime +14 -delete 2>/dev/null || true
        log "Logs and old backups cleaned."
    fi
}

# ---------------------------------------------------------------------------
# Check database integrity
# ---------------------------------------------------------------------------
check_database() {
    local db_file="$PROJECT_DIR/forex_bot/database/forex_bot.db"

    if [ ! -f "$db_file" ]; then
        log "Database file not found: $db_file"
        return 1
    fi

    if ! sqlite3 "$db_file" "PRAGMA integrity_check;" 2>/dev/null | grep -q "^ok$"; then
        log "CRITICAL: Database integrity check FAILED!"

        # Attempt recovery from latest backup
        local latest="$BACKUP_DIR/forex_bot_latest.db"
        if [ -f "$latest" ]; then
            log "Restoring from latest backup: $latest"
            cp "$latest" "$db_file"
            log "Database restored from backup."
        else
            log "No backup available for restore."
            return 1
        fi
    fi
    return 0
}

# ---------------------------------------------------------------------------
# Main recovery routine
# ---------------------------------------------------------------------------
main() {
    log "=== Auto-Recovery Check ==="

    check_disk
    check_containers
    check_database

    # Alert if health check fails
    if ! check_health; then
        log "ALERT: Health check failed after recovery attempt."
        # Telegram alert would be triggered by the health check failure
        # via the existing alerting mechanism in the bot.
        return 1
    fi

    log "=== Auto-Recovery Complete ==="
}

main
