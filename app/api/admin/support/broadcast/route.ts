import { NextResponse } from "next/server";
import { requireAnalyticsAccess } from "@/lib/googleServerApis";
import { supabaseAdminFetch } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireAnalyticsAccess(request);
    const body = await request.json().catch(() => ({}));
    const content = String(body.content || "").trim();

    if (!content) throw new Error("Missing announcement");
    if (content.length > 2000) throw new Error("Announcement is too long");

    const response = await supabaseAdminFetch("rpc/admin_broadcast_support_message", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ p_content: content }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Could not send announcement");
    }

    const result = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ ok: true, broadcast: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized"
      ? 401
      : ["Missing announcement", "Announcement is too long"].includes(message)
        ? 400
        : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
