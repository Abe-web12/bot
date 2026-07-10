# ============================================================
# FOREX TRADING BOT — CONFIG FILE
# ============================================================
# ⚠️  MT5_PASSWORD ቦታ ላይ የExness password ህን ጻፍ!
# ============================================================

import os
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# MT5 SETTINGS
# ============================================================
MT5_LOGIN    = int(os.getenv("MT5_LOGIN", "436568542"))
MT5_PASSWORD = os.getenv("MT5_PASSWORD", "YOUR_PASSWORD_HERE")
MT5_SERVER   = os.getenv("MT5_SERVER", "Exness-MT5Trial9")
MT5_PATH     = os.getenv("MT5_PATH", "C:/Program Files/MetaTrader 5/terminal64.exe")
MAGIC_NUMBER = 202600001  # Bot trades identifier

# ============================================================
# TELEGRAM SETTINGS
# ============================================================
# These must be set in .env — there are intentionally NO fallback
# values here. If the token or chat ID is missing, the Telegram
# notification service will log a clear startup warning and disable
# itself rather than silently sending nothing or crashing.
TELEGRAM_TOKEN   = os.getenv("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

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
DASHBOARD_PASSWORD = os.getenv("DASHBOARD_PASSWORD", "admin123")
SESSION_TIMEOUT    = 3600  # 1 hour

# ============================================================
# ANALYTICS
# ============================================================
EQUITY_SNAPSHOT_INTERVAL = 3600  # Every 1 hour
REPORT_CURRENCY = "USD"
