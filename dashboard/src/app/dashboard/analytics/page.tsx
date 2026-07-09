"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useAnalytics, useChartMonthlyStats, useChartDailyStats, useChartWinLossDistribution, useChartTradeDuration, useChartSessionPerformance, useChartHeatmap } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils"
import { BarChart as RechartsBar, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Activity, Gauge, Crosshair, BarChart as BarChartIcon } from "lucide-react"

function MetricCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">{title}</span>
          <span className="text-zinc-600">{icon}</span>
        </div>
        <div className="text-lg font-semibold text-zinc-100">{value}</div>
        {subtitle && <div className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</div>}
      </CardContent>
    </Card>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-xs shadow">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading, isError, refetch } = useAnalytics()
  const { data: monthlyStats, isLoading: monthlyLoading } = useChartMonthlyStats()
  const { data: dailyStats, isLoading: dailyLoading } = useChartDailyStats()
  const { data: winLossDist, isLoading: wlLoading } = useChartWinLossDistribution()
  const { data: tradeDuration, isLoading: durLoading } = useChartTradeDuration()
  const { data: sessionPerf, isLoading: sessLoading } = useChartSessionPerformance()
  const { data: heatmap, isLoading: heatLoading } = useChartHeatmap()

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p className="text-lg font-medium">Failed to load analytics</p>
          <button className="mt-4 text-sm underline" onClick={() => refetch()}>Retry</button>
        </div>
      </div>
    )
  }

  const stats = analytics
  const winLossData = winLossDist?.histogram?.map((h) => ({ name: h.range, value: h.count })) || []
  const durationData = tradeDuration?.histogram?.map((h) => ({ name: h.range, value: h.count })) || []
  const sessionData = sessionPerf?.sessions?.map((s) => ({ name: s.session, profit: s.total_profit, winRate: s.win_rate_pct })) || []

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => `${i}h`)

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Sharpe Ratio"
          value={analytics?.sharpe_ratio?.value != null ? analytics.sharpe_ratio.value.toFixed(2) : "-"}
          subtitle={analytics?.sharpe_ratio?.note}
          icon={<Gauge className="h-4 w-4" />}
        />
        <MetricCard
          title="Expectancy"
          value={analytics?.expectancy ? formatCurrency(analytics.expectancy.expectancy) : "-"}
          icon={<Crosshair className="h-4 w-4" />}
        />
        <MetricCard
          title="Profit Factor"
          value={analytics?.profit_factor?.profit_factor != null ? analytics.profit_factor.profit_factor.toFixed(2) : "-"}
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          title="Win Rate"
          value={analytics?.win_rate?.win_rate_pct != null ? formatPercent(analytics.win_rate.win_rate_pct) : "-"}
          subtitle={`${analytics?.win_rate?.wins ?? 0}W / ${analytics?.win_rate?.losses ?? 0}L`}
          icon={<BarChartIcon className="h-4 w-4" />}
        />
      </div>

      {/* Average Win/Loss, Largest Win/Loss */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Avg Win" value={analytics?.expectancy ? formatCurrency(analytics.expectancy.avg_win) : "-"} icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
        <MetricCard title="Avg Loss" value={analytics?.expectancy ? formatCurrency(analytics.expectancy.avg_loss) : "-"} icon={<TrendingDown className="h-4 w-4 text-red-500" />} />
        <MetricCard title="Gross Profit" value={formatCurrency(analytics?.profit_factor?.gross_profit)} icon={<DollarSign className="h-4 w-4 text-emerald-500" />} />
        <MetricCard title="Gross Loss" value={formatCurrency(analytics?.profit_factor?.gross_loss)} icon={<DollarSign className="h-4 w-4 text-red-500" />} />
      </div>

      {/* Monthly & Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm text-zinc-300">Monthly P&L</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {monthlyLoading ? <Skeleton className="h-48 w-full" /> : monthlyStats?.series?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBar data={monthlyStats.series}>
                  <XAxis dataKey="x" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="y" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No monthly data</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm text-zinc-300">Daily P&L</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {dailyLoading ? <Skeleton className="h-48 w-full" /> : dailyStats?.series?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBar data={dailyStats.series}>
                  <XAxis dataKey="x" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="y" fill="#10b981" radius={[2, 2, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No daily data</div>}
          </CardContent>
        </Card>
      </div>

      {/* Win/Loss Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm text-zinc-300">Win/Loss Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {wlLoading ? <Skeleton className="h-48 w-full" /> : winLossData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBar data={winLossData}>
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No distribution data</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm text-zinc-300">Trade Duration</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {durLoading ? <Skeleton className="h-48 w-full" /> : durationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBar data={durationData}>
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No duration data</div>}
            {tradeDuration?.average_duration_minutes != null && (
              <div className="text-xs text-zinc-500 mt-2 text-center">
                Avg: {tradeDuration.average_duration_minutes.toFixed(0)} min ({tradeDuration.total_trades} trades)
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Performance */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-sm text-zinc-300">Session Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {sessLoading ? <Skeleton className="h-48 w-full" /> : sessionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RechartsBar data={sessionData}>
                <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="profit" fill="#10b981" radius={[2, 2, 0, 0]} />
              </RechartsBar>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No session data</div>}
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-sm text-zinc-300">Trading Heatmap (Hour / Day)</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {heatLoading ? <Skeleton className="h-48 w-full" /> : heatmap?.cells?.length ? (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-[auto_repeat(24,minmax(28px,1fr))] gap-[1px] min-w-[700px]">
                <div className="h-6" />
                {HOUR_LABELS.map((h) => (
                  <div key={h} className="text-[8px] text-zinc-600 text-center leading-6">{h}</div>
                ))}
                {DAY_LABELS.map((day, di) => (
                  <>
                    <div key={day} className="text-[10px] text-zinc-500 pr-2 leading-6">{day}</div>
                    {HOUR_LABELS.map((_, hi) => {
                      const cell = heatmap.cells.find((c) => c.day_of_week === di && c.hour_utc === hi)
                      const opacity = cell?.trade_count ? Math.min(1, cell.trade_count / 10) : 0
                      const color = cell?.win_rate_pct != null ? (cell.win_rate_pct >= 50 ? `rgba(16,185,129,${opacity})` : `rgba(239,68,68,${opacity})`) : `rgba(39,39,42,${0.3 + opacity * 0.3})`
                      return (
                        <div
                          key={`${di}-${hi}`}
                          className="h-6 rounded-sm"
                          style={{ backgroundColor: color }}
                          title={cell ? `${day} ${hi}h: ${cell.trade_count} trades (${cell.win_rate_pct?.toFixed(0) ?? "N/A"}% WR)` : ""}
                        />
                      )
                    })}
                  </>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No heatmap data</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

