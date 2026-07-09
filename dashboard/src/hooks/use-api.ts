"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, getDownloadUrl } from "@/lib/api-client"
import type {
  AccountInfo, Analytics, BotStatus, ChartPoint, DashboardSnapshot, DatabaseStatus,
  HealthStatus, IndicatorValues, LogEntry, MarketCandle, MarketLiquidity, MarketPrice,
  MarketSession, MarketTrend, MT5Health, Notification, NotificationQueue, PagedResponse,
  Position, RiskSnapshot, Settings, Signal, SignalEvaluation, SignalScore, Trade,
  WebSocketStatus, WinLossDistribution, TradeDuration, SessionPerformance, HeatmapCell,
  WorkersStatus,
} from "@/types/api"

export function useDashboardSnapshot() {
  return useQuery<DashboardSnapshot>({
    queryKey: ["dashboard-snapshot"],
    queryFn: () => api.get("/api/dashboard/snapshot"),
    refetchInterval: 5000,
  })
}

export function useAccount() {
  return useQuery<AccountInfo>({
    queryKey: ["account"],
    queryFn: () => api.get("/api/account"),
    refetchInterval: 5000,
  })
}

export function useBotStatus() {
  return useQuery<BotStatus>({
    queryKey: ["bot-status"],
    queryFn: () => api.get("/api/status"),
    refetchInterval: 10000,
  })
}

export function useBotControl() {
  return useQuery<{ status: string; mode: string; uptime_seconds: number }>({
    queryKey: ["bot-control"],
    queryFn: () => api.get("/api/bot/status"),
    refetchInterval: 10000,
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
  return useQuery<PagedResponse<Trade> & { win_rate: { total: number; wins: number; losses: number; win_rate_pct: number } }>({
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

export function useJournal(limit = 100, entryType?: string, symbol?: string) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (entryType) params.set("entry_type", entryType)
  if (symbol) params.set("symbol", symbol)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery<{ timestamp: string; count: number; entries: any[] }>({
    queryKey: ["journal", limit, entryType, symbol],
    queryFn: () => api.get(`/api/journal?${params}`),
    refetchInterval: 15000,
  })
}

export function useAnalytics() {
  return useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: () => api.get("/api/analytics"),
    refetchInterval: 30000,
  })
}

export function useChartEquityCurve() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-equity-curve"],
    queryFn: () => api.get("/api/charts/equity-curve"),
    refetchInterval: 60000,
  })
}

export function useChartBalanceCurve() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-balance-curve"],
    queryFn: () => api.get("/api/charts/balance-curve"),
    refetchInterval: 60000,
  })
}

export function useChartDrawdownCurve() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-drawdown-curve"],
    queryFn: () => api.get("/api/charts/drawdown-curve"),
    refetchInterval: 60000,
  })
}

export function useChartProfitCurve() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-profit-curve"],
    queryFn: () => api.get("/api/charts/profit-curve"),
    refetchInterval: 30000,
  })
}

export function useChartDailyStats() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-daily-stats"],
    queryFn: () => api.get("/api/charts/daily-stats"),
    refetchInterval: 60000,
  })
}

export function useChartMonthlyStats() {
  return useQuery<{ timestamp: string; series: ChartPoint[] }>({
    queryKey: ["chart-monthly-stats"],
    queryFn: () => api.get("/api/charts/monthly-stats"),
    refetchInterval: 60000,
  })
}

export function useChartWinLossDistribution() {
  return useQuery<WinLossDistribution>({
    queryKey: ["chart-win-loss"],
    queryFn: () => api.get("/api/charts/win-loss-distribution"),
    refetchInterval: 60000,
  })
}

export function useChartTradeDuration() {
  return useQuery<TradeDuration>({
    queryKey: ["chart-trade-duration"],
    queryFn: () => api.get("/api/charts/trade-duration"),
    refetchInterval: 60000,
  })
}

export function useChartSessionPerformance() {
  return useQuery<SessionPerformance>({
    queryKey: ["chart-session-performance"],
    queryFn: () => api.get("/api/charts/session-performance"),
    refetchInterval: 60000,
  })
}

export function useChartHeatmap() {
  return useQuery<{ timestamp: string; cells: HeatmapCell[] }>({
    queryKey: ["chart-heatmap"],
    queryFn: () => api.get("/api/charts/heatmap"),
    refetchInterval: 120000,
  })
}

export function useMarketPrice(symbol: string) {
  return useQuery<MarketPrice & { timestamp: string; symbol: string }>({
    queryKey: ["market-price", symbol],
    queryFn: () => api.get(`/api/market/price/${symbol}`),
    refetchInterval: 3000,
  })
}

export function useMarketCandles(symbol: string, timeframe = "H1", count = 100) {
  return useQuery<{ timestamp: string; symbol: string; timeframe: string; count: number; candles: MarketCandle[] }>({
    queryKey: ["market-candles", symbol, timeframe, count],
    queryFn: () => api.get(`/api/market/candles/${symbol}?timeframe=${timeframe}&count=${count}`),
    refetchInterval: 30000,
  })
}

export function useMarketSpread(symbol: string) {
  return useQuery<{ timestamp: string; symbol: string; current_spread_pips: number; max_allowed_pips: number; within_limit: boolean }>({
    queryKey: ["market-spread", symbol],
    queryFn: () => api.get(`/api/market/spread/${symbol}`),
    refetchInterval: 10000,
  })
}

export function useMarketATR(symbol: string, timeframe = "H1") {
  return useQuery<{ timestamp: string; symbol: string; timeframe: string; period: number; atr: number }>({
    queryKey: ["market-atr", symbol, timeframe],
    queryFn: () => api.get(`/api/market/atr/${symbol}?timeframe=${timeframe}`),
    refetchInterval: 30000,
  })
}

export function useMarketTrend(symbol: string, timeframe = "H1") {
  return useQuery<MarketTrend & { timestamp: string; symbol: string; timeframe: string }>({
    queryKey: ["market-trend", symbol, timeframe],
    queryFn: () => api.get(`/api/market/trend/${symbol}?timeframe=${timeframe}`),
    refetchInterval: 30000,
  })
}

export function useMarketSession() {
  return useQuery<MarketSession>({
    queryKey: ["market-session"],
    queryFn: () => api.get("/api/market/session"),
    refetchInterval: 30000,
  })
}

export function useMarketLiquidity(symbol: string) {
  return useQuery<MarketLiquidity & { timestamp: string; symbol: string; timeframe: string }>({
    queryKey: ["market-liquidity", symbol],
    queryFn: () => api.get(`/api/market/liquidity/${symbol}`),
    refetchInterval: 60000,
  })
}

export function useRiskSnapshot() {
  return useQuery<RiskSnapshot>({
    queryKey: ["risk"],
    queryFn: () => api.get("/api/risk/current"),
    refetchInterval: 10000,
  })
}

export function useIndicatorValues(symbol: string, timeframe = "H1") {
  return useQuery<IndicatorValues>({
    queryKey: ["indicators", symbol, timeframe],
    queryFn: () => api.get(`/api/strategy/indicators/${symbol}?timeframe=${timeframe}`),
    refetchInterval: 30000,
  })
}

export function useSignalScore(symbol: string) {
  return useQuery<SignalScore>({
    queryKey: ["signal-score", symbol],
    queryFn: () => api.get(`/api/strategy/score/${symbol}`),
    refetchInterval: 30000,
  })
}

export function useSignalEvaluation(symbol: string) {
  return useQuery<SignalEvaluation & { timestamp: string; symbol: string }>({
    queryKey: ["signal-evaluation", symbol],
    queryFn: () => api.get(`/api/strategy/signal/${symbol}`),
    refetchInterval: 30000,
  })
}

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: () => api.get("/api/settings"),
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (changes: Record<string, unknown>) => api.post("/api/settings", { changes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  })
}

export function useLogs(lines = 100, level?: string) {
  const params = new URLSearchParams({ lines: String(lines) })
  if (level) params.set("level", level)
  return useQuery<{ timestamp: string; count: number; logs: LogEntry[] }>({
    queryKey: ["logs", lines, level],
    queryFn: () => api.get(`/api/logs?${params}`),
    refetchInterval: 15000,
  })
}

export function useNotifications(limit = 50) {
  return useQuery<{ timestamp: string; count: number; notifications: Notification[] }>({
    queryKey: ["notifications", limit],
    queryFn: () => api.get(`/api/notifications?limit=${limit}`),
    refetchInterval: 15000,
  })
}

export function useNotificationQueue() {
  return useQuery<NotificationQueue>({
    queryKey: ["notification-queue"],
    queryFn: () => api.get("/api/notifications/queue"),
    refetchInterval: 10000,
  })
}

export function useDatabaseStatus() {
  return useQuery<DatabaseStatus>({
    queryKey: ["database-status"],
    queryFn: () => api.get("/api/database/status"),
    refetchInterval: 30000,
  })
}

export function useHealthStatus() {
  return useQuery<HealthStatus>({
    queryKey: ["health"],
    queryFn: () => api.get("/health"),
    refetchInterval: 15000,
  })
}

export function useMT5Health() {
  return useQuery<MT5Health>({
    queryKey: ["mt5-health"],
    queryFn: () => api.get("/mt5"),
    refetchInterval: 10000,
  })
}

export function useWebSocketStatus() {
  return useQuery<WebSocketStatus>({
    queryKey: ["ws-status"],
    queryFn: () => api.get("/api/websocket/status"),
    refetchInterval: 10000,
  })
}

export function useWorkersStatus() {
  return useQuery<WorkersStatus>({
    queryKey: ["workers-status"],
    queryFn: () => api.get("/api/workers/status"),
    refetchInterval: 15000,
  })
}

export function useCloseTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ticket: number) => api.post(`/api/trades/${ticket}/close`),
    onSuccess: () => {
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
      api.post(`/api/bot/${action}`, reason ? { reason } : undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bot-status"] })
      qc.invalidateQueries({ queryKey: ["bot-control"] })
    },
  })
}

export function useSendTestNotification() {
  return useMutation({
    mutationFn: () => api.post("/api/notifications/test"),
  })
}

export function useOrders() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery<{ timestamp: string; counts: Record<string, number>; pending: any[] }>({
    queryKey: ["orders"],
    queryFn: () => api.get("/api/orders"),
    refetchInterval: 10000,
  })
}

export function useStrategyHistory(page = 1, pageSize = 50, symbol?: string) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  if (symbol) params.set("symbol", symbol)
  return useQuery<PagedResponse<Signal>>({
    queryKey: ["strategy-history", page, pageSize, symbol],
    queryFn: () => api.get(`/api/strategy/history?${params}`),
  })
}

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