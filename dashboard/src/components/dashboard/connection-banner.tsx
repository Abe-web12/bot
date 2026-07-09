"use client"

import { useWsStore } from "@/stores/ws-store"

export function ConnectionBanner() {
  const connected = useWsStore((s) => s.connected)

  if (connected) return null

  return (
    <div className="animate-pulse bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
      <span className="text-xs font-medium text-amber-400">Connection lost. Reconnecting...</span>
    </div>
  )
}