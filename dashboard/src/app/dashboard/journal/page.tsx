"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { useJournal } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDateTime, formatCurrency } from "@/lib/utils"
import { ChevronDown, ChevronUp, FileJson } from "lucide-react"

export default function JournalPage() {
  const [entryType, setEntryType] = useState("")
  const [symbol, setSymbol] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data, isLoading, isError, refetch } = useJournal(100, entryType || undefined, symbol || undefined)
  const entries = data?.entries || []

  const entryTypes = [...new Set(entries.map((e: any) => e.entry_type).filter(Boolean))] as string[]
  const symbols = [...new Set(entries.map((e: any) => e.symbol).filter(Boolean))] as string[]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p className="text-lg font-medium">Failed to load journal</p>
          <button className="text-sm underline mt-2" onClick={() => refetch()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <Select value={entryType} onValueChange={(v) => setEntryType(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Entry Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {entryTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={symbol} onValueChange={(v) => setSymbol(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Symbol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Symbols</SelectItem>
            {symbols.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-xs text-zinc-500 self-center ml-auto">{data?.count ?? 0} entries</div>
      </div>

      {/* Journal Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-6 text-center text-zinc-600 text-sm">No journal entries</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-400 text-xs">
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Symbol</th>
                    <th className="p-3 font-medium">Side</th>
                    <th className="p-3 font-medium">Price</th>
                    <th className="p-3 font-medium">Confidence</th>
                    <th className="p-3 font-medium">Reason</th>
                    <th className="p-3 font-medium">Time</th>
                    <th className="p-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry: any) => (
                    <>
                      <tr
                        key={entry.id}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      >
                        <td className="p-3">
                          <Badge className="bg-zinc-800 text-zinc-300 text-[10px]">{entry.entry_type}</Badge>
                        </td>
                        <td className="p-3 text-zinc-100">{entry.symbol || "-"}</td>
                        <td className="p-3">
                          {entry.side ? (
                            <Badge className={entry.side === "BUY" ? "bg-emerald-900/60 text-emerald-300" : entry.side === "SELL" ? "bg-red-900/60 text-red-300" : ""}>
                              {entry.side}
                            </Badge>
                          ) : "-"}
                        </td>
                        <td className="p-3 font-mono text-zinc-100">{entry.price?.toFixed(5) ?? "-"}</td>
                        <td className="p-3 text-zinc-100">{entry.confidence != null ? `${entry.confidence.toFixed(1)}%` : "-"}</td>
                        <td className="p-3 text-zinc-400 max-w-[200px] truncate">{entry.reason || "-"}</td>
                        <td className="p-3 text-xs text-zinc-400">{formatDateTime(entry.occurred_at)}</td>
                        <td className="p-3">
                          {expandedId === entry.id ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                        </td>
                      </tr>
                      {expandedId === entry.id && (
                        <tr className="bg-zinc-900/50" key={`${entry.id}-detail`}>
                          <td colSpan={8} className="p-4">
                            {entry.payload && Object.keys(entry.payload).length > 0 ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-zinc-500 mb-2">
                                  <FileJson className="h-3 w-3" /> Payload
                                </div>
                                <pre className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg overflow-x-auto max-h-48">
                                  {JSON.stringify(entry.payload, null, 2)}
                                </pre>
                              </div>
                            ) : (
                              <div className="text-xs text-zinc-600">No additional payload data</div>
                            )}
                            {entry.execution_id && (
                              <div className="mt-2 text-xs text-zinc-500">Execution ID: {entry.execution_id}</div>
                            )}
                            {entry.mt5_ticket && (
                              <div className="text-xs text-zinc-500">MT5 Ticket: {entry.mt5_ticket}</div>
                            )}
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
    </div>
  )
}