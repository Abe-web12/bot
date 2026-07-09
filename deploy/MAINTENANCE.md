# ForexBot — Maintenance Guide

## Routine Tasks

### Daily

- Check Telegram alerts (automatic)
- Verify bot is running: `docker ps | grep forexbot`
- Check last trade time in dashboard

### Weekly

- Review logs for errors:
  ```bash
  docker compose -f deploy/docker/docker-compose.yml logs --tail=50 backend
  ```
- Check disk usage: `df -h`
- Verify database integrity:
  ```bash
  bash deploy/scripts/backup.sh --verify
  ```

### Monthly

- Update SSL certificates (auto-renewed, but verify):
  ```bash
  docker exec forexbot-nginx nginx -t && echo "Config OK"
  ```
- Review Prometheus/Grafana metrics for trends
- Clean old Docker images:
  ```bash
  docker image prune -f --filter "until=720h"
  ```
- Review backup size and retention

### Quarterly

- Full security audit
- Rotate all secrets in `.env`
- Review/update dependencies:
  ```bash
  # Backend
  cd forex_bot
  pip install --upgrade -r requirements.txt
  
  # Frontend
  cd dashboard
  npm update
  ```
- Test disaster recovery procedure

## Upgrade Procedure

```bash
# 1. Backup
bash deploy/scripts/backup.sh

# 2. Pull latest code
git pull origin main

# 3. Deploy
bash deploy/scripts/deploy.sh --env production

# 4. Verify
curl http://localhost:5000/health
curl http://localhost:3000/
```

## Rollback Procedure

```bash
# Option 1: Git rollback
git log --oneline -5
git checkout <previous-tag>
bash deploy/scripts/deploy.sh --env production

# Option 2: Automated rollback
bash deploy/scripts/deploy.sh --rollback
```

## Log Management

### Access logs
- Nginx access logs: JSON format, rotated by size
- Application logs: `forex_bot/logs/bot.json.log` (structured JSON)
- Error logs: `forex_bot/logs/errors.log` (errors only)

### Log rotation configuration
- Nginx: built-in Docker json-file driver (10MB max, 5 files)
- Application: Python RotatingFileHandler (10MB max, 5 backups)
- Docker: json-file driver (10MB max, 5 files)

### Viewing logs
```bash
# Docker compose logs
docker compose logs -f --tail=100 backend

# Application JSON logs
tail -f forex_bot/logs/bot.json.log | python -m json.tool

# Errors only
tail -f forex_bot/logs/errors.log

# Nginx access
docker exec forexbot-nginx tail -f /var/log/nginx/access.log
```

## Database Maintenance

### Vacuum (reclaim space)
```bash
docker exec forexbot-backend sqlite3 /app/database/forex_bot.db "VACUUM;"
```

### Integrity check
```bash
bash deploy/scripts/backup.sh --verify
```

### Manual backup
```bash
bash deploy/scripts/backup.sh
```

## Performance Tuning

### Backend
- `BOT_LOOP_INTERVAL`: Increase to 120s if CPU is high
- Worker threads: Monitor with `useWorkersStatus()` hook

### Frontend
- Static assets are cached by Nginx for 365 days
- Next.js `output: "standalone"` for optimal bundle
- Lazy loading built into dashboard pages

### Database
- SQLite: Run `VACUUM` monthly to reclaim space
- Monitor query performance via API latency metrics
