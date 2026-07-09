export interface AccountInfo {
  balance: number
  equity: number
  margin: number
  free_margin: number
  margin_level: number
  currency: string
  floating_profit: number
  drawdown_pct: number
  daily_loss_pct: number
  open_positions: number
  updated_at: string | null
}

export interface Position {
  ticket: number
  symbol: string
  side: string
  volume: number
  open_price: number
  current_price: number
  stop_loss: number
  take_profit: number
  profit: number
  swap: number
  magic_number: number
  open_time: string
  comment: string
}

export interface Trade {
  id: string
  mt5_ticket: number
  symbol: string
  side: string
  open_price: number
  close_price: number | null
  volume: number
  stop_loss: number | null
  take_profit: number | null
  profit: number | null
  open_time: string | null
  close_time: string | null
  close_reason: string | null
}

export interface Signal {
  id: number
  entry_type: string
  symbol: string | null
  side: string | null
  confidence: number | null
  reason: string | null
  occurred_at: string
}

export interface JournalEntry {
  id: number
  entry_type: string
  symbol: string | null
  side: string | null
  price: number | null
  confidence: number | null
  reason: string | null
  execution_id: string | null
  mt5_ticket: number | null
  payload: Record<string, unknown> | null
  occurred_at: string
}

export interface BotStatus {
  bot_status: string
  connection_status: string
  is_demo_account: boolean | null
  last_error: string | null
}

export interface WinRate {
  total: number
  wins: number
  losses: number
  win_rate_pct: number
}

export interface Statistics {
  win_rate: WinRate
  profit_factor: number | null
  expectancy: number
  gross_profit: number
  gross_loss: number
  avg_win: number
  avg_loss: number
}

export interface ProfitFactorStats {
  profit_factor: number | null
  gross_profit: number
  gross_loss: number
}

export interface ExpectancyStats {
  expectancy: number
  avg_win: number
  avg_loss: number
}

export interface Analytics {
  win_rate: WinRate
  profit_factor: ProfitFactorStats
  expectancy: ExpectancyStats
  sharpe_ratio: { value: number | null; sample_count: number; periods_per_year: number; note: string } | null
  daily_pnl: number
  monthly_pnl: number
  equity_curve: EquityPoint[]
}

export interface EquityPoint {
  balance: number
  equity: number
  drawdown_pct: number | null
  snapshotted_at: string
}

export interface ChartPoint {
  x: string
  y: number
}

export interface WinLossDistribution {
  total_trades: number
  histogram: { range: string; count: number }[]
}

export interface TradeDuration {
  total_trades: number
  average_duration_minutes: number | null
  histogram: { range: string; count: number }[]
}

export interface SessionPerformance {
  sessions: { session: string; trade_count: number; total_profit: number; win_rate_pct: number }[]
}

export interface HeatmapCell {
  day_of_week: number
  hour_utc: number
  trade_count: number
  win_rate_pct: number | null
}

export interface RiskSnapshot {
  daily_loss_pct: number
  daily_loss_limit_pct: number
  drawdown_pct: number
  max_drawdown_pct: number
  peak_equity: number | null
  risk_per_trade_pct: number
  margin_usage_pct: number | null
  max_open_trades: number
  current_open_trades: number
  max_slippage_pips: number
  spread_status: Record<string, { current_pips: number; max_allowed_pips: number; within_limit: boolean } | { error: string }>
  duplicate_protection: { tracked_symbol_magic_pairs: number; note: string }
  risk_gate: { can_open_new_trade: boolean; reason: string }
}

export interface MarketPrice {
  bid: number
  ask: number
  spread_pips: number
  tick_time: string
}

export interface MarketCandle {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketTrend {
  direction: string
  is_trending: boolean
  adx: number | null
  ema_fast: number | null
  ema_slow: number | null
}

export interface MarketSession {
  server_time_utc: string
  london_open: boolean
  ny_open: boolean
  overlap: boolean
  trade_best_hours_only: boolean
}

export interface MarketLiquidity {
  tick_volume_current: number
  tick_volume_average: number
  tick_volume_ratio: number | null
}

export interface IndicatorValues {
  ema_fast: number | null
  ema_slow: number | null
  rsi: number | null
  macd: { macd_line: number; signal_line: number; histogram: number } | null
  atr: number | null
  bollinger_bands: { upper: number; middle: number; lower: number } | null
  support_resistance: { price: number; is_resistance: boolean; touch_count: number }[]
  market_structure: string | null
}

export interface SignalScore {
  direction: string
  our_confidence: number
  breakdown: {
    indicator_confluence_score: number
    trend_alignment_score: number
    volatility_suitability_score: number
    multi_timeframe_score: number
  }
  reasons: string[]
  gemini: { available: boolean; confidence_score: number | null; reasoning: string; suggested_action: string } | null
  min_signal_score_threshold: number
  would_queue: boolean
}

export interface SignalEvaluation {
  direction: string
  evidence: {
    rsi_value: number | null
    rsi_is_oversold: boolean
    rsi_is_overbought: boolean
    macd_histogram: number | null
    macd_bullish_crossover: boolean
    macd_bearish_crossover: boolean
    ema_fast_above_slow: boolean
    candle_patterns: { name: string; bias: string; strength: string }[]
  }
}

export interface DashboardSnapshot {
  account: AccountInfo
  positions: Position[]
  recent_trades: Trade[]
  recent_signals: Signal[]
  risk: RiskSnapshot
  statistics: Statistics
  health: { bot_status: string; connection_status: string; database_ok: boolean; database_message: string; overall_ok: boolean }
  bot: { status: string; mode: string; uptime_seconds: number }
}

export interface Pagination {
  page: number
  page_size: number
  total_items: number
  total_pages: number
  has_next?: boolean
  has_previous?: boolean
}

export interface PagedResponse<T> {
  items: T[]
  pagination: Pagination
}

export interface Settings {
  overrides: Record<string, unknown>
  reloadable_keys: string[]
  history: { key: string; old_value: unknown; new_value: unknown; changed_at: string }[]
}

export interface LogEntry {
  level: string
  message: string
  logger: string
  timestamp: string
  [key: string]: unknown
}

export interface Notification {
  id: number
  event_name: string
  source: string | null
  payload: Record<string, unknown> | null
  occurred_at: string
}

export interface NotificationQueue {
  telegram_enabled: boolean
  queue_depth: number
}

export interface DatabaseStatus {
  connected: boolean
  message: string
  latency_ms: number
  migration_version?: number
  integrity_errors?: string[]
  pending_queue?: Record<string, number>
}

export interface HealthStatus {
  status: string
  subsystems: {
    bot: { status: string; ok: boolean }
    mt5: { status: string; ok: boolean }
    database: { ok: boolean; message: string }
  }
  system: Record<string, unknown>
}

export interface MT5Health {
  connected: boolean
  connection_status: string
  is_demo: boolean
  latency_ms: number
  account?: { balance: number; equity: number; free_margin: number; currency: string }
}

export interface WebSocketStatus {
  total_connections: number
  subscriptions_per_channel: Record<string, number>
  current_sequence: number
  connections: {
    conn_id: string
    role: string
    subscriptions: string[]
    messages_sent: number
    messages_failed: number
    connected_seconds: number
    idle_seconds: number
  }[]
}

export interface WorkersStatus {
  workers: Record<string, { running: boolean; last_run: string | null; error_count: number }>
}


