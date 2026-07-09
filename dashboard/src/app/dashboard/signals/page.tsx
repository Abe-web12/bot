"use client"

import { useState } from "react"
import { useSignalScore, useSignalEvaluation, useIndicatorValues, useStrategyHistory } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { formatDateTime } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Brain, Gauge, BarChart3, Activity, Waves, Crosshair } from "lucide-react"

const SYMBOLS = ["EURUSD", "GBPUSD"]

function IndicatorRow({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0">
      <span className="flex items-center gap-2 text-xs text-zinc-400"><span className="text-zinc-600">{icon}</span>{label}</span>
      <span className="text-xs font-mono text-zinc-100">{value}</span>
    </div>
  )
}

function SignalGauge({ score, minThreshold }: { score: number; minThreshold?: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const color = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">Confidence</span>
        <span className="font-mono text-zinc-100">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      {minThreshold != null && (
        <div className="text-[10px] text-zinc-500">Threshold: {minThreshold}%</div>
      )}
    </div>
  )
}

export default function SignalsPage() {
  const [symbol, setSymbol] = useState("EURUSD")
  const { data: score, isLoading: scoreLoading, isError: scoreError } = useSignalScore(symbol)
  const { data: evaluation, isLoading: evalLoading } = useSignalEvaluation(symbol)
  const { data: indicators, isLoading: indLoading } = useIndicatorValues(symbol)
  const { data: history, isLoading: histLoading } = useStrategyHistory(1, 50, symbol)

  const signals = history?.items || []

  return (
    <div className="space-y-4">
      {/* Symbol Selector */}
      <div className="flex gap-2">
        {SYMBOLS.map((sym) => (
          <button
            key={sym}
            onClick={() => setSymbol(sym)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${symbol === sym ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"}`}
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Signal Score */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm text-zinc-300">{symbol} - Signal Score</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {scoreLoading ? (
            <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
          ) : scoreError ? (
            <div className="text-red-400 text-sm">Failed to load signal score</div>
          ) : score ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">Direction:</span>
                  <Badge className={score.direction === "BUY" ? "bg-emerald-900/60 text-emerald-300" : score.direction === "SELL" ? "bg-red-900/60 text-red-300" : ""}>
                    {score.direction || "NEUTRAL"}
                  </Badge>
                </div>
                <span className={`text-xs ${score.would_queue ? "text-emerald-400" : "text-amber-400"}`}>
                  {score.would_queue ? "ACCEPTED" : "REJECTED"}
                </span>
              </div>

              <SignalGauge score={score.our_confidence} minThreshold={score.min_signal_score_threshold} />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <IndicatorRow label="Indicator Confluence" value={score.breakdown.indicator_confluence_score.toFixed(1)} icon={<BarChart3 className="h-3 w-3" />} />
                <IndicatorRow label="Trend Alignment" value={score.breakdown.trend_alignment_score.toFixed(1)} icon={<TrendingUp className="h-3 w-3" />} />
                <IndicatorRow label="Volatility Suitability" value={score.breakdown.volatility_suitability_score.toFixed(1)} icon={<Activity className="h-3 w-3" />} />
                <IndicatorRow label="Multi-Timeframe" value={score.breakdown.multi_timeframe_score.toFixed(1)} icon={<Waves className="h-3 w-3" />} />
              </div>

              {score.reasons?.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs text-zinc-500 mb-1">Reasons:</div>
                  <ul className="text-xs text-zinc-300 space-y-0.5">
                    {score.reasons.map((r, i) => <li key={i}>- {r}</li>)}
                  </ul>
                </div>
              )}

              {score.gemini?.available && (
                <div className="pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-1 text-xs text-purple-400 mb-1">
                    <Gauge className="h-3 w-3" /> Gemini Score: {score.gemini.confidence_score?.toFixed(1) ?? "N/A"}%
                  </div>
                  <p className="text-xs text-zinc-500">{score.gemini.reasoning}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-zinc-600 text-sm">No signal score available</div>
          )}
        </CardContent>
      </Card>

      {/* Indicator Values */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm text-zinc-300">Indicators</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {indLoading ? <Skeleton className="h-32 w-full" /> : indicators ? (
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <IndicatorRow label="EMA Fast" value={indicators.ema_fast?.toFixed(5) ?? "-"} icon={<TrendingUp className="h-3 w-3" />} />
                <IndicatorRow label="EMA Slow" value={indicators.ema_slow?.toFixed(5) ?? "-"} icon={<TrendingDown className="h-3 w-3" />} />
                <IndicatorRow label="RSI" value={indicators.rsi?.toFixed(1) ?? "-"} icon={<Gauge className="h-3 w-3" />} />
                <IndicatorRow label="ATR" value={indicators.atr?.toFixed(5) ?? "-"} icon={<Activity className="h-3 w-3" />} />
              </div>
              <div>
                <IndicatorRow label="MACD Line" value={indicators.macd?.macd_line.toFixed(5) ?? "-"} icon={<BarChart3 className="h-3 w-3" />} />
                <IndicatorRow label="MACD Signal" value={indicators.macd?.signal_line.toFixed(5) ?? "-"} icon={<BarChart3 className="h-3 w-3" />} />
                <IndicatorRow label="MACD Hist" value={indicators.macd?.histogram.toFixed(5) ?? "-"} icon={<BarChart3 className="h-3 w-3" />} />
                <IndicatorRow label="Market Structure" value={indicators.market_structure ?? "-"} icon={<Crosshair className="h-3 w-3" />} />
              </div>
            </div>
          ) : (
            <div className="text-zinc-600 text-sm">No indicators data</div>
          )}
        </CardContent>
      </Card>

      {/* Bollinger Bands & Support/Resistance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-zinc-300">Bollinger Bands</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {indicators?.bollinger_bands ? (
              <div className="space-y-1.5">
                <IndicatorRow label="Upper" value={indicators.bollinger_bands.upper.toFixed(5)} icon={<Waves className="h-3 w-3" />} />
                <IndicatorRow label="Middle" value={indicators.bollinger_bands.middle.toFixed(5)} icon={<Minus className="h-3 w-3" />} />
                <IndicatorRow label="Lower" value={indicators.bollinger_bands.lower.toFixed(5)} icon={<Waves className="h-3 w-3" />} />
              </div>
            ) : (
              <div className="text-zinc-600 text-sm">No Bollinger data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-zinc-300">Support / Resistance</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {indicators?.support_resistance?.length ? (
              <div className="space-y-1">
                {indicators.support_resistance.map((sr, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/50 last:border-0">
                    <span className={`font-mono ${sr.is_resistance ? "text-red-400" : "text-emerald-400"}`}>
                      {sr.price.toFixed(5)}
                    </span>
                    <span className="text-zinc-500">{sr.is_resistance ? "RESISTANCE" : "SUPPORT"} (x{sr.touch_count})</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-600 text-sm">No levels</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Signal Evaluation */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm text-zinc-300">Signal Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {evalLoading ? <Skeleton className="h-24 w-full" /> : evaluation ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-zinc-800/50">
                <div className="text-[10px] text-zinc-500 mb-1">RSI</div>
                <div className="text-sm font-mono text-zinc-100">{evaluation.evidence.rsi_value?.toFixed(1) ?? "-"}</div>
                <div className={`text-[10px] ${evaluation.evidence.rsi_is_oversold ? "text-emerald-400" : evaluation.evidence.rsi_is_overbought ? "text-red-400" : "text-zinc-500"}`}>
                  {evaluation.evidence.rsi_is_oversold ? "Oversold" : evaluation.evidence.rsi_is_overbought ? "Overbought" : "Normal"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-800/50">
                <div className="text-[10px] text-zinc-500 mb-1">MACD</div>
                <div className="text-sm font-mono text-zinc-100">{evaluation.evidence.macd_histogram?.toFixed(5) ?? "-"}</div>
                <div className={`text-[10px] ${evaluation.evidence.macd_bullish_crossover ? "text-emerald-400" : evaluation.evidence.macd_bearish_crossover ? "text-red-400" : "text-zinc-500"}`}>
                  {evaluation.evidence.macd_bullish_crossover ? "Bullish Cross" : evaluation.evidence.macd_bearish_crossover ? "Bearish Cross" : "No Cross"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-800/50">
                <div className="text-[10px] text-zinc-500 mb-1">EMA</div>
                <div className="text-sm font-mono text-zinc-100">{evaluation.evidence.ema_fast_above_slow ? "Fast > Slow" : "Fast < Slow"}</div>
                <div className={`text-[10px] ${evaluation.evidence.ema_fast_above_slow ? "text-emerald-400" : "text-red-400"}`}>
                  {evaluation.evidence.ema_fast_above_slow ? "Bullish" : "Bearish"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-800/50">
                <div className="text-[10px] text-zinc-500 mb-1">Direction</div>
                <div className="text-sm font-mono text-zinc-100">{evaluation.direction || "NEUTRAL"}</div>
              </div>
            </div>
          ) : (
            <div className="text-zinc-600 text-sm">No evaluation data</div>
          )}
        </CardContent>
      </Card>

      {/* Signal Timeline */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm text-zinc-300">Signal Timeline ({signals.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {histLoading ? (
            <div className="p-4 space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
          ) : signals.length === 0 ? (
            <div className="p-6 text-center text-zinc-600 text-sm">No signal history</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-400 text-xs">
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Direction</th>
                    <th className="p-3 font-medium">Confidence</th>
                    <th className="p-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((s) => (
                    <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="p-3 text-zinc-100">{s.entry_type}</td>
                      <td className="p-3">
                        <Badge className={s.side === "BUY" ? "bg-emerald-900/60 text-emerald-300" : s.side === "SELL" ? "bg-red-900/60 text-red-300" : ""}>
                          {s.side || "-"}
                        </Badge>
                      </td>
                      <td className="p-3 text-zinc-100">{s.confidence != null ? `${s.confidence.toFixed(1)}%` : "-"}</td>
                      <td className="p-3 text-xs text-zinc-400">{formatDateTime(s.occurred_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}