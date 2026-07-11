// WebSocket event and protocol contracts shared by the dashboard's real-time
// client, hooks, stores, and components.

// -----------------------------------------------------------------------------
// Channels
// -----------------------------------------------------------------------------

export type WsChannel =
  | "bot"
  | "trades"
  | "signals"
  | "health"
  | "risk"
  | "config"
  | "account"
  | "market"
  | "metrics"
  | "execution";

// -----------------------------------------------------------------------------
// Autonomous decision contracts
// -----------------------------------------------------------------------------

export type AutonomousDecisionOutcome = "ALLOW" | "REJECT";

export type AutonomousDecisionDirection =
  | "BUY"
  | "SELL"
  | "HOLD";

export interface AutonomousDecisionIndicators {
  rsi: number | null;
  atr: number | null;
  atr_percent: number | null;
  adx: number | null;
  plus_di: number | null;
  minus_di: number | null;
}

export interface AutonomousDecisionPayload {
  outcome: AutonomousDecisionOutcome;
  allowed: boolean;
  symbol: string;
  timeframe: string;
  direction: AutonomousDecisionDirection;
  confidence: number;
  reason: string;
  checks: string[];
  indicators: AutonomousDecisionIndicators;
  evaluated_at: string;
}

// -----------------------------------------------------------------------------
// Event payload contracts
// -----------------------------------------------------------------------------

export interface BotLifecyclePayload {
  previous?: string;
  reason?: string;
}

export interface AccountTickPayload {
  balance?: number;
  equity?: number;
  margin?: number;
  free_margin?: number;
  margin_level?: number | null;
  currency?: string;
  leverage?: number | null;
  captured_at?: string;
}

export interface MarketTickPayload {
  symbol?: string;
  bid?: number;
  ask?: number;
  spread?: number;
  timestamp?: string;
}

export interface RiskTickPayload {
  daily_pnl?: number;
  daily_drawdown_pct?: number;
  max_drawdown_pct?: number;
  open_risk_pct?: number;
  exposure_pct?: number;
  risk_per_trade_pct?: number;
  open_positions?: number;
  margin_level?: number | null;
  captured_at?: string;
}

export interface WsEventMap {
  BOT_STARTED: BotLifecyclePayload;
  BOT_STOPPED: BotLifecyclePayload;
  BOT_PAUSED: BotLifecyclePayload;
  KILL_SWITCH_TRIGGERED: BotLifecyclePayload;

  TRADE_OPENED: Record<string, unknown>;
  TRADE_CLOSED: Record<string, unknown>;
  TRADE_REJECTED: Record<string, unknown>;
  SL_HIT: Record<string, unknown>;
  TP_HIT: Record<string, unknown>;
  POSITION_BREAKEVEN: Record<string, unknown>;
  POSITION_TRAILING_UPDATED: Record<string, unknown>;
  POSITION_PARTIAL_CLOSED: Record<string, unknown>;

  SIGNAL_GENERATED: Record<string, unknown>;
  SIGNAL_SCORED: Record<string, unknown>;
  SIGNAL_REJECTED: Record<string, unknown>;
  AUTONOMOUS_DECISION_EVENT: AutonomousDecisionPayload;

  MT5_CONNECTED: Record<string, unknown>;
  MT5_DISCONNECTED: Record<string, unknown>;
  MT5_RECONNECT_FAILED: Record<string, unknown>;

  DAILY_LOSS_LIMIT_HIT: Record<string, unknown>;
  DRAWDOWN_LIMIT_HIT: Record<string, unknown>;
  DRAWDOWN_WARNING: Record<string, unknown>;
  MARGIN_WARNING: Record<string, unknown>;

  CIRCUIT_BREAKER_TRIPPED: Record<string, unknown>;
  CIRCUIT_BREAKER_RECOVERED: Record<string, unknown>;
  CONFIG_RELOADED: Record<string, unknown>;
  CRITICAL_ERROR: Record<string, unknown>;

  ACCOUNT_TICK: AccountTickPayload;
  MARKET_TICK: MarketTickPayload;
  RISK_TICK: RiskTickPayload;
  HEALTH_TICK: Record<string, unknown>;
  METRICS_TICK: Record<string, unknown>;
  EXECUTION_TICK: Record<string, unknown>;
}

export type WsEventName = keyof WsEventMap;

// -----------------------------------------------------------------------------
// Event envelopes
// -----------------------------------------------------------------------------

export interface WsEvent<
  TEventName extends WsEventName = WsEventName,
> {
  event_id: string;
  sequence: number;
  event: TEventName;
  channel: WsChannel;
  payload: WsEventMap[TEventName];
  occurred_at: string;
}

export type AutonomousDecisionWsEvent =
  WsEvent<"AUTONOMOUS_DECISION_EVENT">;

// -----------------------------------------------------------------------------
// Server control messages
// -----------------------------------------------------------------------------

export interface WsConnected {
  action: "connected";
  conn_id: string;
  role: string;
  current_sequence: number;
}

export interface WsPing {
  action: "ping";
  server_time: number;
}

export interface WsReplayComplete {
  action: "replay_complete";
  channel: WsChannel;
  events_sent: number;
  replay_incomplete: boolean;
}

export interface WsSubscribed {
  action: "subscribed";
  channel: WsChannel;
}

export interface WsUnsubscribed {
  action: "unsubscribed";
  channel: WsChannel;
}

export interface WsError {
  error: string;
}

export type WsControlMessage =
  | WsConnected
  | WsPing
  | WsReplayComplete
  | WsSubscribed
  | WsUnsubscribed
  | WsError;

export type WsServerMessage =
  | WsEvent
  | WsControlMessage;

// -----------------------------------------------------------------------------
// Type guards
// -----------------------------------------------------------------------------

export function isWsEvent(
  message: WsServerMessage,
): message is WsEvent {
  return (
    "event" in message &&
    "channel" in message &&
    "payload" in message
  );
}

export function isAutonomousDecisionEvent(
  event: WsEvent,
): event is AutonomousDecisionWsEvent {
  return event.event === "AUTONOMOUS_DECISION_EVENT";
}