"use client"

import { useState, useCallback, useEffect } from "react"
import { usePositions, useCloseTrade } from "@/hooks/use-api"
import { useWsChannel } from "@/hooks/use-websocket"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils"
import { X, Pencil, RefreshCw } from "lucide-react"
import type { WsEvent } from "@/types/websocket"

export default function LiveTradesPage() {
  const { data, isLoading, refetch, isError } = usePositions()
  const closeTrade = useCloseTrade()
  const [autoRefresh, setAutoRefresh] = useState(true)

  const positions = data?.positions ?? []

  const handleWsEvent = useCallback((event: WsEvent) => {
    if (event.event === "TRADE_OPENED" || event.event === "TRADE_CLOSED") {
      refetch()
    }
  }, [refetch])

  useWsChannel("trades", handleWsEvent)

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => refetch(), 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, refetch])

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p className="text-lg font-medium">Failed to load positions</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-zinc-100">Live Trades ({positions.length})</h2>
          {autoRefresh && <RefreshCw className="h-3 w-3 text-zinc-500 animate-spin" />}
        </div>
        <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
          {autoRefresh ? "Pause Auto" : "Resume Auto"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : positions.length === 0 ? (
            <div className="p-6 text-center text-zinc-600 text-sm">No open positions</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-400 text-xs">
                    <th className="p-3 font-medium">Ticket</th>
                    <th className="p-3 font-medium">Symbol</th>
                    <th className="p-3 font-medium">Side</th>
                    <th className="p-3 font-medium text-right">Entry</th>
                    <th className="p-3 font-medium text-right">Current</th>
                    <th className="p-3 font-medium text-right">Profit</th>
                    <th className="p-3 font-medium text-right">Lots</th>
                    <th className="p-3 font-medium text-right">SL</th>
                    <th className="p-3 font-medium text-right">TP</th>
                    <th className="p-3 font-medium text-right">Dist SL</th>
                    <th className="p-3 font-medium text-right">Dist TP</th>
                    <th className="p-3 font-medium">Time Open</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => {
                    const distSL = pos.stop_loss ? Math.abs(pos.current_price - pos.stop_loss) : null
                    const distTP = pos.take_profit ? Math.abs(pos.current_price - pos.take_profit) : null
                    return (
                      <tr key={pos.ticket} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="p-3 font-mono text-xs text-zinc-100">{pos.ticket}</td>
                        <td className="p-3 text-zinc-100 font-medium">{pos.symbol}</td>
                        <td className="p-3">
                          <Badge className={pos.side === "BUY" ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}>
                            {pos.side}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-mono text-zinc-100">{formatNumber(pos.open_price, 5)}</td>
                        <td className="p-3 text-right font-mono text-zinc-100">{formatNumber(pos.current_price, 5)}</td>
                        <td className={`p-3 text-right font-mono ${pos.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {formatCurrency(pos.profit)}
                        </td>
                        <td className="p-3 text-right text-zinc-100">{pos.volume.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono text-zinc-400">{pos.stop_loss ? formatNumber(pos.stop_loss, 5) : "-"}</td>
                        <td className="p-3 text-right font-mono text-zinc-400">{pos.take_profit ? formatNumber(pos.take_profit, 5) : "-"}</td>
                        <td className="p-3 text-right text-zinc-400">{distSL != null ? distSL.toFixed(5) : "-"}</td>
                        <td className="p-3 text-right text-zinc-400">{distTP != null ? distTP.toFixed(5) : "-"}</td>
                        <td className="p-3 text-zinc-400 text-xs">{formatDateTime(pos.open_time)}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => closeTrade.mutate(pos.ticket)}
                              disabled={closeTrade.isPending}
                            >
                              <X className="h-3 w-3 mr-1" />Close
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                              <Pencil className="h-3 w-3 mr-1" />SL
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                              <Pencil className="h-3 w-3 mr-1" />TP
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}