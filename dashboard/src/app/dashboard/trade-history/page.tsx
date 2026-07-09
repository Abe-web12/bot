"use client"

import { useState } from "react"
import { useTrades, tradeExportCsvUrl, tradeExportXlsxUrl } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDateTime, formatDuration, formatPercent } from "@/lib/utils"
import { ChevronDown, ChevronUp, Download, Search, ArrowUpDown } from "lucide-react"
import type { Trade } from "@/types/api"

export default function TradeHistoryPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [symbolFilter, setSymbolFilter] = useState("")
  const [sort, setSort] = useState<string | undefined>()
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")

  const { data, isLoading, isError, refetch } = useTrades(page, pageSize, symbolFilter || undefined, sort)

  const handleSort = (col: string) => {
    setSort((prev) => (prev === col ? `-${col}` : col))
  }

  const handleSearch = () => {
    setSymbolFilter(searchInput)
    setPage(1)
  }

  const winRate = data?.win_rate
  const trades = data?.items || []
  const pagination = data?.pagination

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">Failed to load trade history</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Win Rate Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-zinc-400 mb-1">Total Trades</div>
            <div className="text-lg font-semibold text-zinc-100">{winRate?.total ?? (isLoading ? <Skeleton className="h-6 w-16" /> : "-")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-zinc-400 mb-1">Wins / Losses</div>
            <div className="text-lg font-semibold text-zinc-100">
              {isLoading ? <Skeleton className="h-6 w-20" /> : `${winRate?.wins ?? 0} / ${winRate?.losses ?? 0}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-zinc-400 mb-1">Win Rate</div>
            <div className="text-lg font-semibold text-emerald-400">
              {isLoading ? <Skeleton className="h-6 w-20" /> : formatPercent(winRate?.win_rate_pct)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Export */}
      <div className="flex items-center gap-3">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Filter by symbol..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-xs"
          />
          <Button variant="secondary" size="sm" onClick={handleSearch}>
            <Search className="h-3 w-3 mr-1" />Filter
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={tradeExportCsvUrl(symbolFilter || undefined)}><Search className="h-3 w-3 mr-1" />CSV</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={tradeExportXlsxUrl(symbolFilter || undefined)}><Search className="h-3 w-3 mr-1" />Excel</a>
          </Button>
        </div>
      </div>

      {/* Trades Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : trades.length === 0 ? (
            <div className="p-6 text-center text-zinc-600 text-sm">No trades found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-400 text-xs">
                    {["Symbol", "Side", "Entry", "Exit", "Volume", "Profit", "Open Time", "Close Time", "Duration", ""].map((col) => (
                      <th key={col} className="p-3 font-medium cursor-pointer hover:text-zinc-200" onClick={() => col && handleSort(col.toLowerCase().replace(" ", "_"))}>
                        <span className="flex items-center gap-1">{col}{col && <ArrowUpDown className="h-3 w-3" />}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <>
                      <tr
                        key={trade.id}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === trade.id ? null : trade.id)}
                      >
                        <td className="p-3 text-zinc-100 font-medium">{trade.symbol}</td>
                        <td className="p-3">
                          <Badge className={trade.side === "BUY" ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}>{trade.side}</Badge>
                        </td>
                        <td className="p-3 font-mono text-zinc-100">{trade.open_price.toFixed(5)}</td>
                        <td className="p-3 font-mono text-zinc-100">{trade.close_price ? trade.close_price.toFixed(5) : "-"}</td>
                        <td className="p-3 text-zinc-100">{trade.volume.toFixed(2)}</td>
                        <td className={`p-3 font-mono ${(trade.profit ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {formatCurrency(trade.profit)}
                        </td>
                        <td className="p-3 text-xs text-zinc-400">{formatDateTime(trade.open_time)}</td>
                        <td className="p-3 text-xs text-zinc-400">{formatDateTime(trade.close_time)}</td>
                        <td className="p-3 text-zinc-400 text-xs">{trade.close_reason || "-"}</td>
                        <td className="p-3">
                          {expandedRow === trade.id ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                        </td>
                      </tr>
                      {expandedRow === trade.id && (
                        <tr key={`${trade.id}-detail`} className="bg-zinc-900/50">
                          <td colSpan={10} className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-zinc-500 text-xs">SL Hit</span>
                                <div className="text-zinc-100">{trade.close_reason === "SL" ? "Yes" : "No"}</div>
                              </div>
                              <div>
                                <span className="text-zinc-500 text-xs">TP Hit</span>
                                <div className="text-zinc-100">{trade.close_reason === "TP" ? "Yes" : "No"}</div>
                              </div>
                              <div>
                                <span className="text-zinc-500 text-xs">Manual Close</span>
                                <div className="text-zinc-100">{trade.close_reason === "MANUAL" ? "Yes" : "No"}</div>
                              </div>
                              <div>
                                <span className="text-zinc-500 text-xs">Partial Close</span>
                                <div className="text-zinc-100">{trade.close_reason?.includes("PARTIAL") ? "Yes" : "No"}</div>
                              </div>
                              <div>
                                <span className="text-zinc-500 text-xs">Commission</span>
                                <div className="text-zinc-100">-</div>
                              </div>
                              <div>
                                <span className="text-zinc-500 text-xs">Swap</span>
                                <div className="text-zinc-100">-</div>
                              </div>
                              <div>
                                <span className="text-zinc-500 text-xs">Duration</span>
                                <div className="text-zinc-100">{formatDuration(trade.open_time, trade.close_time)}</div>
                              </div>
                              <div>
                                <span className="text-zinc-500 text-xs">Ticket</span>
                                <div className="text-zinc-100">{trade.mt5_ticket}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Page {pagination.page} of {pagination.total_pages} ({pagination.total_items} total trades)
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </Button>
            {Array.from({ length: Math.min(5, pagination.total_pages) }).map((_, i) => {
              const pageNum = i + 1
              return (
                <Button key={i} variant={pageNum === page ? "default" : "outline"} size="sm" onClick={() => setPage(pageNum)}>
                  {pageNum}
                </Button>
              )
            })}
            <Button variant="outline" size="sm" disabled={page >= pagination.total_pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}