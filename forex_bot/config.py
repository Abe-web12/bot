# ============================================================
# FOREX TRADING BOT — CONFIG FILE
# ============================================================
# ============================================================

import os
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# MT5 SETTINGS
# ============================================================
MT5_LOGIN    = int(os.getenv("MT5_LOGIN", "0"))
MT5_PASSWORD = os.getenv("MT5_PASSWORD", "YOUR_PASSWORD_HERE")
MT5_SERVER   = os.getenv("MT5_SERVER", "Exness-MT5Trial9")
MT5_PATH     = os.getenv("MT5_PATH", "C:/Program Files/MetaTrader 5/terminal64.exe")
MAGIC_NUMBER = 202600001  # Bot trades identifier

# MT5 client mode: "direct" (Windows, uses MetaTrader5 package) or
# "bridge" (Linux, calls Windows MT5 Bridge Service via HTTP).
MT5_MODE = os.getenv("MT5_MODE", "direct")
# URL of the Windows MT5 Bridge Service (e.g. http://192.168.1.100:5002)
MT5_BRIDGE_URL = os.getenv("MT5_BRIDGE_URL", "")

# ============================================================
# TELEGRAM SETTINGS
# ============================================================
# These must be set in .env — there are intentionally NO fallback
# values here. If the token or chat ID is missing, the Telegram
# notification service will log a clear startup warning and disable
# itself rather than silently sending nothing or crashing.
TELEGRAM_TOKEN   = os.getenv("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
TELEGRAM_PARSE_MODE = os.getenv("TELEGRAM_PARSE_MODE", "MarkdownV2")  # MarkdownV2 | HTML | None

# ============================================================
# TRADING SYMBOLS
# ============================================================
SYMBOLS = ["EURUSD", "GBPUSD"]
PRIMARY_SYMBOL = "EURUSD"

# ============================================================
# TIMEFRAMES
# ============================================================
TIMEFRAME_PRIMARY   = "H1"   # Main signal timeframe
TIMEFRAME_CONFIRM   = "H4"   # Confirmation timeframe
TIMEFRAME_ENTRY     = "M15"  # Entry precision timeframe

# ============================================================
# STRATEGY SETTINGS
# ============================================================
# RSI Settings
RSI_PERIOD     = 14
RSI_OVERSOLD   = 30
RSI_OVERBOUGHT = 70

# MACD Settings
MACD_FAST   = 12
MACD_SLOW   = 26
MACD_SIGNAL = 9

# EMA Settings
EMA_FAST = 21
EMA_SLOW = 50
EMA_TREND = 200

# Bollinger Bands
BB_PERIOD = 20
BB_STD    = 2.0

# ATR Settings
ATR_PERIOD = 14

# Signal Score Threshold (0-100)
MIN_SIGNAL_SCORE = 65  # Only trade if score >= 65

# ============================================================
# RISK MANAGEMENT
# ============================================================
RISK_PER_TRADE_PCT  = 1.0   # 1% risk per trade
MAX_OPEN_TRADES     = 3     # Max concurrent trades
DAILY_LOSS_LIMIT_PCT = 5.0  # Stop trading if -5% daily
MAX_DRAWDOWN_PCT    = 10.0  # Emergency stop at -10%

# Global cooldown (seconds) between consecutive trades
MIN_TRADE_INTERVAL_SECONDS = 300  # 5 minutes

# SL/TP Multipliers (ATR based)
SL_ATR_MULTIPLIER   = 1.5   # SL = ATR × 1.5
TP1_ATR_MULTIPLIER  = 2.0   # TP1 = ATR × 2.0 (50% close)
TP2_ATR_MULTIPLIER  = 3.0   # TP2 = ATR × 3.0 (30% close)
TP3_ATR_MULTIPLIER  = 5.0   # TP3 = ATR × 5.0 (20% close)

# Risk/Reward minimum
MIN_RR_RATIO = 1.5

# Trailing Stop (pips)
TRAILING_START_PIPS = 20
TRAILING_STEP_PIPS  = 10

# Spread & Slippage
MAX_SPREAD_PIPS    = 3.0
MAX_SLIPPAGE_PIPS  = 2.0

# ============================================================
# MARKET SESSION SETTINGS (UTC)
# ============================================================
LONDON_OPEN  = "08:00"
LONDON_CLOSE = "16:00"
NY_OPEN      = "13:00"
NY_CLOSE     = "21:00"
TRADE_BEST_HOURS_ONLY = True

# ============================================================
# NEWS FILTER
# ============================================================
FILTER_NEWS          = True
NEWS_PAUSE_MINUTES   = 30  # Stop 30min before news
NEWS_RESUME_MINUTES  = 30  # Resume 30min after news
HIGH_IMPACT_ONLY     = True

# ============================================================
# BOT SETTINGS
# ============================================================
BOT_LOOP_INTERVAL    = 60   # Check every 60 seconds
HEARTBEAT_INTERVAL   = 30   # Heartbeat every 30 seconds
MAX_RETRY_ATTEMPTS   = 5    # MT5 reconnect attempts
RETRY_DELAY_SECONDS  = 10   # Wait between retries
EVENT_BUS_MAX_HISTORY = 500  # Max historical events retained in EventBus

# ============================================================
# SERVER SETTINGS
# ============================================================
SERVER_HOST = "localhost"
SERVER_PORT = 5000
SECRET_KEY  = os.getenv("SECRET_KEY", "")      # JWT signing — must be set in .env
JWT_SECRET  = os.getenv("JWT_SECRET", "")       # alias kept for API layer clarity
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "") # for validating incoming webhooks
WEBHOOK_REPLAY_WINDOW_SECONDS = 300              # reject webhook requests older than this
WEBHOOK_RATE_LIMIT_PER_MINUTE = 30               # per-source-IP token bucket
DEBUG_MODE  = False

# ============================================================
# AI / GEMINI
# ============================================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")  # empty = AI features disabled at runtime
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GEMINI_TIMEOUT = 15.0  # HTTP request timeout in seconds for Gemini API calls

# ============================================================
# DATABASE
# ============================================================
DATABASE_URL  = os.getenv("DATABASE_URL", "sqlite:///database/forex_bot.db")
DATABASE_PATH = "database/forex_bot.db"   # kept for direct SQLite usage in legacy code

# ============================================================
# LOGGING
# ============================================================
LOG_LEVEL    = "INFO"
LOG_MAX_SIZE = 10  # MB
LOG_BACKUP_COUNT = 5

# ============================================================
# API AUTHENTICATION (JWT + RBAC)
# ============================================================
# Single-operator bot: one "admin" account (full control) authenticated
# with DASHBOARD_PASSWORD, and an optional read-only "viewer" account.
# This is NOT a multi-tenant user system — this bot has one operator.
# If VIEWER_PASSWORD is blank, the viewer role is disabled entirely.
VIEWER_PASSWORD = os.getenv("VIEWER_PASSWORD", "")
JWT_ACCESS_TOKEN_TTL_SECONDS  = 900      # 15 minutes
JWT_REFRESH_TOKEN_TTL_SECONDS = 604800   # 7 days
API_RATE_LIMIT_PER_MINUTE     = 120      # general authenticated API endpoints
API_LOGIN_RATE_LIMIT_PER_MINUTE = 10     # stricter limit on the login endpoint
API_CACHE_TTL_SECONDS          = 5       # short TTL cache for expensive read endpoints
DASHBOARD_TITLE    = "Forex Trading Bot"
DASHBOARD_PASSWORD = os.getenv("DASHBOARD_PASSWORD", "")  # must be set in .env for legacy mode
SESSION_TIMEOUT    = 3600  # 1 hour

# ============================================================
# MULTI-USER AUTHENTICATION (SaaS)
# ============================================================
# Separate JWT secret for user-based tokens (in addition to the
# legacy single-operator JWT_SECRET). If not set, falls back to
# JWT_SECRET. User tokens embed user_id in the sub claim.
USER_JWT_SECRET = os.getenv("USER_JWT_SECRET", "")
USER_JWT_ACCESS_TOKEN_TTL_SECONDS  = 900    # 15 minutes
USER_JWT_REFRESH_TOKEN_TTL_SECONDS = 604800 # 7 days
BCRYPT_ROUNDS = 12

# ============================================================
# SMTP / EMAIL
# ============================================================
# Email system degrades gracefully if not configured — all email
# features (verification, password reset) are automatically disabled
# with a clear warning at startup, rather than crashing or silently
# failing to send.
SMTP_HOST     = os.getenv("SMTP_HOST", "")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_USE_TLS  = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
SMTP_FROM     = os.getenv("SMTP_FROM", "noreply@forexbot.local")

# ============================================================
# SITE / BRANDING
# ============================================================
SITE_NAME = os.getenv("SITE_NAME", "ForexBot")
SITE_URL  = os.getenv("SITE_URL", "http://localhost:3000")
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "support@forexbot.local")

# ============================================================
# SUBSCRIPTION PLANS (no payment gateway yet — feature gating only)
# ============================================================
SUBSCRIPTION_PLANS = {
    "free": {
        "name": "Free",
        "max_workspaces": 1,
        "max_members": 1,
        "max_api_keys": 0,
        "max_symbols": 2,
        "max_trades_per_day": 10,
        "includes_ai": False,
        "includes_telegram": False,
        "historical_data_days": 7,
        "chart_indicators": True,
        "export_csv": True,
        "export_xlsx": False,
        "priority_support": False,
    },
    "starter": {
        "name": "Starter",
        "max_workspaces": 1,
        "max_members": 2,
        "max_api_keys": 1,
        "max_symbols": 4,
        "max_trades_per_day": 50,
        "includes_ai": True,
        "includes_telegram": False,
        "historical_data_days": 30,
        "chart_indicators": True,
        "export_csv": True,
        "export_xlsx": True,
        "priority_support": False,
    },
    "pro": {
        "name": "Pro",
        "max_workspaces": 3,
        "max_members": 5,
        "max_api_keys": 5,
        "max_symbols": 10,
        "max_trades_per_day": 200,
        "includes_ai": True,
        "includes_telegram": True,
        "historical_data_days": 90,
        "chart_indicators": True,
        "export_csv": True,
        "export_xlsx": True,
        "priority_support": False,
    },
    "enterprise": {
        "name": "Enterprise",
        "max_workspaces": 10,
        "max_members": 50,
        "max_api_keys": 50,
        "max_symbols": 50,
        "max_trades_per_day": 10000,
        "includes_ai": True,
        "includes_telegram": True,
        "historical_data_days": 365,
        "chart_indicators": True,
        "export_csv": True,
        "export_xlsx": True,
        "priority_support": True,
    },
}

# ============================================================
# ANALYTICS
# ============================================================
EQUITY_SNAPSHOT_INTERVAL = 3600  # Every 1 hour
REPORT_CURRENCY = "USD"
