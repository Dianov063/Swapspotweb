import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return NextResponse.json(
    { ok: true, authenticated: hasAdminSession(request) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
