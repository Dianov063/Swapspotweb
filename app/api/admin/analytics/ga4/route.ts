import { NextResponse } from "next/server";
import { fetchGa4Report, requireAnalyticsAccess } from "@/lib/googleServerApis";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireAnalyticsAccess(request);
    const data = await fetchGa4Report();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
