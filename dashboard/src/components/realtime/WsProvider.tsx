"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { wsClient } from "@/lib/websocket-client";

export interface WsProviderProps {
  url: string;
  children: ReactNode;
}

/**
 * Real-time WebSocket provider.
 *
 * Starts the app-wide WebSocket connection and keeps it alive for the
 * lifetime of the React tree.
 */
export default function WsProvider({ url: _url, children }: WsProviderProps) {
  useEffect(() => {
    // The project already has a wsClient singleton that owns lifecycle.
    wsClient.connect();

    return () => {
      wsClient.softDisconnect();
    };
  }, []);

  return children;
}

