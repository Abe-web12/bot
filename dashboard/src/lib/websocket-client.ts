import { API_BASE } from "./api-client"
import type { WsChannel, WsEvent, WsServerMessage } from "@/types/websocket"

type EventHandler = (event: WsEvent) => void
type ConnectionHandler = (connected: boolean) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 50
  private reconnectDelay = 1000
  private subscribers = new Map<string, Set<EventHandler>>()
  private channelSubscribers = new Map<WsChannel, Set<EventHandler>>()
  private connectionHandlers = new Set<ConnectionHandler>()
  private _connected = false
  private _currentSequence = 0
  private subscribedChannels = new Set<WsChannel>()
  private destroyed = false

  get connected() { return this._connected }
  get currentSequence() { return this._currentSequence }

  connect() {
    if (this.destroyed) return
    if (this.ws?.readyState === WebSocket.OPEN) return

    const wsBase = API_BASE.replace(/^http/, "ws")
    this.ws = new WebSocket(`${wsBase}/ws`)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const data: WsServerMessage = JSON.parse(event.data)
        this.handleMessage(data)
      } catch { }
    }

    this.ws.onclose = () => {
      this._connected = false
      this.notifyConnection(false)
      this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  private handleMessage(data: WsServerMessage) {
    if ("action" in data) {
      if (data.action === "connected") {
        this._connected = true
        this._currentSequence = data.current_sequence
        this.notifyConnection(true)
        for (const channel of this.subscribedChannels) {
          this.send({ action: "subscribe", channel })
        }
      } else if (data.action === "ping") {
        this.send({ action: "pong" })
      }
      return
    }

    if ("channel" in data && "event" in data) {
      const event = data as WsEvent
      this._currentSequence = event.sequence
      const channelHandlers = this.channelSubscribers.get(event.channel as WsChannel)
      if (channelHandlers) {
        for (const handler of channelHandlers) {
          handler(event)
        }
      }
    }
  }

  private send(msg: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  subscribe(channel: WsChannel, handler: EventHandler): () => void {
    if (!this.channelSubscribers.has(channel)) {
      this.channelSubscribers.set(channel, new Set())
    }
    this.channelSubscribers.get(channel)!.add(handler)
    this.subscribedChannels.add(channel)

    if (this._connected) {
      this.send({ action: "subscribe", channel })
    }

    return () => {
      this.channelSubscribers.get(channel)?.delete(handler)
      if (this.channelSubscribers.get(channel)?.size === 0) {
        this.subscribedChannels.delete(channel)
        if (this._connected) {
          this.send({ action: "unsubscribe", channel })
        }
      }
    }
  }

  onConnection(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler)
    return () => this.connectionHandlers.delete(handler)
  }

  private notifyConnection(connected: boolean) {
    for (const handler of this.connectionHandlers) {
      handler(connected)
    }
  }

  private scheduleReconnect() {
    if (this.destroyed) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return
    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), 30000)
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  replay(channel: string, sinceSequence: number) {
    this.send({ action: "replay", channel, since_sequence: sinceSequence })
  }

  softDisconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
    this._connected = false
    this.notifyConnection(false)
  }

  disconnect() {
    this.destroyed = true
    this.softDisconnect()
  }
}

export const wsClient = new WebSocketClient()