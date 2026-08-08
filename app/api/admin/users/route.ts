import { NextResponse } from "next/server";
import { requireAnalyticsAccess } from "@/lib/googleServerApis";
import { supabaseAdminFetch } from "@/lib/supabaseAdmin";

const SORTS = new Set(["newest", "oldest", "state", "city", "platform"]);
const PLATFORMS = new Set(["ios", "android", "web", "unknown"]);

function shortValue(value: string | null, maxLength = 120) {
  return value?.trim().slice(0, maxLength) || "";
}

export async function GET(request: Request) {
  try {
    requireAnalyticsAccess(request);

    const { searchParams } = new URL(request.url);
    const requestedPlatform = shortValue(searchParams.get("platform"), 20);
    const platform = PLATFORMS.has(requestedPlatform) ? requestedPlatform : "";
    const requestedSort = shortValue(searchParams.get("sort"), 20);
    const sort = SORTS.has(requestedSort) ? requestedSort : "newest";
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10) || 1, 1);
    const params = new URLSearchParams({
      p_platform: platform,
      p_state: shortValue(searchParams.get("state")),
      p_city: shortValue(searchParams.get("city")),
      p_search: shortValue(searchParams.get("search")),
      p_sort: sort,
      p_limit: "100",
      p_offset: String((page - 1) * 100),
      p_include_test: searchParams.get("includeTest") === "true" ? "true" : "false",
    });

    const response = await supabaseAdminFetch(`rpc/admin_user_directory?${params}`);
    const users = await response.json();

    if (!response.ok) {
      throw new Error(users?.message || "Could not load user directory");
    }

    return NextResponse.json({
      ok: true,
      users: Array.isArray(users) ? users : [],
      total: Array.isArray(users) && users[0] ? Number(users[0].total_count || 0) : 0,
      page,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
