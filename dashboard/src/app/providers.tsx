"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import WsProvider from "@/components/realtime/WsProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5_000,
            gcTime: 5 * 60_000,
            retry: 2,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Real-time WebSocket lifecycle */}
      <WsProvider url={process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"}>
        {children}
      </WsProvider>
    </QueryClientProvider>
  );
}