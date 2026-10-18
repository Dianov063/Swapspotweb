/**
 * Server-only data access for the SwapSpot backend.
 *
 * SWAPSPOT_BACKEND selects the source:
 * - "supabase" (default until cutover): Supabase PostgREST + Edge Functions with
 *   the service role key, as before.
 * - "appplatform": the SwapSpot tenant on App Platform. The same PostgREST paths
 *   go through the platform's guarded REST route with a scoped service
 *   credential (swapspot:backend); Edge Functions map to platform endpoints.
 *
 * Callers keep using PostgREST-style paths ("services?select=..", "rpc/..").
 */

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://hoohhuqgyaifjglfzanx.supabase.co";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type SwapSpotBackend = "supabase" | "appplatform";

export function swapspotBackend(): SwapSpotBackend {
  return process.env.SWAPSPOT_BACKEND === "appplatform" ? "appplatform" : "supabase";
}

function appPlatformEnv() {
  const baseUrl = (process.env.APP_PLATFORM_URL || "").replace(/\/$/, "");
  const slug = process.env.APP_PLATFORM_APP_SLUG || "swapspot";
  const token = process.env.APP_PLATFORM_SERVICE_TOKEN;
  if (!baseUrl || !token) {
    throw new Error("Missing APP_PLATFORM_URL or APP_PLATFORM_SERVICE_TOKEN");
  }
  return { appBase: `${baseUrl}/v1/apps/${slug}/swapspot`, token };
}

export function getSupabaseAdminEnv() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return {
    supabaseUrl: SUPABASE_URL.replace(/\/$/, ""),
    serviceRoleKey: SERVICE_ROLE_KEY,
  };
}

type FetchOptions = RequestInit & { next?: { revalidate?: number } };

/** PostgREST request (tables, views, rpc/*) as the trusted website backend. */
export async function supabaseAdminFetch(path: string, init: FetchOptions = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const caching = init.next ? {} : { cache: "no-store" as const };

  if (swapspotBackend() === "appplatform") {
    const { appBase, token } = appPlatformEnv();
    headers.set("Authorization", `Service ${token}`);
    return fetch(`${appBase}/rest/${path}`, { ...init, headers, ...caching });
  }

  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminEnv();
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  return fetch(`${supabaseUrl}/rest/v1/${path}`, { ...init, headers, ...caching });
}

// Edge Function -> App Platform endpoint. Pushes for support messages and
// broadcasts are sent by the platform's database triggers, so no call is needed.
const PLATFORM_FUNCTIONS: Record<string, string | null> = {
  "admin-report-email": "/admin/report-email",
  "normalize-search": "/normalize-search",
  "push-notification": null,
};

export async function invokeSupabaseAdminFunction(name: string, payload: unknown) {
  if (swapspotBackend() === "appplatform") {
    if (!(name in PLATFORM_FUNCTIONS)) {
      throw new Error(`Function ${name} is not available on App Platform`);
    }
    const route = PLATFORM_FUNCTIONS[name];
    if (route === null) {
      return Response.json({ skipped: true, reason: "handled by App Platform triggers" });
    }
    const { appBase, token } = appPlatformEnv();
    return fetch(`${appBase}${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Service ${token}` },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  }

  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminEnv();
  return fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
