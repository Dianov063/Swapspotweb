import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export function POST() {
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set({ name: ADMIN_SESSION_COOKIE, value: "", path: "/", maxAge: 0 });
  return response;
}
