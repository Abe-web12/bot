"use client"

import { useRiskSnapshot, useMarketSpread } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { ShieldCheck, Lock, Unlock, TrendingDown } from "lucide-react"

const SYMBOLS = ["EURUSD", "GBPUSD"]

function RiskBar({ label, current, max, unit, invert }: { label: string; current: number; max: number; unit?: string; invert?: boolean }) {
  const ratio = max > 0 ? current / max : 0
  const pct = Math.min(100, Math.max(0, ratio * 100))
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-100 font-mono">
          {current.toFixed(2)}{unit} / {max.toFixed(2)}{unit}
        </span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function RiskPage() {
  const { data: risk, isLoading, isError, refetch } = useRiskSnapshot()
  const { data: spreadEur } = useMarketSpread("EURUSD")
  const { data: spreadGbp } = useMarketSpread("GBPUSD")

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p className="text-lg font-medium">Failed to load risk data</p>
          <button className="text-sm underline mt-2" onClick={() => refetch()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : risk ? (
        <>
          {/* Risk Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                  Current Risk
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <RiskBar label="Daily Loss" current={risk.daily_loss_pct} max={risk.daily_loss_limit_pct} unit="%" />
                <RiskBar label="Drawdown" current={risk.drawdown_pct} max={risk.max_drawdown_pct} unit="%" />
                <RiskBar label="Margin Usage" current={risk.margin_usage_pct ?? 0} max={100} unit="%" />
                <RiskBar label="Open Trades" current={risk.current_open_trades} max={risk.max_open_trades} unit="" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Risk Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Risk per Trade</span>
                  <span className="text-sm font-mono text-zinc-100">{formatPercent(risk.risk_per_trade_pct)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Max Slippage</span>
                  <span className="text-sm font-mono text-zinc-100">{risk.max_slippage_pips.toFixed(1)} pips</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Peak Equity</span>
                  <span className="text-sm font-mono text-zinc-100">{risk.peak_equity != null ? formatCurrency(risk.peak_equity) : "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Duplicate Protection</span>
                  <span className="text-xs text-zinc-400">{risk.duplicate_protection.tracked_symbol_magic_pairs} pairs tracked</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Gate */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {risk.risk_gate.can_open_new_trade ? (
                  <Unlock className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Lock className="h-4 w-4 text-red-400" />
                )}
                <span className="text-sm text-zinc-400">Risk Gate:</span>
                <Badge className={risk.risk_gate.can_open_new_trade ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}>
                  {risk.risk_gate.can_open_new_trade ? "Can Open Trade" : "BLOCKED"}
                </Badge>
                <span className="text-xs text-zinc-500">{risk.risk_gate.reason}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Open:</span>
                <span className="text-sm font-mono text-zinc-100">{risk.current_open_trades} / {risk.max_open_trades}</span>
              </div>
            </CardContent>
          </Card>

          {/* Spread Status */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-zinc-300">Spread Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["EURUSD", "GBPUSD"].map((sym) => {
                  const spread = risk.spread_status[sym]
                  return (
                    <div key={sym} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                      <span className="text-sm text-zinc-300">{sym}</span>
                      {spread && "error" in spread ? (
                        <span className="text-xs text-red-400">{spread.error}</span>
                      ) : spread ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-zinc-100">{spread.current_pips.toFixed(1)} pips</span>
                          <span className="text-[10px] text-zinc-500">/ {spread.max_allowed_pips.toFixed(1)}</span>
                          <Badge className={spread.within_limit ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}>
                            {spread.within_limit ? "OK" : "HIGH"}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500">No data</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">No risk data available</div>
      )}
    </div>
  )
}