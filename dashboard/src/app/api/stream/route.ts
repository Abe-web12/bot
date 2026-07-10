import { NextResponse, type NextRequest } from "next/server";
import { requireApiKey } from "@/lib/api-key";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;

  return NextResponse.json(
    { error: "not_implemented", message: "Stream endpoint not yet implemented" },
    { status: 501 }
  );
}

export async function POST(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;

  return NextResponse.json(
    { error: "not_implemented", message: "Stream endpoint not yet implemented" },
    { status: 501 }
  );
}
