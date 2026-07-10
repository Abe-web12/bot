"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// `api`   → same-origin Next.js + Prisma Route Handlers (migrated domains).
// `flask` → Flask backend (not-yet-migrated endpoints + MT5-facing control).
import { api, flask, getDownloadUrl } from "@/lib/api-client"
import type {
  AccountInfo, Analytics, BotStatus, ChartPoint, DashboardSnapshot, DatabaseStatus,
  HealthStatus, IndicatorValues, LogEntry, MarketCandle, MarketLiquidity, MarketPrice,
  MarketSession, MarketTrend, MT5Health, Notification, NotificationQueue, PagedResponse,
  Position, RiskSnapshot, Settings, Signal, SignalEvaluation, SignalScore, Trade,
  WebSocketStatus, WinLossDistribution, TradeDuration, SessionPerformance, HeatmapCell,
  WorkersStatus,
} from "@/types/api"

// ─────────────────────────────────────────────────────────────
// MIGRATED → Next.js + Prisma (same-origin via `api.*`)
//   trades · positions · signals · account · risk/current
// ─────────────────────────────────────────────────────────────

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: () => api.get("/api/account"),
    refetchInterval: 5000,
  })
}

export function usePositions() {
  return useQuery<{ timestamp: string; count: number; positions: Position[] }>({
    queryKey: ["positions"],
    queryFn: () => api.get("/api/positions"),
    refetchInterval: 5000,
  })
}

export function useTrades(page = 1, pageSize = 50, symbol?: string, sort?: string) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  if (symbol) params.set("symbol", symbol)
  if (sort) params.set("sort", sort)
  return useQuery<PagedResponse & { win_rate: { total: number; wins: number; losses: number; win_rate_pct: number } }>({
    queryKey: ["trades", page, pageSize, symbol, sort],
    queryFn: () => api.get(`/api/trades?${params}`),
  })
}

export function useSignals(limit = 50, symbol?: string) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (symbol) params.set("symbol", symbol)
  return useQuery<{ timestamp: string; count: number; signals: Signal[] }>({
    queryKey: ["signals", limit, symbol],
    queryFn: () => api.get(`/api/signals?${params}`),
    refetchInterval: 10000,
  })
}

export function useRiskSnapshot() {
  return useQuery({
    queryKey: ["risk"],
    queryFn: () => api.get("/api/risk/current"),
    refetchInterval: 10000,
  })
}

// Equity/balance curves now have a Prisma-backed source at /api/account/curve.
// Kept as `api.*` (same-origin). Other chart hooks below remain on Flask until
// their aggregation endpoints are migrated.
export function useChartEquityCurve() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-equity-curve"],
    queryFn: () => api.get("/api/account/curve?metric=equity"),
    refetchInterval: 60000,
  })
}

export function useChartBalanceCurve() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-balance-curve"],
    queryFn: () => api.get("/api/account/curve?metric=balance"),
    refetchInterval: 60000,
  })
}

// ─────────────────────────────────────────────────────────────
// NOT YET MIGRATED → Flask (via `flask.*`)
// ─────────────────────────────────────────────────────────────

export function useDashboardSnapshot() {
  return useQuery({
    queryKey: ["dashboard-snapshot"],
    queryFn: () => flask.get("/api/dashboard/snapshot"),
    refetchInterval: 5000,
  })
}

export function useBotStatus() {
  return useQuery({
    queryKey: ["bot-status"],
    queryFn: () => flask.get("/api/status"),
    refetchInterval: 10000,
  })
}

export function useBotControl() {
  return useQuery<{ status: string; mode: string; uptime_seconds: number }>({
    queryKey: ["bot-control"],
    queryFn: () => flask.get("/api/bot/status"),
    refetchInterval: 10000,
  })
}

export function useJournal(limit = 100, entryType?: string, symbol?: string) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (entryType) params.set("entry_type", entryType)
  if (symbol) params.set("symbol", symbol)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery<{ timestamp: string; count: number; entries: any[] }>({
    queryKey: ["journal", limit, entryType, symbol],
    queryFn: () => flask.get(`/api/journal?${params}`),
    refetchInterval: 15000,
  })
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => flask.get("/api/analytics"),
    refetchInterval: 30000,
  })
}

export function useChartDrawdownCurve() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-drawdown-curve"],
    queryFn: () => flask.get("/api/charts/drawdown-curve"),
    refetchInterval: 60000,
  })
}

export function useChartProfitCurve() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-profit-curve"],
    queryFn: () => flask.get("/api/charts/profit-curve"),
    refetchInterval: 30000,
  })
}

export function useChartDailyStats() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-daily-stats"],
    queryFn: () => flask.get("/api/charts/daily-stats"),
    refetchInterval: 60000,
  })
}

export function useChartMonthlyStats() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-monthly-stats"],
    queryFn: () => flask.get("/api/charts/monthly-stats"),
    refetchInterval: 60000,
  })
}

export function useChartWinLossDistribution() {
  return useQuery<WinLossDistribution>({
    queryKey: ["chart-win-loss"],
    queryFn: () => flask.get("/api/charts/win-loss-distribution"),
    refetchInterval: 60000,
  })
}

export function useChartTradeDuration() {
  return useQuery<TradeDuration>({
    queryKey: ["chart-trade-duration"],
    queryFn: () => flask.get("/api/charts/trade-duration"),
    refetchInterval: 60000,
  })
}

export function useChartSessionPerformance() {
  return useQuery<SessionPerformance>({
    queryKey: ["chart-session-performance"],
    queryFn: () => flask.get("/api/charts/session-performance"),
    refetchInterval: 60000,
  })
}

export function useChartHeatmap() {
  return useQuery<{ timestamp: string; cells: HeatmapCell[] }>({
    queryKey: ["chart-heatmap"],
    queryFn: () => flask.get("/api/charts/heatmap"),
    refetchInterval: 120000,
  })
}

export function useMarketPrice(symbol: string) {
  return useQuery<MarketPrice>({
    queryKey: ["market-price", symbol],
    queryFn: () => flask.get(`/api/market/price/${symbol}`),
    refetchInterval: 3000,
  })
}

export function useMarketCandles(symbol: string, timeframe = "H1", count = 100) {
  return useQuery<{ timestamp: string; symbol: string; timeframe: string; count: number; candles: MarketCandle[] }>({
    queryKey: ["market-candles", symbol, timeframe, count],
    queryFn: () => flask.get(`/api/market/candles/${symbol}?timeframe=${timeframe}&count=${count}`),
    refetchInterval: 30000,
  })
}

export function useMarketSpread(symbol: string) {
  return useQuery<{ timestamp: string; symbol: string; current_spread_pips: number; max_allowed_pips: number; within_limit: boolean }>({
    queryKey: ["market-spread", symbol],
    queryFn: () => flask.get(`/api/market/spread/${symbol}`),
    refetchInterval: 10000,
  })
}

export function useMarketATR(symbol: string, timeframe = "H1") {
  return useQuery<{ timestamp: string; symbol: string; timeframe: string; period: number; atr: number }>({
    queryKey: ["market-atr", symbol, timeframe],
    queryFn: () => flask.get(`/api/market/atr/${symbol}?timeframe=${timeframe}`),
    refetchInterval: 30000,
  })
}

export function useMarketTrend(symbol: string, timeframe = "H1") {
  return useQuery<MarketTrend>({
    queryKey: ["market-trend", symbol, timeframe],
    queryFn: () => flask.get(`/api/market/trend/${symbol}?timeframe=${timeframe}`),
    refetchInterval: 30000,
  })
}

export function useMarketSession() {
  return useQuery<MarketSession>({
    queryKey: ["market-session"],
    queryFn: () => flask.get("/api/market/session"),
    refetchInterval: 30000,
  })
}

export function useMarketLiquidity(symbol: string) {
  return useQuery<MarketLiquidity>({
    queryKey: ["market-liquidity", symbol],
    queryFn: () => flask.get(`/api/market/liquidity/${symbol}`),
    refetchInterval: 60000,
  })
}

export function useIndicatorValues(symbol: string, timeframe = "H1") {
  return useQuery<IndicatorValues>({
    queryKey: ["indicators", symbol, timeframe],
    queryFn: () => flask.get(`/api/strategy/indicators/${symbol}?timeframe=${timeframe}`),
    refetchInterval: 30000,
  })
}

export function useSignalScore(symbol: string) {
  return useQuery<SignalScore>({
    queryKey: ["signal-score", symbol],
    queryFn: () => flask.get(`/api/strategy/score/${symbol}`),
    refetchInterval: 30000,
  })
}

export function useSignalEvaluation(symbol: string) {
  return useQuery<SignalEvaluation>({
    queryKey: ["signal-evaluation", symbol],
    queryFn: () => flask.get(`/api/strategy/signal/${symbol}`),
    refetchInterval: 30000,
  })
}

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: () => flask.get("/api/settings"),
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (changes: Record<string, unknown>) => flask.post("/api/settings", { changes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  })
}

export function useLogs(lines = 100, level?: string) {
  const params = new URLSearchParams({ lines: String(lines) })
  if (level) params.set("level", level)
  return useQuery<{ timestamp: string; count: number; logs: LogEntry[] }>({
    queryKey: ["logs", lines, level],
    queryFn: () => flask.get(`/api/logs?${params}`),
    refetchInterval: 15000,
  })
}

export function useNotifications(limit = 50) {
  return useQuery<{ timestamp: string; count: number; notifications: Notification[] }>({
    queryKey: ["notifications", limit],
    queryFn: () => flask.get(`/api/notifications?limit=${limit}`),
    refetchInterval: 15000,
  })
}

export function useNotificationQueue() {
  return useQuery<NotificationQueue>({
    queryKey: ["notification-queue"],
    queryFn: () => flask.get("/api/notifications/queue"),
    refetchInterval: 10000,
  })
}

export function useDatabaseStatus() {
  return useQuery<DatabaseStatus>({
    queryKey: ["database-status"],
    queryFn: () => flask.get("/api/database/status"),
    refetchInterval: 30000,
  })
}

export function useHealthStatus() {
  return useQuery<HealthStatus>({
    queryKey: ["health"],
    queryFn: () => flask.get("/health"),
    refetchInterval: 15000,
  })
}

export function useMT5Health() {
  return useQuery<MT5Health>({
    queryKey: ["mt5-health"],
    queryFn: () => flask.get("/mt5"),
    refetchInterval: 10000,
  })
}

export function useWebSocketStatus() {
  return useQuery<WebSocketStatus>({
    queryKey: ["ws-status"],
    queryFn: () => flask.get("/api/websocket/status"),
    refetchInterval: 10000,
  })
}

export function useWorkersStatus() {
  return useQuery<WorkersStatus>({
    queryKey: ["workers-status"],
    queryFn: () => flask.get("/api/workers/status"),
    refetchInterval: 15000,
  })
}

export function useOrders() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery<{ timestamp: string; counts: Record<string, number>; pending: any[] }>({
    queryKey: ["orders"],
    queryFn: () => flask.get("/api/orders"),
    refetchInterval: 10000,
  })
}

export function useStrategyHistory(page = 1, pageSize = 50, symbol?: string) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  if (symbol) params.set("symbol", symbol)
  return useQuery<PagedResponse>({
    queryKey: ["strategy-history", page, pageSize, symbol],
    queryFn: () => flask.get(`/api/strategy/history?${params}`),
  })
}

// ─────────────────────────────────────────────────────────────
// MUTATIONS — MT5-facing control stays on Flask. Cache invalidation
// still targets the Next-backed queries so the UI refetches live data.
// ─────────────────────────────────────────────────────────────

export function useCloseTrade() {
  const qc = useQueryClient()
  return useMutation({
    // Closing a position touches MT5 → Flask owns this.
    mutationFn: (ticket: number) => flask.post(`/api/trades/${ticket}/close`),
    onSuccess: () => {
      // These queries are now Next+Prisma-backed; invalidation refetches them.
      qc.invalidateQueries({ queryKey: ["positions"] })
      qc.invalidateQueries({ queryKey: ["trades"] })
      qc.invalidateQueries({ queryKey: ["account"] })
    },
  })
}

export function useBotAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ action, reason }: { action: string; reason?: string }) =>
      flask.post(`/api/bot/${action}`, reason ? { reason } : undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bot-status"] })
      qc.invalidateQueries({ queryKey: ["bot-control"] })
    },
  })
}

export function useSendTestNotification() {
  return useMutation({
    mutationFn: () => flask.post("/api/notifications/test"),
  })
}

// ─────────────────────────────────────────────────────────────
// FILE EXPORTS — still served by Flask (absolute URLs).
// ─────────────────────────────────────────────────────────────

export const tradeExportCsvUrl = (symbol?: string) => {
  let url = getDownloadUrl("/api/trades/export.csv")
  if (symbol) url += `&symbol=${symbol}`
  return url
}

export const tradeExportXlsxUrl = (symbol?: string) => {
  let url = getDownloadUrl("/api/trades/export.xlsx")
  if (symbol) url += `&symbol=${symbol}`
  return url
}