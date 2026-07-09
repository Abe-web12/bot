#!/bin/bash
# =============================================================================
# ForexBot — Database Backup Script
# =============================================================================
# Usage:
#   ./deploy/scripts/backup.sh                  # manual backup
#   ./deploy/scripts/backup.sh --restore <file>  # restore from backup
#   ./deploy/scripts/backup.sh --verify          # verify database integrity
#
# Can be run from cron for automated daily backups:
#   0 3 * * * /opt/forexbot/deploy/scripts/backup.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
DB_DIR="$PROJECT_DIR/forex_bot/database"
DB_FILE="$DB_DIR/forex_bot.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

# ---------------------------------------------------------------------------
# Backup
# ---------------------------------------------------------------------------
do_backup() {
    local backup_path="$BACKUP_DIR/forex_bot_$TIMESTAMP.db"

    echo "[$(date +%H:%M:%S)] Starting database backup..."

    # Try container first, then local
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q forexbot-backend; then
        docker exec forexbot-backend sh -c "
            if [ -f /app/database/forex_bot.db ]; then
                sqlite3 /app/database/forex_bot.db '.backup /tmp/backup_tmp.db'
                cat /tmp/backup_tmp.db
                rm -f /tmp/backup_tmp.db
            fi
        " > "$backup_path" 2>/dev/null

        # Verify
        if [ -s "$backup_path" ] && file "$backup_path" | grep -q SQLite; then
            echo "  Backup created: $backup_path ($(du -h "$backup_path" | cut -f1))"
        else
            echo "  WARNING: Container backup failed, falling back to file copy..."
            docker cp forexbot-backend:/app/database/forex_bot.db "$backup_path" 2>/dev/null || true
        fi
    fi

    # Fallback: direct file copy
    if [ ! -f "$backup_path" ] && [ -f "$DB_FILE" ]; then
        sqlite3 "$DB_FILE" ".backup $backup_path"
        echo "  Backup created (local): $backup_path ($(du -h "$backup_path" | cut -f1))"
    fi

    # Verify backup is valid
    if [ -f "$backup_path" ]; then
        if sqlite3 "$backup_path" "PRAGMA integrity_check;" 2>/dev/null | grep -q "^ok$"; then
            echo "  Integrity: OK"
        else
            echo "  WARNING: Backup integrity check FAILED!"
            rm -f "$backup_path"
            return 1
        fi
    else
        echo "  ERROR: No backup created!"
        return 1
    fi

    # Update symlink for rollback
    ln -sf "$backup_path" "$BACKUP_DIR/forex_bot_latest.db"

    # Cleanup old backups
    find "$BACKUP_DIR" -name "forex_bot_*.db" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    echo "  Old backups cleaned (retention: $RETENTION_DAYS days)"
    echo "[$(date +%H:%M:%S)] Backup complete."
}

# ---------------------------------------------------------------------------
# Restore
# ---------------------------------------------------------------------------
do_restore() {
    local restore_file="$1"

    if [ ! -f "$restore_file" ]; then
        echo "ERROR: Backup file not found: $restore_file"
        exit 1
    fi

    # Verify backup integrity
    if ! sqlite3 "$restore_file" "PRAGMA integrity_check;" 2>/dev/null | grep -q "^ok$"; then
        echo "ERROR: Backup file is corrupted or not a valid SQLite database."
        exit 1
    fi

    echo "Restoring from: $restore_file ($(du -h "$restore_file" | cut -f1))"

    # Backup current DB before restore (just in case)
    if [ -f "$DB_FILE" ]; then
        cp "$DB_FILE" "$BACKUP_DIR/forex_bot_pre_restore_$TIMESTAMP.db"
        echo "  Current database backed up to: $BACKUP_DIR/forex_bot_pre_restore_$TIMESTAMP.db"
    fi

    # Restore
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q forexbot-backend; then
        docker cp "$restore_file" forexbot-backend:/app/database/forex_bot.db
        docker restart forexbot-backend
        echo "  Database restored to container, container restarted."
    else
        sqlite3 "$DB_FILE" ".restore $restore_file" 2>/dev/null || \
            cp "$restore_file" "$DB_FILE"
        echo "  Database restored locally."
    fi

    echo "Restore complete."
}

# ---------------------------------------------------------------------------
# Verify
# ---------------------------------------------------------------------------
do_verify() {
    echo "Database Integrity Check"
    echo "========================"

    local sources=("$DB_FILE")
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q forexbot-backend; then
        sources+=("container:forexbot-backend")
    fi

    for src in "${sources[@]}"; do
        echo -n "Checking $src... "
        if [[ "$src" == container:* ]]; then
            local container_name="${src#container:}"
            if docker exec "$container_name" sqlite3 /app/database/forex_bot.db \
                "PRAGMA integrity_check;" 2>/dev/null | grep -q "^ok$"; then
                echo "OK"
            else
                echo "FAILED!"
            fi
        else
            if [ -f "$src" ]; then
                if sqlite3 "$src" "PRAGMA integrity_check;" 2>/dev/null | grep -q "^ok$"; then
                    echo "OK ($(du -h "$src" | cut -f1))"
                else
                    echo "FAILED!"
                fi
            else
                echo "Not found"
            fi
        fi
    done

    # Show backup count
    local count
    count=$(find "$BACKUP_DIR" -name "forex_bot_*.db" 2>/dev/null | wc -l)
    echo "Available backups: $count (in $BACKUP_DIR)"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
case "${1:-backup}" in
    backup)
        do_backup
        ;;
    --restore)
        if [ -z "${2:-}" ]; then
            echo "Usage: $0 --restore <backup_file>"
            echo "Available backups:"
            ls -lh "$BACKUP_DIR"/forex_bot_*.db 2>/dev/null || echo "  No backups found."
            exit 1
        fi
        do_restore "$2"
        ;;
    --verify)
        do_verify
        ;;
    *)
        echo "Usage: $0 [backup|--restore <file>|--verify]"
        exit 1
        ;;
esac
