import { NextResponse } from "next/server";
import { adminSessionCookie, createAdminSession, verifyAdminPassword } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = String(body.password || "");

  if (!verifyAdminPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "Incorrect password" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(adminSessionCookie(createAdminSession()));
  return response;
}
