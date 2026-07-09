"use client"

import { useWsStatus } from "@/hooks/use-websocket"
import { useBotStatus, useMT5Health, useDatabaseStatus } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function StatusBar() {
  const { connected: wsConnected } = useWsStatus()
  const { data: botStatus } = useBotStatus()
  const { data: mt5Health } = useMT5Health()
  const { data: dbStatus } = useDatabaseStatus()
  const [serverTime, setServerTime] = useState<string>("")

  useEffect(() => {
    const update = () => setServerTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-7 bg-zinc-950 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center px-4 gap-3 z-50">
      <div className="flex items-center gap-1.5">
        <div className={cn("h-1.5 w-1.5 rounded-full", botStatus?.connection_status === "connected" ? "bg-emerald-500" : "bg-red-500")} />
        <span>Bot: <span className="text-zinc-400">{botStatus?.bot_status ?? "?"}</span></span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className={cn("h-1.5 w-1.5 rounded-full", mt5Health?.connected ? "bg-emerald-500" : "bg-red-500")} />
        <span>MT5: <span className="text-zinc-400">{mt5Health?.connection_status ?? "?"}</span></span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className={cn("h-1.5 w-1.5 rounded-full", wsConnected ? "bg-emerald-500" : "bg-red-500")} />
        <span>WS: <span className="text-zinc-400">{wsConnected ? "live" : "off"}</span></span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className={cn("h-1.5 w-1.5 rounded-full", dbStatus?.connected ? "bg-emerald-500" : "bg-red-500")} />
        <span>DB: <span className="text-zinc-400">{dbStatus?.connected ? "ok" : "down"}</span></span>
      </div>

      {mt5Health && (
        <>
          <span className="text-zinc-700">|</span>
          <span className={cn(mt5Health.is_demo ? "text-amber-400" : "text-emerald-400")}>
            {mt5Health.is_demo ? "DEMO" : "LIVE"}
          </span>
        </>
      )}

      {mt5Health?.latency_ms != null && (
        <>
          <span className="text-zinc-700">|</span>
          <span>{mt5Health.latency_ms.toFixed(0)}ms</span>
        </>
      )}

      <span className="ml-auto font-mono text-zinc-400">{serverTime}</span>
    </footer>
  )
}
