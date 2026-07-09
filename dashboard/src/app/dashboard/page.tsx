"use client"

import { useCallback, useMemo } from "react"
import { useDashboardSnapshot, useAccount, useBotStatus, useChartEquityCurve, useChartBalanceCurve, useChartDrawdownCurve, useChartProfitCurve, useChartDailyStats, useChartMonthlyStats, useChartWinLossDistribution, useChartTradeDuration, useChartSessionPerformance, useMarketPrice, useMarketSession, useOrders, useNotifications, useLogs, useRiskSnapshot, useAnalytics } from "@/hooks/use-api"
import { useWsChannel, useWsStatus } from "@/hooks/use-websocket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency, formatPercent, formatDateTime, formatNumber } from "@/lib/utils"
import { TrendingUp, TrendingDown, Activity, Wifi, Database, Globe, Bell, ScrollText, Zap, DollarSign, BarChart3, Shield, BookOpen } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"
import type { WsEvent } from "@/types/websocket"

function StatCard({ title, value, fmt, loading, change, icon }: {
  title: string; value?: number | null; fmt?: "currency" | "percent" | "number"; loading?: boolean; change?: number; icon?: React.ReactNode
}) {
  const formatted = value != null ? (
    fmt === "currency" ? formatCurrency(value) : fmt === "percent" ? formatPercent(value) : formatNumber(value, 2)
  ) : "-"
  return (
    <Card>
      <CardContent className="p-3">
        {loading ? <Skeleton className="h-12 w-full" /> : (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{title}</span>
              {icon && <span className="text-zinc-600">{icon}</span>}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-zinc-100 tabular-nums">{formatted}</span>
              {change !== undefined && (
                <span className={`text-[10px] font-medium ${change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChartToolTip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !(payload as Array<Record<string, unknown>>)?.length) return null
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900/95 p-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="text-zinc-400 mb-1">{label as string}</p>
      {(payload as Array<{ color: string; name: string; value: number }>).map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value.toFixed(2)}</p>
      ))}
    </div>
  )
}

export default function DashboardHomePage() {
  const { data: snapshot, isLoading: snapLoading } = useDashboardSnapshot()
  const { data: account, isLoading: acctLoading } = useAccount()
  const { data: botStatus } = useBotStatus()
  const { data: analytics } = useAnalytics()
  const { data: risk } = useRiskSnapshot()
  const { data: orders } = useOrders()
  const { data: notifications } = useNotifications(5)
  const { data: logs } = useLogs(5)
  const { data: marketSession } = useMarketSession()
  const { connected: wsConnected } = useWsStatus()
  const { data: equityCurve, isLoading: equityLoading } = useChartEquityCurve()
  const { data: balanceCurve, isLoading: balanceLoading } = useChartBalanceCurve()
  const { data: drawdownCurve, isLoading: drawdownLoading } = useChartDrawdownCurve()
  const { data: profitCurve, isLoading: profitLoading } = useChartProfitCurve()
  const { data: dailyStats, isLoading: dailyLoading } = useChartDailyStats()
  const { data: monthlyStats, isLoading: monthlyLoading } = useChartMonthlyStats()
  const { data: winLossDist, isLoading: winLossLoading } = useChartWinLossDistribution()
  const { data: tradeDuration, isLoading: durationLoading } = useChartTradeDuration()
  const { data: sessionPerf, isLoading: sessionLoading } = useChartSessionPerformance()

  const acct = account || snapshot?.account
  const stats = snapshot?.statistics
  const positions = snapshot?.positions || []
  const signals = snapshot?.recent_signals || []
  const loading = snapLoading || acctLoading
  const bot = snapshot?.bot
  const mt5ConnectionStatus = botStatus?.connection_status
  const isDemo = botStatus?.is_demo_account
  const botStatusVal = bot?.status || botStatus?.bot_status

  // WS real-time account updates
  const handleWsEvent = useCallback((event: WsEvent) => {
    if (["ACCOUNT_TICK", "TRADE_OPENED", "TRADE_CLOSED", "BOT_STARTED", "BOT_STOPPED", "BOT_PAUSED", "KILL_SWITCH_TRIGGERED"].includes(event.event)) {
    }
  }, [])
  useWsChannel("account", handleWsEvent)
  useWsChannel("trades", handleWsEvent)
  useWsChannel("bot", handleWsEvent)

  const winLossData = useMemo(() =>
    winLossDist?.histogram?.map((h) => ({ name: h.range, value: h.count })) || [],
  [winLossDist])

  const sessionData = useMemo(() =>
    sessionPerf?.sessions?.map((s) => ({ name: s.session, profit: s.total_profit, winRate: s.win_rate_pct })) || [],
  [sessionPerf])

  const pendingOrdersCount = orders?.counts ? Object.values(orders.counts).reduce((a, b) => a + b, 0) : 0
  const logEntries = logs?.logs || []
  const notifEntries = notifications?.notifications || []

  return (
    <div className="space-y-4 p-5">
      {/* Top Status Bar */}
      <Card className="border-zinc-800/80">
        <CardContent className="p-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${botStatusVal === "RUNNING" ? "bg-emerald-500 animate-pulse" : botStatusVal === "PAUSED" ? "bg-amber-500" : "bg-red-500"}`} />
              <span className="text-xs text-zinc-400">Bot</span>
              <Badge className={`text-[10px] px-1.5 py-0 ${
                botStatusVal === "RUNNING" ? "bg-emerald-900/60 text-emerald-300" :
                botStatusVal === "PAUSED" ? "bg-amber-900/60 text-amber-300" :
                "bg-red-900/60 text-red-300"
              }`}>{botStatusVal || "OFF"}</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className={`h-3 w-3 ${mt5ConnectionStatus === "CONNECTED" ? "text-emerald-400" : "text-red-400"}`} />
              <span className="text-xs text-zinc-500">MT5</span>
              <span className={`text-xs ${mt5ConnectionStatus === "CONNECTED" ? "text-emerald-400" : "text-red-400"}`}>
                {mt5ConnectionStatus || "OFF"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className={`h-3 w-3 ${wsConnected ? "text-emerald-400" : "text-red-400"}`} />
              <span className="text-xs text-zinc-500">WS</span>
              <span className={`text-xs ${wsConnected ? "text-emerald-400" : "text-red-400"}`}>
                {wsConnected ? "LIVE" : "OFF"}
              </span>
            </div>
            {marketSession && (
              <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-zinc-500" />
                <span className="text-xs text-zinc-500">Session</span>
                <span className={`text-xs ${marketSession.london_open || marketSession.ny_open ? "text-emerald-400" : "text-zinc-500"}`}>
                  {marketSession.london_open && marketSession.ny_open ? "LONDON+NY" : marketSession.london_open ? "LONDON" : marketSession.ny_open ? "NY" : "CLOSED"}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-[10px] ${isDemo ? "bg-amber-900/40 text-amber-300" : "bg-emerald-900/40 text-emerald-300"}`}>
              {isDemo ? "DEMO" : "LIVE"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Account Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Balance" value={acct?.balance} fmt="currency" loading={loading} icon={<DollarSign className="h-3.5 w-3.5" />} />
        <StatCard title="Equity" value={acct?.equity} fmt="currency" loading={loading} change={acct?.floating_profit ? (acct.floating_profit / (acct.balance || 1)) * 100 : undefined} icon={<Activity className="h-3.5 w-3.5" />} />
        <StatCard title="Free Margin" value={acct?.free_margin} fmt="currency" loading={loading} icon={<Zap className="h-3.5 w-3.5" />} />
        <StatCard title="Floating P/L" value={acct?.floating_profit} fmt="currency" loading={loading} icon={<TrendingUp className="h-3.5 w-3.5" />} />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        <StatCard title="Drawdown" value={risk?.drawdown_pct} fmt="percent" loading={snapLoading} />
        <StatCard title="Win Rate" value={stats?.win_rate?.win_rate_pct} fmt="percent" loading={snapLoading} />
        <StatCard title="Profit Factor" value={stats?.profit_factor} fmt="number" loading={snapLoading} />
        <StatCard title="Expectancy" value={stats?.expectancy} fmt="currency" loading={snapLoading} />
        <StatCard title="Sharpe" value={analytics?.sharpe_ratio?.value} fmt="number" loading={!analytics} />
        <StatCard title="Daily P&L" value={analytics?.daily_pnl} fmt="currency" loading={!analytics} />
        <StatCard title="Monthly P&L" value={analytics?.monthly_pnl} fmt="currency" loading={!analytics} />
        <StatCard title="Open Trades" value={positions.length} fmt="number" loading={loading} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <ChartCard title="Equity Curve" loading={equityLoading}>
          {equityCurve?.series?.length ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={equityCurve.series}>
                <defs><linearGradient id="eq" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="x" tick={false} axisLine={false} /><YAxis domain={["auto", "auto"]} tick={false} axisLine={false} />
                <RechartsTooltip content={<ChartToolTip />} />
                <Area type="monotone" dataKey="y" stroke="#10b981" fill="url(#eq)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Balance Curve" loading={balanceLoading}>
          {balanceCurve?.series?.length ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={balanceCurve.series}>
                <defs><linearGradient id="bl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="x" tick={false} axisLine={false} /><YAxis tick={false} axisLine={false} />
                <RechartsTooltip content={<ChartToolTip />} />
                <Area type="monotone" dataKey="y" stroke="#3b82f6" fill="url(#bl)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Drawdown Curve" loading={drawdownLoading}>
          {drawdownCurve?.series?.length ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={drawdownCurve.series}>
                <defs><linearGradient id="dd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="x" tick={false} axisLine={false} /><YAxis tick={false} axisLine={false} />
                <RechartsTooltip content={<ChartToolTip />} />
                <Area type="monotone" dataKey="y" stroke="#ef4444" fill="url(#dd)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Daily P&L" loading={dailyLoading}>
          {dailyStats?.series?.length ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyStats.series}>
                <XAxis dataKey="x" tick={false} axisLine={false} /><YAxis tick={false} axisLine={false} />
                <RechartsTooltip content={<ChartToolTip />} />
                <Bar dataKey="y" fill="#3b82f6" radius={[1, 1, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Monthly P&L" loading={monthlyLoading}>
          {monthlyStats?.series?.length ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyStats.series}>
                <XAxis dataKey="x" tick={false} axisLine={false} /><YAxis tick={false} axisLine={false} />
                <RechartsTooltip content={<ChartToolTip />} />
                <Bar dataKey="y" fill="#10b981" radius={[1, 1, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Profit Curve" loading={profitLoading}>
          {profitCurve?.series?.length ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={profitCurve.series}>
                <defs><linearGradient id="pr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} /><stop offset="95%" stopColor="#a855f7" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="x" tick={false} axisLine={false} /><YAxis tick={false} axisLine={false} />
                <RechartsTooltip content={<ChartToolTip />} />
                <Area type="monotone" dataKey="y" stroke="#a855f7" fill="url(#pr)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      {/* Widget Row: Positions, Orders, Signals + Notifications, Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Open Positions */}
          <Card>
            <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5"><Activity className="h-3 w-3 text-emerald-400" />Open Positions ({positions.length})</CardTitle>
              {positions.length > 0 && (
                <span className={`text-xs font-mono font-bold ${(positions.reduce((s, p) => s + p.profit, 0)) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatCurrency(positions.reduce((s, p) => s + p.profit, 0))}
                </span>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {positions.length === 0 ? (
                <div className="p-6 text-center text-zinc-600 text-xs">No open positions</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-zinc-800 text-left text-zinc-500">
                        <th className="p-2 font-medium">Ticket</th>
                        <th className="p-2 font-medium">Sym</th>
                        <th className="p-2 font-medium">Side</th>
                        <th className="p-2 font-medium text-right">Profit</th>
                        <th className="p-2 font-medium text-right">Pips</th>
                        <th className="p-2 font-medium">Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((pos) => {
                        const pips = pos.side === "BUY" ? (pos.current_price - pos.open_price) * 10000 : (pos.open_price - pos.current_price) * 10000
                        return (
                          <tr key={pos.ticket} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                            <td className="p-2 font-mono text-zinc-300">{pos.ticket}</td>
                            <td className="p-2 font-medium text-zinc-200">{pos.symbol}</td>
                            <td className="p-2">
                              <Badge className={`text-[10px] px-1 py-0 ${pos.side === "BUY" ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}`}>{pos.side}</Badge>
                            </td>
                            <td className={`p-2 text-right font-mono font-medium ${pos.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(pos.profit)}</td>
                            <td className={`p-2 text-right font-mono ${pos.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{pips.toFixed(1)}</td>
                            <td className="p-2 text-zinc-500">{formatDuration(pos.open_time)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card>
            <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5"><BookOpen className="h-3 w-3 text-blue-400" />Pending Orders ({pendingOrdersCount})</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="text-xs text-zinc-600">
                {pendingOrdersCount > 0 ? `${pendingOrdersCount} order(s) in queue` : "No pending orders"}
              </div>
            </CardContent>
          </Card>

          {/* Recent Signals */}
          <Card>
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5"><BarChart3 className="h-3 w-3 text-purple-400" />Recent Signals ({signals.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {signals.length === 0 ? (
                <div className="p-6 text-center text-zinc-600 text-xs">No recent signals</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-zinc-800 text-left text-zinc-500">
                        <th className="p-2 font-medium">Type</th>
                        <th className="p-2 font-medium">Sym</th>
                        <th className="p-2 font-medium">Side</th>
                        <th className="p-2 font-medium text-right">Conf</th>
                        <th className="p-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {signals.slice(0, 5).map((sig) => (
                        <tr key={sig.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                          <td className="p-2 text-zinc-300">{sig.entry_type}</td>
                          <td className="p-2 text-zinc-200">{sig.symbol || "-"}</td>
                          <td className="p-2">
                            <Badge className={`text-[10px] px-1 py-0 ${sig.side === "BUY" ? "bg-emerald-900/60 text-emerald-300" : sig.side === "SELL" ? "bg-red-900/60 text-red-300" : "bg-zinc-800 text-zinc-400"}`}>{sig.side || "-"}</Badge>
                          </td>
                          <td className="p-2 text-right font-mono text-zinc-300">{sig.confidence != null ? `${sig.confidence.toFixed(0)}%` : "-"}</td>
                          <td className="p-2 text-zinc-500">{formatDateTime(sig.occurred_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Notifications */}
          <Card>
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5"><Bell className="h-3 w-3 text-amber-400" />Latest Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {notifEntries.length === 0 ? (
                <div className="p-6 text-center text-zinc-600 text-xs">No notifications</div>
              ) : (
                <div className="divide-y divide-zinc-800/30">
                  {notifEntries.map((n) => (
                    <div key={n.id} className="flex items-start gap-2 px-3 py-1.5 hover:bg-zinc-800/20">
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">{formatDateTime(n.occurred_at)}</span>
                      <span className="text-[11px] text-zinc-300 truncate">{n.event_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card>
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5"><ScrollText className="h-3 w-3 text-blue-400" />Latest Logs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {logEntries.length === 0 ? (
                <div className="p-6 text-center text-zinc-600 text-xs">No logs</div>
              ) : (
                <div className="divide-y divide-zinc-800/30 max-h-[200px] overflow-y-auto">
                  {logEntries.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-1 hover:bg-zinc-800/20">
                      <span className={`text-[10px] font-medium px-1 rounded ${
                        log.level === "ERROR" || log.level === "CRITICAL" ? "bg-red-900/60 text-red-300" :
                        log.level === "WARNING" ? "bg-amber-900/60 text-amber-300" :
                        log.level === "INFO" ? "bg-blue-900/60 text-blue-300" :
                        "bg-zinc-800 text-zinc-400"
                      }`}>{log.level}</span>
                      <span className="text-[11px] text-zinc-400 truncate flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Win/Loss Distribution */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Win / Loss</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {winLossLoading ? <Skeleton className="h-16 w-full" /> : winLossData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={80}>
                    <PieChart>
                      <Pie data={winLossData} cx="50%" cy="50%" innerRadius={24} outerRadius={36} paddingAngle={2} dataKey="value">
                        {winLossData.map((e, i) => <Cell key={i} fill={e.name?.includes("Win") ? "#10b981" : "#ef4444"} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Session</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {sessionLoading ? <Skeleton className="h-16 w-full" /> : sessionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={sessionData}>
                      <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 8 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Bar dataKey="profit" fill="#3b82f6" radius={[1, 1, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children, loading }: { title: string; children: React.ReactNode; loading: boolean }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-2.5 pb-0">
        <CardTitle className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-1">{loading ? <Skeleton className="h-40 w-full" /> : children}</CardContent>
    </Card>
  )
}

function EmptyChart() {
  return <div className="h-40 flex items-center justify-center text-zinc-700 text-[10px]">No data</div>
}

function formatDuration(openTime: string | null | undefined): string {
  if (!openTime) return "-"
  const diff = Date.now() - new Date(openTime).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
