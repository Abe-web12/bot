# ForexBot — Disaster Recovery Guide

## Recovery Scenarios

### 1. Complete Server Failure

```bash
# On a new VPS:
git clone <repo> /opt/forexbot
cd /opt/forexbot
cp deploy/env/production.env .env
# Edit .env with SAME values as before
python deploy/env/validate_env.py

# Restore database from latest backup
scp user@old-server:/opt/forexbot/backups/forex_bot_latest.db \
    /opt/forexbot/forex_bot/database/forex_bot.db

# Deploy
bash deploy/scripts/deploy.sh --init --env production
```

### 2. Database Corruption

```bash
# 1. Stop the bot
docker compose -f deploy/docker/docker-compose.yml down

# 2. Verify corruption
sqlite3 /opt/forexbot/forex_bot/database/forex_bot.db \
    "PRAGMA integrity_check;"

# 3. Restore from backup
bash deploy/scripts/backup.sh --restore \
    /opt/forexbot/backups/forex_bot_latest.db

# 4. Restart
bash deploy/scripts/deploy.sh
```

### 3. Container Crash Loop

```bash
# 1. Check logs
docker compose -f deploy/docker/docker-compose.yml logs --tail=50 backend

# 2. Force recreate
docker compose -f deploy/docker/docker-compose.yml up -d --force-recreate

# 3. If still failing, roll back
bash deploy/scripts/deploy.sh --rollback
```

### 4. SSL Certificate Expiry

```bash
# Manual renewal
docker compose -f deploy/docker/docker-compose.yml \
    -f deploy/docker/docker-compose.prod.yml run --rm certbot renew

# Reload nginx
docker exec forexbot-nginx nginx -s reload
```

### 5. Full Data Loss

```bash
# 1. Restore database from oldest available backup
bash deploy/scripts/backup.sh --restore \
    /opt/forexbot/backups/forex_bot_20250101_120000.db

# 2. Redeploy
bash deploy/scripts/deploy.sh --init --env production

# 3. Verify trade history and account balance
curl http://localhost:5000/api/account
curl http://localhost:5000/api/trades?page=1\&page_size=10
```

## Preventive Measures

1. **Daily automated backups** via cron (see deploy/scripts/backup.sh)
2. **Pre-deployment backups** (automatic in deploy.sh)
3. **Health monitoring** with Prometheus + Grafana
4. **Telegram alerts** for critical failures
5. **Systemd auto-restart** on crash
6. **Resource limits** in Docker Compose (prevent OOM)
7. **Log rotation** (prevents disk full)
8. **Multiple backup retention** (7 days)
