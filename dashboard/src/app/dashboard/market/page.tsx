"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { useMarketPrice, useMarketCandles, useMarketSpread, useMarketATR, useMarketTrend, useMarketSession, useMarketLiquidity } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, formatDateTime } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Activity, Waves, DollarSign, Globe, Clock, Timer } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const SYMBOLS = ["EURUSD", "GBPUSD"]
const TIMEFRAMES = ["M1", "M5", "M15", "H1", "H4", "D1"]

function PriceCard({ symbol }: { symbol: string }) {
  const { data: price, isLoading } = useMarketPrice(symbol)
  const { data: spread } = useMarketSpread(symbol)
  const { data: trend } = useMarketTrend(symbol)
  const { data: liquidity } = useMarketLiquidity(symbol)
  const { data: atr } = useMarketATR(symbol)

  if (isLoading) return <Skeleton className="h-32 w-full" />

  const mid = price ? (price.bid + price.ask) / 2 : null
  const trendColor = trend?.direction === "UP" ? "text-emerald-400" : trend?.direction === "DOWN" ? "text-red-400" : "text-zinc-400"

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-zinc-100">{symbol}</span>
        <span className={`text-lg font-mono font-bold ${trendColor}`}>{mid ? mid.toFixed(5) : "-"}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded bg-zinc-800/50">
          <span className="text-zinc-500">Bid</span>
          <div className="font-mono text-zinc-100">{price?.bid.toFixed(5) ?? "-"}</div>
        </div>
        <div className="p-2 rounded bg-zinc-800/50">
          <span className="text-zinc-500">Ask</span>
          <div className="font-mono text-zinc-100">{price?.ask.toFixed(5) ?? "-"}</div>
        </div>
        <div className="p-2 rounded bg-zinc-800/50">
          <span className="text-zinc-500">Spread</span>
          <div className={`font-mono ${spread?.within_limit ? "text-emerald-400" : "text-red-400"}`}>
            {spread?.current_spread_pips?.toFixed(1) ?? "-"} pips
          </div>
        </div>
        <div className="p-2 rounded bg-zinc-800/50">
          <span className="text-zinc-500">ATR</span>
          <div className="font-mono text-zinc-100">{atr?.atr?.toFixed(5) ?? "-"}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-zinc-500">Trend:</span>
        <span className={`font-medium ${trendColor}`}>{trend?.direction || "-"}</span>
        {trend?.is_trending && <Badge className="bg-emerald-900/60 text-emerald-300 text-[10px]">Trending</Badge>}
        <span className="text-zinc-500 ml-2">ADX:</span>
        <span className="font-mono text-zinc-100">{trend?.adx?.toFixed(1) ?? "-"}</span>
      </div>
      {liquidity && (
        <div className="text-xs text-zinc-500">
          Liquidity: {liquidity.tick_volume_current.toLocaleString()} ticks (avg: {liquidity.tick_volume_average.toLocaleString()})
          <span className={`ml-1 ${(liquidity.tick_volume_ratio ?? 1) >= 1 ? "text-emerald-400" : "text-amber-400"}`}>
            ({(liquidity.tick_volume_ratio ?? 0).toFixed(2)}x)
          </span>
        </div>
      )}
    </div>
  )
}

function CandleChart({ symbol, timeframe }: { symbol: string; timeframe: string }) {
  const { data, isLoading } = useMarketCandles(symbol, timeframe, 50)

  if (isLoading) return <Skeleton className="h-48 w-full" />
  if (!data?.candles?.length) return <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No candle data</div>

  const chartData = data.candles.map((c) => ({
    time: new Date(c.time).toLocaleTimeString(),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="candleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis domain={['auto', 'auto']} tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
          formatter={(value: any) => typeof value === 'number' ? value.toFixed(5) : String(value)}
        />
        <Area type="monotone" dataKey="close" stroke="#3b82f6" fill="url(#candleGrad)" strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function countdownTimer(targetUtc: string): string {
  const now = Date.now()
  const target = new Date(targetUtc).getTime()
  const diff = target - now
  if (diff <= 0) return "Now"
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${h}h ${m}m ${s}s`
}

export default function MarketPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD")
  const [timeframe, setTimeframe] = useState("H1")
  const { data: session, isLoading: sessionLoading } = useMarketSession()

  const nextLondonClose = "today 17:00 UTC"
  const nextNYClose = "today 22:00 UTC"

  return (
    <div className="space-y-4">
      {/* Symbol Selector & Session Info */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {SYMBOLS.map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSymbol === sym ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"}`}
            >
              {sym}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {sessionLoading ? (
            <Skeleton className="h-6 w-40" />
          ) : session ? (
            <div className="flex items-center gap-2 text-xs">
              <Globe className="h-3 w-3 text-zinc-500" />
              <span className={`px-1.5 py-0.5 rounded ${session.london_open ? "bg-emerald-900/40 text-emerald-300" : "bg-zinc-800 text-zinc-500"}`}>London</span>
              <span className={`px-1.5 py-0.5 rounded ${session.ny_open ? "bg-emerald-900/40 text-emerald-300" : "bg-zinc-800 text-zinc-500"}`}>NY</span>
              {session.overlap && <Badge className="bg-purple-900/60 text-purple-300">Overlap</Badge>}
            </div>
          ) : null}
        </div>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SYMBOLS.map((sym) => (
          <Card key={sym}>
            <CardContent className="p-4">
              <PriceCard symbol={sym} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-zinc-300">{selectedSymbol} Price Chart</CardTitle>
            <div className="flex gap-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 rounded text-[10px] font-mono ${timeframe === tf ? "bg-emerald-900/60 text-emerald-300" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CandleChart symbol={selectedSymbol} timeframe={timeframe} />
        </CardContent>
      </Card>

      {/* Session Status */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm text-zinc-300">Market Session</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {sessionLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : session ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-zinc-800/50">
                <div className="text-[10px] text-zinc-500 mb-1">London Session</div>
                <div className={`text-lg font-semibold ${session.london_open ? "text-emerald-400" : "text-red-400"}`}>
                  {session.london_open ? "OPEN" : "CLOSED"}
                </div>
                <div className="text-xs text-zinc-600 mt-1">07:00 - 17:00 UTC</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-zinc-800/50">
                <div className="text-[10px] text-zinc-500 mb-1">NY Session</div>
                <div className={`text-lg font-semibold ${session.ny_open ? "text-emerald-400" : "text-red-400"}`}>
                  {session.ny_open ? "OPEN" : "CLOSED"}
                </div>
                <div className="text-xs text-zinc-500 mt-1">13:00 - 22:00 UTC</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-zinc-800/50 col-span-2 md:col-span-1">
                <div className="text-[10px] text-zinc-500 mb-1">Server Time</div>
                <div className="text-lg font-mono font-semibold text-zinc-100">
                  {formatDateTime(session.server_time_utc)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {session.trade_best_hours_only ? "Trade best hours only" : "Any hours"}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-zinc-600 text-sm">No session data</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}