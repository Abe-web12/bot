export interface WsEvent {
  event_id: string
  sequence: number
  event: string
  channel: string
  payload: Record<string, unknown>
  occurred_at: string
}

export interface WsConnected {
  action: "connected"
  conn_id: string
  role: string
  current_sequence: number
}

export interface WsPing {
  action: "ping"
  server_time: number
}

export interface WsReplayComplete {
  action: "replay_complete"
  channel: string
  events_sent: number
  replay_incomplete: boolean
}

export interface WsSubscribed {
  action: "subscribed"
  channel: string
}

export interface WsUnsubscribed {
  action: "unsubscribed"
  channel: string
}

export interface WsError {
  error: string
}

export type WsServerMessage = WsEvent | WsConnected | WsPing | WsReplayComplete | WsSubscribed | WsUnsubscribed | WsError

export type WsChannel = "bot" | "trades" | "signals" | "health" | "risk" | "config" | "account" | "market" | "metrics" | "execution"

export interface WsEventMap {
  "BOT_STARTED": { previous: string; reason: string }
  "BOT_STOPPED": { previous: string; reason: string }
  "BOT_PAUSED": { previous: string; reason: string }
  "KILL_SWITCH_TRIGGERED": { previous: string; reason: string }
  "TRADE_OPENED": Record<string, unknown>
  "TRADE_CLOSED": Record<string, unknown>
  "TRADE_REJECTED": Record<string, unknown>
  "SL_HIT": Record<string, unknown>
  "TP_HIT": Record<string, unknown>
  "POSITION_BREAKEVEN": Record<string, unknown>
  "POSITION_TRAILING_UPDATED": Record<string, unknown>
  "POSITION_PARTIAL_CLOSED": Record<string, unknown>
  "SIGNAL_GENERATED": Record<string, unknown>
  "SIGNAL_SCORED": Record<string, unknown>
  "SIGNAL_REJECTED": Record<string, unknown>
  "MT5_CONNECTED": Record<string, unknown>
  "MT5_DISCONNECTED": Record<string, unknown>
  "MT5_RECONNECT_FAILED": Record<string, unknown>
  "DAILY_LOSS_LIMIT_HIT": Record<string, unknown>
  "DRAWDOWN_LIMIT_HIT": Record<string, unknown>
  "DRAWDOWN_WARNING": Record<string, unknown>
  "MARGIN_WARNING": Record<string, unknown>
  "CIRCUIT_BREAKER_TRIPPED": Record<string, unknown>
  "CIRCUIT_BREAKER_RECOVERED": Record<string, unknown>
  "CONFIG_RELOADED": Record<string, unknown>
  "CRITICAL_ERROR": Record<string, unknown>
  "ACCOUNT_TICK": Record<string, unknown>
  "MARKET_TICK": Record<string, unknown>
  "RISK_TICK": Record<string, unknown>
  "HEALTH_TICK": Record<string, unknown>
  "METRICS_TICK": Record<string, unknown>
  "EXECUTION_TICK": Record<string, unknown>
}
