// dashboard/src/lib/api-client.ts
// HTTP client with a deliberate two-base split during the Flask → Next+Prisma
// migration:
//
//   • REST reads/writes default to SAME-ORIGIN ("") so paths like "/api/trades"
//     hit the Next.js Route Handlers we built (Prisma-backed).
//   • Endpoints still owned by Flask (bot control that touches MT5, and the
//     CSV/XLSX file exports) are called against FLASK_BASE explicitly via the
//     `flask` helpers below.
//   • The WebSocket client derives its URL from FLASK_BASE (re-exported as
//     API_BASE for back-compat), since the live WS relay still lives on Flask.
//
// As more endpoints migrate, move their calls from `flask.*` to `api.*`.

// Base URL of the Flask backend (bot control + WS relay + exports).
const FLASK_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Same-origin for the Next.js Route Handlers. Empty string keeps fetch on the
// current origin, so "/api/trades" resolves to this app, not Flask.
const API_BASE = "";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Core request helper. `base` selects same-origin (Next) vs Flask.
async function request<T>(
  base: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${base}${path}`;

  const authToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("auth_token")
      : null;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const body = await res
      .json()
      .catch(() => ({ error: res.statusText }));
    // Route Handlers return { error, message?, issues? }; surface the richest
    // message available.
    const message =
      body.message || body.error || res.statusText || "Request failed";
    throw new ApiError(message, res.status);
  }

  // 204/empty-body safety: don't blow up on no-content responses.
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────
// Same-origin API (Next.js + Prisma Route Handlers) — the default.
// ─────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string) => request<T>(API_BASE, path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(API_BASE, path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(API_BASE, path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) =>
    request<T>(API_BASE, path, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────
// Flask API (endpoints not yet migrated: bot control, MT5-facing commands).
// Use these explicitly so it's obvious at the call site what still hits Flask.
// ─────────────────────────────────────────────────────────────

export const flask = {
  get: <T>(path: string) => request<T>(FLASK_BASE, path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(FLASK_BASE, path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(FLASK_BASE, path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) =>
    request<T>(FLASK_BASE, path, { method: "DELETE" }),
};

// File exports (CSV/XLSX) are still served by Flask; build absolute URLs.
export function getDownloadUrl(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${FLASK_BASE}${path}${sep}_t=${Date.now()}`;
}

// Trigger a browser download of a Flask-served file (CSV/XLSX export).
export async function authenticatedDownload(
  path: string,
  filename: string
): Promise<void> {
  const url = `${FLASK_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res
      .json()
      .catch(() => ({ error: res.statusText }));
    throw new ApiError(body.error || res.statusText, res.status);
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

// FLASK_BASE is also exported as API_BASE for back-compat: websocket-client.ts
// imports API_BASE to derive the WS relay URL, which still lives on Flask.
export { FLASK_BASE, API_BASE, ApiError };