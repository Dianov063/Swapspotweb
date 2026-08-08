import { NextResponse } from "next/server";
import { requireAnalyticsAccess } from "@/lib/googleServerApis";
import { supabaseAdminFetch } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireAnalyticsAccess(request);

    const params = new URLSearchParams({
      select: "id,user_id,last_message_text,last_message_at,created_at,updated_at,profiles:user_id(email,full_name,role)",
      order: "last_message_at.desc.nullslast,created_at.desc",
      limit: "100",
    });

    const response = await supabaseAdminFetch(`support_threads?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Could not load support threads");
    }

    return NextResponse.json({ ok: true, threads: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
