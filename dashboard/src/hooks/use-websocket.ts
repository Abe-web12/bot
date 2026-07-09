"use client"

import { useEffect, useRef } from "react"
import { wsClient } from "@/lib/websocket-client"
import { useWsStore } from "@/stores/ws-store"
import type { WsChannel, WsEvent } from "@/types/websocket"

export function useWebSocket() {
  const { setConnected, setCurrentSequence } = useWsStore()
  const connectedRef = useRef(false)

  useEffect(() => {
    wsClient.connect()
    connectedRef.current = true

    const unsub = wsClient.onConnection((connected) => {
      setConnected(connected)
    })

    return () => {
      unsub()
      if (connectedRef.current) {
        connectedRef.current = false
        wsClient.softDisconnect()
      }
    }
  }, [setConnected])
}

export function useWsChannel(channel: WsChannel, handler: (event: WsEvent) => void) {
  useEffect(() => {
    const unsub = wsClient.subscribe(channel, handler)
    return unsub
  }, [channel, handler])
}

export function useWsStatus() {
  return useWsStore((s) => ({ connected: s.connected, currentSequence: s.currentSequence }))
}