import { NextResponse, type NextRequest } from "next/server";

export function requireApiKey(request: NextRequest): NextResponse | null {
  const header = request.headers.get("x-api-key");

  if (!header) {
    return NextResponse.json(
      { error: "unauthorized", message: "Missing X-API-Key header" },
      { status: 401 }
    );
  }

  if (header !== process.env.INGEST_API_KEY) {
    return NextResponse.json(
      { error: "unauthorized", message: "Invalid API key" },
      { status: 401 }
    );
  }

  return null;
}
