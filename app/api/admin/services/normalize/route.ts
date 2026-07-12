import { NextResponse } from "next/server";
import { requireAnalyticsAccess } from "@/lib/googleServerApis";

export const dynamic = "force-dynamic";

type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  original_language: string | null;
  search_title_en: string | null;
  search_keywords: string | null;
};

function getSupabaseEnv() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return { supabaseUrl: supabaseUrl.replace(/\/$/, ""), serviceRoleKey };
}

async function fetchServicesToNormalize(limit: number) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();
  const params = new URLSearchParams({
    select: "id,name,description,original_language,search_title_en,search_keywords",
    or: "(search_title_en.is.null,search_keywords.is.null,original_language.eq.unknown)",
    order: "created_at.desc",
    limit: String(limit),
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/services?${params}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Could not load services");
  }

  return data as ServiceRow[];
}

async function normalizeService(service: ServiceRow) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();
  const normalizeResponse = await fetch(`${supabaseUrl}/functions/v1/normalize-search`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: "service",
      text: service.name,
      description: service.description || "",
    }),
    cache: "no-store",
  });

  const normalized = await normalizeResponse.json();
  if (!normalizeResponse.ok) {
    throw new Error(normalized?.error || `Normalize failed for ${service.id}`);
  }

  const payload = {
    original_language: normalized.original_language || service.original_language || "unknown",
    search_title_en: normalized.search_title_en || service.search_title_en || service.name,
    search_keywords:
      normalized.search_keywords ||
      service.search_keywords ||
      [service.name, service.description].filter(Boolean).join(" "),
  };

  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/services?id=eq.${encodeURIComponent(service.id)}`, {
    method: "PATCH",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!updateResponse.ok) {
    const text = await updateResponse.text();
    throw new Error(text || `Update failed for ${service.id}`);
  }

  return {
    id: service.id,
    name: service.name,
    original_language: payload.original_language,
    search_title_en: payload.search_title_en,
    ai_enabled: Boolean(normalized.ai_enabled),
  };
}

export async function POST(request: Request) {
  try {
    requireAnalyticsAccess(request);
    const body = await request.json().catch(() => ({}));
    const limit = Math.max(1, Math.min(Number(body.limit || 20), 50));
    const services = await fetchServicesToNormalize(limit);
    const updated = [];
    const failed = [];

    for (const service of services) {
      try {
        updated.push(await normalizeService(service));
      } catch (error) {
        failed.push({
          id: service.id,
          name: service.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      scanned: services.length,
      updated: updated.length,
      failed: failed.length,
      rows: updated,
      errors: failed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
