#!/bin/bash
# =============================================================================
# ForexBot — Telegram Alert Script
# =============================================================================
# Sends alert messages to Telegram. Called by systemd timers, cron, or
# monitoring systems (Prometheus Alertmanager, health checks).
#
# Usage:
#   ./deploy/scripts/telegram_alert.sh "CRITICAL" "Bot is down!"
#   ./deploy/scripts/telegram_alert.sh "WARNING" "High memory usage: 92%"
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment variables
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

TOKEN="${TELEGRAM_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"
SEVERITY="${1:-INFO}"
MESSAGE="${2:-No message}"

if [ -z "$TOKEN" ] || [ -z "$CHAT_ID" ]; then
    echo "TELEGRAM_TOKEN or TELEGRAM_CHAT_ID not set. Skipping alert."
    exit 0
fi

# Emoji based on severity
case "$SEVERITY" in
    CRITICAL) EMOJI="🚨" ;;
    ERROR)    EMOJI="❌" ;;
    WARNING)  EMOJI="⚠️" ;;
    INFO)     EMOJI="ℹ️" ;;
    *)        EMOJI="📢" ;;
esac

HOSTNAME=$(hostname -s 2>/dev/null || echo "unknown")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S UTC')

TEXT="$EMOJI *[$SEVERITY] ForexBot Alert*
*Host:* $HOSTNAME
*Time:* $TIMESTAMP
*Message:* $MESSAGE"

# Escape markdown special characters
TEXT=$(echo "$TEXT" | sed 's/[-]/\\-/g; s/\./\\./g')

curl -s -X POST "https://api.telegram.org/bot$TOKEN/sendMessage" \
    -d "chat_id=$CHAT_ID" \
    -d "text=$TEXT" \
    -d "parse_mode=Markdown" \
    -d "disable_web_page_preview=true" \
    -o /dev/null -w "%{http_code}" 2>/dev/null || echo "0"
