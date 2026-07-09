# TODO - ForexBot Frontend Cleanup (Single-User Trading Terminal)

## Phase 1: Cleanup Plan (route/auth/marketing)
- [ ] Read and confirm all auth/marketing-related imports and routing usage.
- [ ] Replace `dashboard/src/app/page.tsx` so `/` boots into the terminal (no landing page).
- [ ] Remove auth/SaaS routes and UI pages under `dashboard/src/app/`:
  - [ ] `login/`, `register/`, `forgot-password/`, `reset-password/`, `verify-email/`
  - [ ] `profile/`, `subscription/`, `workspaces/`
- [ ] Remove auth guards from layout:
  - [ ] Update `dashboard/src/components/layout/dashboard-layout.tsx` to remove `useAuth` gating and user menu.
- [ ] Remove auth dependencies used only for gating:
  - [ ] Delete `dashboard/src/hooks/use-auth.ts`
  - [ ] Delete `dashboard/src/stores/auth-store.ts`
  - [ ] Clean `dashboard/src/lib/api-client.ts` and `dashboard/src/hooks/use-websocket.ts`/token wiring if they depend on removed auth.

## Phase 2: Remove dead code/components/assets
- [ ] Remove unused routes/components/layouts that were only used for auth/marketing.
- [ ] Remove unused assets/styles referenced only by removed pages.
- [ ] Clean orphaned dependencies after code changes.

## Phase 3: Verification
- [ ] Run TypeScript validation (`npm run lint` / `npm run typecheck` if available).
- [ ] Run `npm run build` for production build.
- [ ] Run existing tests/lint.
- [ ] Manually confirm: app boots into `/dashboard/terminal` and dashboard updates in real time via existing backend APIs + WebSocket.

