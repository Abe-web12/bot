"use client"

import { useState, useCallback, useMemo } from "react"
import { useAccount, usePositions, useCloseTrade, useBotAction, useMarketPrice, useMarketCandles, useMarketSpread, useMarketATR, useMarketTrend, useMarketLiquidity } from "@/hooks/use-api"
import { useWsChannel, useWsStatus } from "@/hooks/use-websocket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { formatCurrency, formatNumber, formatDateTime } from "@/lib/utils"
import { TrendingUp, TrendingDown, Activity, DollarSign, Zap, BarChart3, Waves, Crosshair, Gauge, X, Pencil } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ComposedChart, Line } from "recharts"
import type { WsEvent } from "@/types/websocket"

const TRADABLE_SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "GBPJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD", "EURJPY", "EURGBP"]
const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"]

const QUICK_VOLUMES = [0.01, 0.05, 0.1, 0.5, 1.0]

function ChartToolTip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !(payload as Array<Record<string, unknown>>)?.length) return null
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900/95 p-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="text-zinc-400 mb-1">{label as string}</p>
      {(payload as Array<{ color: string; name: string; value: number }>).map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value.toFixed(5)}</p>
      ))}
    </div>
  )
}

export default function TradingTerminalPage() {
  const [symbol, setSymbol] = useState("EURUSD")
  const [timeframe, setTimeframe] = useState("H1")
  const [orderType, setOrderType] = useState("MARKET")
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY")
  const [orderVolume, setOrderVolume] = useState("0.01")
  const [orderPrice, setOrderPrice] = useState("")
  const [orderSL, setOrderSL] = useState("")
  const [orderTP, setOrderTP] = useState("")

  const { data: account, isLoading: acctLoading } = useAccount()
  const { data: positionsData, isLoading: posLoading, refetch: refetchPositions } = usePositions()
  const closeTrade = useCloseTrade()
  const botAction = useBotAction()

  const { data: price, isLoading: priceLoading } = useMarketPrice(symbol)
  const { data: candles, isLoading: candlesLoading } = useMarketCandles(symbol, timeframe)
  const { data: spread } = useMarketSpread(symbol)
  const { data: atr } = useMarketATR(symbol, timeframe)
  const { data: trend } = useMarketTrend(symbol, timeframe)
  const { data: liquidity } = useMarketLiquidity(symbol)

  const positions = positionsData?.positions ?? []

  // WS updates
  const handleWsEvent = useCallback((event: WsEvent) => {
    if (event.channel === "trades" || event.event === "MARKET_TICK") {
    }
  }, [])
  useWsChannel("trades", handleWsEvent)
  useWsChannel("market", handleWsEvent)
  useWsChannel("account", handleWsEvent)

  const chartData = useMemo(() => {
    if (!candles?.candles?.length) return []
    return candles.candles.map((c) => ({
      time: new Date(c.time).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }))
  }, [candles])

  const candleOHLC = useMemo(() => {
    if (!chartData.length) return { high: 0, low: 0 }
    const high = Math.max(...chartData.map((c) => c.high))
    const low = Math.min(...chartData.map((c) => c.low))
    return { high, low }
  }, [chartData])

  const handlePlaceOrder = () => {
    const volume = parseFloat(orderVolume)
    if (isNaN(volume) || volume <= 0) return
    // Would call API to place order
  }

  return (
    <TooltipProvider>
      <div className="p-3 space-y-3">
      {/* Top Bar - Account & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          {/* Symbol Selector */}
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-28 h-8 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRADABLE_SYMBOLS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs font-mono">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Timeframe Selector */}
          <div className="flex gap-0.5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
                  timeframe === tf
                    ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Account Quick Stats */}
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-zinc-500">B: <span className="text-zinc-200 font-mono tabular-nums">{acctLoading ? "..." : formatCurrency(account?.balance)}</span></span>
          <span className="text-zinc-500">E: <span className="text-zinc-200 font-mono tabular-nums">{acctLoading ? "..." : formatCurrency(account?.equity)}</span></span>
          <span className="text-zinc-500">FM: <span className="text-zinc-200 font-mono tabular-nums">{acctLoading ? "..." : formatCurrency(account?.free_margin)}</span></span>
          <span className="text-zinc-500">ML: <span className="text-zinc-200 font-mono tabular-nums">{acctLoading || account?.margin_level == null ? "..." : `${account.margin_level.toFixed(1)}%`}</span></span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-3">
        {/* Left: Chart */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Bid/Ask/Spread Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-zinc-300 font-medium">{symbol}</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">Bid</span>
                  <span className="text-emerald-400 font-bold font-mono tabular-nums text-lg">{priceLoading || !price ? "..." : price.bid.toFixed(5)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">Ask</span>
                  <span className="text-red-400 font-bold font-mono tabular-nums text-lg">{priceLoading || !price ? "..." : price.ask.toFixed(5)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500">Spread</span>
                <span className="font-mono text-zinc-300">{spread?.current_spread_pips?.toFixed(1) ?? "-"} pips</span>
              </div>
            </div>

            {/* Price Chart */}
            <div className="h-[320px]">
              {candlesLoading ? (
                <Skeleton className="h-full w-full" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fill: "#52525b", fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis domain={["auto", "auto"]} tick={{ fill: "#52525b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(4)} />
                    <RechartsTooltip content={<ChartToolTip />} />
                    <Area type="monotone" dataKey="close" stroke="#10b981" fill="url(#priceGrad)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-700 text-xs">No chart data</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Market Info + Order Panel */}
        <div className="space-y-3">
          {/* Market Info */}
          <Card>
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Market Info</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Trend</span>
                <span className={`font-mono font-medium ${trend?.direction === "UP" ? "text-emerald-400" : trend?.direction === "DOWN" ? "text-red-400" : "text-zinc-400"}`}>
                  {trend?.direction ?? "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">ATR</span>
                <span className="font-mono text-zinc-300">{atr?.atr?.toFixed(1) ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Volume</span>
                <span className="font-mono text-zinc-300">{liquidity?.tick_volume_current?.toLocaleString() ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Liquidity</span>
                <span className={`font-mono ${liquidity?.tick_volume_ratio != null && liquidity.tick_volume_ratio > 1 ? "text-emerald-400" : "text-zinc-300"}`}>
                  {liquidity?.tick_volume_ratio != null ? `${(liquidity.tick_volume_ratio * 100).toFixed(0)}%` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">ADX</span>
                <span className="font-mono text-zinc-300">{trend?.adx?.toFixed(1) ?? "-"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Panel */}
          <Card>
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Order Panel</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-2">
              <Tabs value={orderType} onValueChange={setOrderType}>
                <TabsList className="w-full bg-zinc-800">
                  <TabsTrigger value="MARKET" className="flex-1 text-[10px] py-1">Market</TabsTrigger>
                  <TabsTrigger value="LIMIT" className="flex-1 text-[10px] py-1">Limit</TabsTrigger>
                  <TabsTrigger value="STOP" className="flex-1 text-[10px] py-1">Stop</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={orderSide === "BUY" ? "default" : "outline"}
                  className={`flex-1 text-xs h-7 ${orderSide === "BUY" ? "bg-emerald-600 hover:bg-emerald-500" : "border-zinc-700"}`}
                  onClick={() => setOrderSide("BUY")}
                >
                  Buy
                </Button>
                <Button
                  size="sm"
                  variant={orderSide === "SELL" ? "default" : "outline"}
                  className={`flex-1 text-xs h-7 ${orderSide === "SELL" ? "bg-red-600 hover:bg-red-500" : "border-zinc-700"}`}
                  onClick={() => setOrderSide("SELL")}
                >
                  Sell
                </Button>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500">Volume (lots)</label>
                <Input
                  type="number"
                  value={orderVolume}
                  onChange={(e) => setOrderVolume(e.target.value)}
                  step={0.01}
                  min={0.01}
                  className="border-zinc-700 bg-zinc-800 text-xs h-7 text-zinc-100"
                />
                <div className="flex gap-1 mt-1">
                  {QUICK_VOLUMES.map((v) => (
                    <button
                      key={v}
                      onClick={() => setOrderVolume(String(v))}
                      className="flex-1 px-1 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500">Stop Loss</label>
                  <Input
                    type="number"
                    value={orderSL}
                    onChange={(e) => setOrderSL(e.target.value)}
                    placeholder="Price"
                    className="border-zinc-700 bg-zinc-800 text-xs h-7 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500">Take Profit</label>
                  <Input
                    type="number"
                    value={orderTP}
                    onChange={(e) => setOrderTP(e.target.value)}
                    placeholder="Price"
                    className="border-zinc-700 bg-zinc-800 text-xs h-7 text-zinc-100"
                  />
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                className={`w-full text-xs h-8 ${orderSide === "BUY" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"}`}
              >
                {orderSide === "BUY" ? "Buy" : "Sell"} {symbol}
              </Button>
            </CardContent>
          </Card>

          {/* Bot Controls */}
          <Card>
            <CardContent className="p-3 flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" className="flex-1 text-xs border-emerald-700 text-emerald-400 hover:bg-emerald-950 h-7"
                    onClick={() => botAction.mutate({ action: "start" })} disabled={botAction.isPending}>
                    Start
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Start bot</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" className="flex-1 text-xs border-amber-700 text-amber-400 hover:bg-amber-950 h-7"
                    onClick={() => botAction.mutate({ action: "pause" })} disabled={botAction.isPending}>
                    Pause
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pause bot</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" className="flex-1 text-xs border-red-700 text-red-400 hover:bg-red-950 h-7"
                    onClick={() => botAction.mutate({ action: "stop" })} disabled={botAction.isPending}>
                    Stop
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Stop bot</TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Open Positions Table */}
      <Card>
        <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Open Positions ({positions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {posLoading ? (
            <div className="p-4"><Skeleton className="h-20 w-full" /></div>
          ) : positions.length === 0 ? (
            <div className="p-6 text-center text-zinc-600 text-xs">No open positions</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-500">
                    <th className="p-2 font-medium">Ticket</th>
                    <th className="p-2 font-medium">Symbol</th>
                    <th className="p-2 font-medium">Side</th>
                    <th className="p-2 font-medium text-right">Entry</th>
                    <th className="p-2 font-medium text-right">Current</th>
                    <th className="p-2 font-medium text-right">Profit</th>
                    <th className="p-2 font-medium text-right">Lots</th>
                    <th className="p-2 font-medium text-right">SL</th>
                    <th className="p-2 font-medium text-right">TP</th>
                    <th className="p-2 font-medium">Time</th>
                    <th className="p-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.ticket} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                      <td className="p-2 font-mono text-zinc-300">{pos.ticket}</td>
                      <td className="p-2 font-medium text-zinc-200">{pos.symbol}</td>
                      <td className="p-2">
                        <Badge className={`text-[10px] px-1 py-0 ${pos.side === "BUY" ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}`}>{pos.side}</Badge>
                      </td>
                      <td className="p-2 text-right font-mono text-zinc-300">{pos.open_price.toFixed(5)}</td>
                      <td className="p-2 text-right font-mono text-zinc-300">{pos.current_price.toFixed(5)}</td>
                      <td className={`p-2 text-right font-mono font-medium ${pos.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(pos.profit)}</td>
                      <td className="p-2 text-right font-mono text-zinc-300">{pos.volume.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono text-zinc-500">{pos.stop_loss?.toFixed(5) ?? "-"}</td>
                      <td className="p-2 text-right font-mono text-zinc-500">{pos.take_profit?.toFixed(5) ?? "-"}</td>
                      <td className="p-2 text-zinc-500 text-[10px]">{formatDateTime(pos.open_time)}</td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => closeTrade.mutate(pos.ticket)}
                                className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/50 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Close trade</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-1 rounded text-zinc-500 hover:text-blue-400 hover:bg-blue-950/50 transition-colors">
                                <Pencil className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Modify SL/TP</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  )
}