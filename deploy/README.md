# ForexBot — Production Deployment Guide

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Internet                           │
└────────────────────┬────────────────────────────────┘
                     │
               ┌─────▼──────┐
               │   Nginx     │  (443 HTTPS / 80 HTTP → redirect)
               │  (Reverse   │
               │   Proxy)    │
               └─────┬──────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
    ┌─────▼────┐ ┌──▼───┐ ┌───▼──────┐
    │  Backend  │ │Front.│ │ WebSocket│
    │ Flask+Bot │ │Next. │ │   /ws    │
    │ :5000     │ │:3000 │ │ (live)   │
    └─────┬────┘ └──────┘ └──────────┘
          │
    ┌─────▼─────┐
    │  SQLite   │
    │  / PG DB  │
    └───────────┘
```

## Quick Start (Production)

```bash
# 1. Clone on VPS
git clone <repo> /opt/forexbot
cd /opt/forexbot

# 2. Configure environment
cp deploy/env/production.env .env
# Edit .env with your values

# 3. Validate environment
python deploy/env/validate_env.py

# 4. Deploy
bash deploy/scripts/deploy.sh --init --env production

# 5. Set up SSL
bash deploy/ssl/setup-letsencrypt.sh bot.yourdomain.com admin@yourdomain.com
```

## Directory Structure

```
deploy/
├── docker/
│   ├── Dockerfile.backend        # Backend container build
│   ├── Dockerfile.frontend       # Frontend container build
│   ├── docker-compose.yml        # Base compose (dev)
│   └── docker-compose.prod.yml   # Production override
├── nginx/
│   ├── nginx.conf                # Main nginx config
│   ├── security-headers.conf     # Security headers fragment
│   └── rate-limit.conf           # Rate limiting config
├── ssl/
│   └── setup-letsencrypt.sh      # SSL certificate setup
├── scripts/
│   ├── deploy.sh                 # One-command deployment
│   ├── backup.sh                 # Database backup/restore
│   ├── recovery.sh               # Auto-recovery script
│   └── telegram_alert.sh         # Telegram alert sender
├── env/
│   ├── production.env            # Production env template
│   ├── staging.env               # Staging env template
│   └── validate_env.py           # Env variable validator
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml        # Prometheus config
│   │   └── alerts.yml            # Alert rules
│   └── grafana/
│       ├── grafana.ini           # Grafana config
│       ├── provisioning/         # Auto-provisioning
│       └── dashboards/           # Pre-built dashboards
├── systemd/
│   └── forexbot.service          # Systemd service unit
└── README.md                     # This file
```

## Environment Variables

See `deploy/env/production.env` for all required variables.

### Critical Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MT5_PASSWORD` | MT5 account password | Yes |
| `SECRET_KEY` | Server secret (64 hex chars) | Yes |
| `JWT_SECRET` | JWT signing key (64 hex chars) | Yes |
| `DASHBOARD_PASSWORD` | Dashboard admin password | Yes |
| `DATABASE_URL` | Database connection string | Yes |

### Generate Secrets

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Commands

### Deployment

```bash
# First deployment
bash deploy/scripts/deploy.sh --init --env production

# Update
bash deploy/scripts/deploy.sh --env production

# Rollback
bash deploy/scripts/deploy.sh --rollback

# Specific version (with git tag)
bash deploy/scripts/deploy.sh --tag v1.2.3 --env production
```

### Database

```bash
# Backup
bash deploy/scripts/backup.sh

# Verify integrity
bash deploy/scripts/backup.sh --verify

# Restore
bash deploy/scripts/backup.sh --restore backups/forex_bot_20250101_120000.db
```

### Docker

```bash
# Start all services
docker compose -f deploy/docker/docker-compose.yml \
    -f deploy/docker/docker-compose.prod.yml up -d

# View logs
docker compose -f deploy/docker/docker-compose.yml logs -f backend

# Stop
docker compose -f deploy/docker/docker-compose.yml down --timeout 60

# Rebuild and restart
docker compose -f deploy/docker/docker-compose.yml build
docker compose -f deploy/docker/docker-compose.yml up -d
```

### Systemd (Auto-start on boot)

```bash
sudo cp deploy/systemd/forexbot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable forexbot
sudo systemctl start forexbot
```

## Monitoring

| Tool | URL | Purpose |
|------|-----|---------|
| Prometheus | `http://host:9090` | Metrics storage |
| Grafana | `https://bot.example.com/grafana` | Dashboards |
| Node Exporter | `http://host:9100` | System metrics |
| cAdvisor | `http://host:8080` | Docker metrics |

### Alerts

Alerts are sent via Telegram when:
- Backend goes down (>1min)
- MT5 disconnects (>2min)
- Disk space <10%
- Database integrity failure
- High trade rejection rate
- Queue backlog >50 intents

## Security

- All API responses include security headers (CSP, HSTS, XSS protection)
- Rate limiting on all endpoints (120r/m general, 10r/m login)
- JWT tokens with short TTL (15min access, 7 day refresh)
- Webhook signature validation
- Environment validation before startup
- Secrets never committed to version control

## Backup Strategy

| Backup | Frequency | Retention | Method |
|--------|-----------|-----------|--------|
| Database | Daily (cron) | 7 days | SQLite .backup |
| Pre-deploy | Each deploy | 7 days | Automatic |
| Logs | Rotated | 5 backups | Nginx + app rotation |

## Recovery

### Auto-Recovery (systemd)

The `forexbot.service` automatically:
- Restarts on crash (up to 5 times in 5 minutes)
- Runs `deploy/scripts/recovery.sh` on each restart
- Cleans disk space if usage >90%

### Manual Recovery

```bash
# Check status
docker compose -f deploy/docker/docker-compose.yml ps

# View logs
docker compose -f deploy/docker/docker-compose.yml logs --tail=100

# Restart specific service
docker compose -f deploy/docker/docker-compose.yml restart backend

# Full restart
docker compose -f deploy/docker/docker-compose.yml down --timeout 60
docker compose -f deploy/docker/docker-compose.yml up -d
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`):
1. Runs backend tests (pytest)
2. Runs frontend lint, type check, and build
3. Builds and pushes Docker images to GHCR
4. Deploys to production (on tag push or manual trigger)

## Production Checklist

- [ ] DNS A record configured for domain
- [ ] `.env` file with ALL values filled
- [ ] `python deploy/env/validate_env.py` passes
- [ ] SSL certificates issued
- [ ] Docker and Docker Compose installed
- [ ] Systemd service installed
- [ ] Database backup cron set up
- [ ] Monitoring stack deployed
- [ ] Telegram alerts configured
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] Daily backup cron: `0 3 * * * /opt/forexbot/deploy/scripts/backup.sh`
- [ ] Auto-recovery cron: `*/5 * * * * /opt/forexbot/deploy/scripts/recovery.sh`
