"use client"

import { useState, useEffect, useRef } from "react"
import { useLogs } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils"
import { AlertCircle, Info, AlertTriangle, XCircle, FileJson } from "lucide-react"
import type { LogEntry } from "@/types/api"

const SEVERITIES = ["", "INFO", "WARNING", "ERROR", "CRITICAL"]

const severityIcon = (level: string) => {
  switch (level) {
    case "CRITICAL": return <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
    case "ERROR": return <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
    case "WARNING": return <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
    default: return <Info className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
  }
}

const severityClass = (level: string) => {
  switch (level) {
    case "CRITICAL": return "bg-red-900/70 text-red-300"
    case "ERROR": return "bg-red-900/50 text-red-300"
    case "WARNING": return "bg-amber-900/50 text-amber-300"
    case "INFO": return "bg-blue-900/50 text-blue-300"
    default: return "bg-zinc-800 text-zinc-400"
  }
}

const hasExtra = (log: LogEntry) =>
  Object.keys(log).filter((k) => !["level", "message", "logger", "timestamp"].includes(k)).length > 0

const getExtra = (log: LogEntry) =>
  Object.fromEntries(Object.entries(log).filter(([k]) => !["level", "message", "logger", "timestamp"].includes(k)))

export default function LogsPage() {
  const [level, setLevel] = useState("")
  const [searchFilter, setSearchFilter] = useState("")
  const [liveUpdates, setLiveUpdates] = useState(true)
  const [jsonModal, setJsonModal] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isError, refetch } = useLogs(100, level || undefined)
  const logs = data?.logs || []

  const filteredLogs = searchFilter
    ? logs.filter((l: LogEntry) =>
        l.message?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        l.logger?.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : logs

  useEffect(() => {
    if (!liveUpdates) return
    const interval = setInterval(() => refetch(), 15000)
    return () => clearInterval(interval)
  }, [liveUpdates, refetch])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredLogs.length])

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p className="text-lg font-medium">Failed to load logs</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {SEVERITIES.map((sev) => (
            <button
              key={sev || "all"}
              onClick={() => setLevel(sev)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${level === sev ? "bg-zinc-700 text-zinc-100" : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"}`}
            >
              {sev || "ALL"}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px] max-w-xs">
          <Input placeholder="Search logs..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} className="text-xs" />
        </div>
        <Button variant="outline" size="sm" onClick={() => setLiveUpdates(!liveUpdates)}>
          {liveUpdates ? "Pause" : "Live"}
        </Button>
      </div>

      {jsonModal && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">Structured Data</span>
              <button className="text-xs text-zinc-500 hover:text-zinc-300" onClick={() => setJsonModal(null)}>Close</button>
            </div>
            <pre className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg overflow-x-auto max-h-60">{jsonModal}</pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-6 text-center text-zinc-600 text-sm">No logs matching filter</div>
          ) : (
            <div ref={scrollRef} className="max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log: LogEntry, i: number) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2 border-b border-zinc-800/30 hover:bg-zinc-800/20 text-xs">
                  {severityIcon(log.level)}
                  <Badge className={`text-[10px] shrink-0 ${severityClass(log.level)}`}>{log.level}</Badge>
                  <span className="font-mono text-zinc-500 shrink-0 w-20">{formatDateTime(log.timestamp)}</span>
                  <span className="text-zinc-600 shrink-0 w-24 truncate">{log.logger}</span>
                  <span className="text-zinc-200 flex-1 break-words">{log.message}</span>
                  {hasExtra && hasExtra(log) && (
                    <button
                      className="text-zinc-500 hover:text-zinc-300 shrink-0"
                      onClick={() => setJsonModal(JSON.stringify(getExtra(log), null, 2))}
                      title="View structured data"
                    >
                      <FileJson className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-zinc-500">
        Showing {filteredLogs.length} of {data?.count ?? logs.length} logs (auto-refresh: {liveUpdates ? "ON" : "OFF"})
      </div>
    </div>
  )
}