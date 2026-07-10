// dashboard/src/lib/env.ts
// Centralized, Zod-validated environment configuration.
//
// Import `env` anywhere instead of touching process.env directly. If a required
// variable is missing or malformed, the app throws a clear, aggregated error at
// startup rather than failing deep inside a request handler at runtime.
//
// Server-only vars live in `ServerSchema`. Anything the browser needs MUST be
// prefixed NEXT_PUBLIC_ and declared in `ClientSchema`, because Next.js only
// inlines NEXT_PUBLIC_* into the client bundle.

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

const ServerSchema = z.object({
  // Pooled Postgres connection (Supabase pooler / Neon pooled) for runtime queries.
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .url("DATABASE_URL must be a valid connection URL"),

  // Direct Postgres connection, used only by Prisma Migrate for DDL.
  DIRECT_URL: z
    .string()
    .min(1, "DIRECT_URL is required")
    .url("DIRECT_URL must be a valid connection URL"),

  // Node environment. Defaults to development when unset.
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const ClientSchema = z.object({
  // Base URL of the Flask backend that still owns MT5 bot-control commands.
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .default("http://localhost:5000"),

  // WebSocket relay URL for live trade/account/signal streaming.
  NEXT_PUBLIC_WS_URL: z
    .string()
    .url("NEXT_PUBLIC_WS_URL must be a valid ws:// or wss:// URL")
    .default("ws://localhost:5000/ws"),
});

// ─────────────────────────────────────────────────────────────
// Parsing
// ─────────────────────────────────────────────────────────────

// NEXT_PUBLIC_* vars must be referenced explicitly (not via a dynamic key)
// so Next.js can statically inline them into the client bundle at build time.
const clientEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
};

// On the server we validate everything. In the browser, server vars are absent
// from the bundle, so we only validate the client schema there.
const isServer = typeof window === "undefined";

function formatIssues(prefix: string, error: z.ZodError): never {
  const details = error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  throw new Error(`${prefix}\n${details}`);
}

function buildEnv() {
  const clientParsed = ClientSchema.safeParse(clientEnv);
  if (!clientParsed.success) {
    formatIssues(
      "❌ Invalid client environment variables:",
      clientParsed.error
    );
  }

  if (!isServer) {
    // Browser: only client vars are available.
    return { ...clientParsed.data } as ClientEnv & Partial<ServerEnv>;
  }

  const serverParsed = ServerSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
  if (!serverParsed.success) {
    formatIssues(
      "❌ Invalid server environment variables:",
      serverParsed.error
    );
  }

  return { ...serverParsed.data, ...clientParsed.data };
}

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────

export type ServerEnv = z.infer<typeof ServerSchema>;
export type ClientEnv = z.infer<typeof ClientSchema>;

export const env = buildEnv();