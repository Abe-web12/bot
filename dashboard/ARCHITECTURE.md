# Forex Trading Bot Dashboard — Architecture Report

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styles | TailwindCSS 4 |
| UI Library | shadcn/ui (Radix primitives) |
| State (Server) | React Query (TanStack Query 5) |
| State (Client) | Zustand 5 (persisted) |
| Charts | Recharts 3 |
| Forms | React Hook Form |
| Animations | Framer Motion |
| Icons | Lucide React |
| Layout | react-resizable-panels |
| WebSocket | Native WebSocket with auto-reconnect |

## Project Structure

```
dashboard/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout with Providers
│   │   ├── page.tsx                  # Redirects to /login
│   │   ├── providers.tsx             # React Query provider
│   │   ├── globals.css               # Tailwind + dark theme
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   └── dashboard/
│   │       ├── layout.tsx            # Dashboard shell layout
│   │       ├── page.tsx              # Main dashboard home
│   │       ├── live-trades/page.tsx  # Live open positions
│   │       ├── trade-history/page.tsx # Closed trades with export
│   │       ├── signals/page.tsx      # Signal evaluation + scores
│   │       ├── market/page.tsx       # Live market data
│   │       ├── analytics/page.tsx    # Performance analytics
│   │       ├── risk/page.tsx         # Risk metrics
│   │       ├── journal/page.tsx      # Strategy journal
│   │       ├── logs/page.tsx         # Structured logs
│   │       ├── notifications/page.tsx # Notifications center
│   │       └── settings/page.tsx     # Config + bot controls
│   ├── components/
│   │   ├── ui/                       # shadcn UI primitives (16 components)
│   │   ├── layout/                   # Sidebar, StatusBar, DashboardLayout
│   │   └── dashboard/                # StatCard, DataTable, ChartContainer, etc.
│   ├── hooks/
│   │   ├── use-api.ts               # 40+ React Query hooks (every API endpoint)
│   │   ├── use-auth.ts              # Authentication hook
│   │   └── use-websocket.ts         # WebSocket connection + channel hooks
│   ├── stores/
│   │   ├── auth-store.ts            # JWT token persistence
│   │   ├── app-store.ts             # Sidebar/layout state
│   │   └── ws-store.ts              # WebSocket connection state
│   ├── types/
│   │   ├── api.ts                   # All API response types
│   │   └── websocket.ts             # WebSocket event types
│   └── lib/
│       ├── utils.ts                 # cn(), formatCurrency(), formatPercent(), etc.
│       ├── api-client.ts            # Fetch wrapper with auto-refresh, error handling
│       └── websocket-client.ts      # WebSocket with auto-reconnect, channels, replay
```

## Pages & API Integration

| Page | API Endpoints Used | Refetch Interval |
|------|-------------------|-----------------|
| **Dashboard** | `/api/dashboard/snapshot`, `/api/account`, `/api/status`, `/api/charts/*` (7) | 5-60s |
| **Live Trades** | `/api/positions`, WS `trades` channel, `/api/trades/:ticket/close` | 5s + WebSocket |
| **Trade History** | `/api/trades` (paginated), `/api/trades/export.csv`, `/api/trades/export.xlsx` | On demand |
| **Signals** | `/api/strategy/score/:symbol`, `/api/strategy/signal/:symbol`, `/api/strategy/indicators/:symbol`, `/api/strategy/history` | 30s |
| **Market** | `/api/market/price/:symbol`, `/api/market/candles/:symbol`, `/api/market/spread/:symbol`, `/api/market/atr/:symbol`, `/api/market/trend/:symbol`, `/api/market/session`, `/api/market/liquidity/:symbol` | 3-60s |
| **Analytics** | `/api/analytics`, `/api/charts/monthly-stats`, `/api/charts/daily-stats`, `/api/charts/win-loss-distribution`, `/api/charts/trade-duration`, `/api/charts/session-performance`, `/api/charts/heatmap` | 15-120s |
| **Risk** | `/api/risk/current` | 10s |
| **Journal** | `/api/journal` (filters: entry_type, symbol) | 15s |
| **Logs** | `/api/logs` (filters: level, lines) | 15s |
| **Notifications** | `/api/notifications`, `/api/notifications/queue`, `/api/notifications/test` | 15s |
| **Settings** | `/api/settings` GET/POST, `/api/bot/*` (start/stop/pause/resume) | On demand |

## WebSocket Integration

- **Connection**: Auto-connects on login, auto-reconnect with exponential backoff (up to 30s)
- **Protocol**: JWT auth on connect, subscribe/unsubscribe channels
- **Channels consumed**: `trades`, `account`, `signals`, `risk`, `health`, `bot`
- **Events handled**: TRADE_OPENED, TRADE_CLOSED, SIGNAL_GENERATED, ACCOUNT_TICK, etc.
- **Replay**: Supports `replay` action for missed events after reconnect

## Data Flow

```
Backend (Flask) → REST API / WS → api-client.ts / websocket-client.ts
  → React Query (caching/refetching) + Zustand (client state)
  → React components (real-time updates via query refetches + WebSocket callbacks)
```

## Key Architecture Decisions

1. **No fake data**: Every UI element consumes real backend data via React Query hooks
2. **WebSocket for real-time**: Trade updates, account ticks pushed via WS; REST for initial load
3. **Auto-refresh fallback**: All live-data queries have refetch intervals as backup when WS not available
4. **Persisted layout**: Sidebar state saved to localStorage via Zustand persist middleware
5. **JWT auto-refresh**: API client automatically refreshes expired tokens
6. **Dark mode only**: Professional trading UI - no light mode toggles

## Remaining UI Gaps

- [ ] Bot control confirmation dialogs (start/stop/restart)
- [ ] Modify SL/TP modal for live trades
- [ ] Trade detail drawer with full timeline
- [ ] Real candlestick chart library (need to integrate a proper one)
- [ ] Price alert configuration
- [ ] Multi-language support
- [ ] PWA/offline mode
- [ ] advanced keyboard shortcuts help modal

## Deployment Instructions

```bash
# Build
cd dashboard
npm run build

# Run in production
npm start

# Or with custom env
NEXT_PUBLIC_API_URL=http://your-server:5000 npm start

# The backend must be running on the configured API_URL
# Default: http://localhost:5000
```
