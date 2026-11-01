// SwapSpot market registry: parsing, fallback and lookups (contract docs/swapspot-international.md §2).
// Pure module without imports so `node --test` can load it; lib/markets.ts adds the Next.js wiring.

export const MARKETS_FORMAT = 1;

// `verified` (patch 0005): all staging checks passed, still not launched; only `active` is launched.
export type MarketStatus = "active" | "preparing" | "verified" | "disabled";

export type Market = {
  code: string;
  status: MarketStatus;
  sortOrder: number;
  currency: { code: string; minorUnits: number };
  distanceUnit: "mi" | "km";
  defaultTimezone: string | null;
  timezones: string[];
  postal: { kind: string; required: boolean; pattern: string | null; example: string | null };
  regionKind: string | null;
  mapCenter: { lat: number; lng: number; zoom: number } | null;
  languages: { default: string; recommended: string[] };
  names: Record<string, string>;
};

export type MarketsSource = "registry" | "snapshot";

export type MarketsResult = { markets: Market[]; source: MarketsSource; updatedAt: string | null };

const STATUSES: readonly string[] = ["active", "preparing", "verified", "disabled"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/** One market of the endpoint (§2.1). Unknown fields are ignored; an invalid market returns null. */
export function parseMarket(raw: unknown): Market | null {
  if (!isRecord(raw)) return null;
  const code = typeof raw.code === "string" ? raw.code : "";
  if (!/^[A-Z]{2}$/.test(code)) return null;
  if (typeof raw.status !== "string" || !STATUSES.includes(raw.status)) return null;

  const currency = isRecord(raw.currency) ? raw.currency : null;
  const currencyCode = typeof currency?.code === "string" ? currency.code : "";
  const minorUnits = currency?.minor_units;
  if (!/^[A-Z]{3}$/.test(currencyCode)) return null;
  if (typeof minorUnits !== "number" || !Number.isInteger(minorUnits) || minorUnits < 0 || minorUnits > 3) {
    return null;
  }

  const names: Record<string, string> = {};
  if (isRecord(raw.names)) {
    for (const [locale, name] of Object.entries(raw.names)) {
      if (typeof name === "string" && name.trim()) names[locale] = name;
    }
  }

  const postal = isRecord(raw.postal) ? raw.postal : {};
  const center = isRecord(raw.map_center) ? raw.map_center : null;
  const languages = isRecord(raw.languages) ? raw.languages : {};

  return {
    code,
    status: raw.status as MarketStatus,
    sortOrder: typeof raw.sort_order === "number" ? raw.sort_order : 0,
    currency: { code: currencyCode, minorUnits },
    distanceUnit: raw.distance_unit === "mi" ? "mi" : "km",
    defaultTimezone: stringOrNull(raw.default_timezone),
    timezones: stringList(raw.timezones),
    postal: {
      kind: stringOrNull(postal.kind) ?? "none",
      required: postal.required === true,
      pattern: stringOrNull(postal.pattern),
      example: stringOrNull(postal.example),
    },
    regionKind: stringOrNull(raw.region_kind),
    mapCenter:
      center && typeof center.lat === "number" && typeof center.lng === "number"
        ? { lat: center.lat, lng: center.lng, zoom: typeof center.zoom === "number" ? center.zoom : 11 }
        : null,
    languages: {
      default: stringOrNull(languages.default) ?? "en",
      recommended: stringList(languages.recommended),
    },
    names,
  };
}

/**
 * Parses the endpoint body. Returns null when the body is not usable: wrong shape, a `format`
 * other than 1 (a higher format is refused, the caller keeps its bundled copy) or no valid market.
 * `disabled` markets are dropped (the endpoint omits them anyway).
 */
export function parseMarketsPayload(payload: unknown): { markets: Market[]; updatedAt: string | null } | null {
  if (!isRecord(payload) || payload.format !== MARKETS_FORMAT || !Array.isArray(payload.markets)) return null;
  const byCode = new Map<string, Market>();
  for (const raw of payload.markets) {
    const market = parseMarket(raw);
    if (market && market.status !== "disabled" && !byCode.has(market.code)) byCode.set(market.code, market);
  }
  if (!byCode.size) return null;
  const markets = [...byCode.values()].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.code.localeCompare(right.code),
  );
  return { markets, updatedAt: stringOrNull(payload.updated_at) };
}

type FetchLike = (input: string, init?: Record<string, unknown>) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

/**
 * Registry from the endpoint, or the bundled snapshot when the endpoint is not configured,
 * unreachable, slow, returns an error or an unusable body.
 */
export async function loadMarkets({
  url,
  snapshot,
  fetchImpl,
  timeoutMs = 4000,
  init = {},
  onError,
}: {
  url: string | null;
  snapshot: unknown;
  fetchImpl: FetchLike;
  timeoutMs?: number;
  init?: Record<string, unknown>;
  onError?: (reason: string) => void;
}): Promise<MarketsResult> {
  const fallback = parseMarketsPayload(snapshot);
  if (!fallback) throw new Error("The bundled markets snapshot is invalid");
  const fromSnapshot: MarketsResult = { ...fallback, source: "snapshot" };
  if (!url) return fromSnapshot;

  try {
    const response = await fetchImpl(url, {
      ...init,
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      onError?.("markets registry returned an error status");
      return fromSnapshot;
    }
    const parsed = parseMarketsPayload(await response.json());
    if (!parsed) {
      onError?.("markets registry body is not format 1 or has no valid market");
      return fromSnapshot;
    }
    return { ...parsed, source: "registry" };
  } catch (error) {
    onError?.(error instanceof Error ? error.message : "markets registry request failed");
    return fromSnapshot;
  }
}

export function normalizeCountryCode(code: string | null | undefined) {
  const value = String(code ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(value) ? value : null;
}

/** The market for a country code, or null (never a silent US fallback). */
export function findMarket(markets: readonly Market[], code: string | null | undefined): Market | null {
  const normalized = normalizeCountryCode(code);
  if (!normalized) return null;
  return markets.find((market) => market.code === normalized) ?? null;
}

export function isActiveMarket(market: Market | null | undefined): market is Market {
  return market?.status === "active";
}

// Site locale -> keys in `names` (the registry uses app language codes, e.g. zh-Hans, ar-EG).
// `ary` (Moroccan Arabic) falls back to its registry parent `ar` (docs/swapspot-africa.md §3).
const NAME_KEYS: Record<string, string[]> = { zh: ["zh-Hans", "zh"], "zh-Hans": ["zh-Hans", "zh"], ary: ["ary", "ar"] };

/** BCP 47 casing of a URL segment: `ar-eg` -> `ar-EG`, `zh-hans` -> `zh-Hans`. */
function bcp47(value: string) {
  return value
    .split("-")
    .map((part, index) =>
      index === 0 ? part.toLowerCase() : part.length === 2 ? part.toUpperCase() : part.length === 4 ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part.toLowerCase(),
    )
    .join("-");
}

/** Country name in `locale` from the registry; English, then the code itself as fallback. */
export function marketDisplayName(markets: readonly Market[], code: string | null | undefined, locale: string) {
  const market = findMarket(markets, code);
  if (!market) return normalizeCountryCode(code) ?? String(code ?? "");
  const keys = [...(NAME_KEYS[locale] ?? [locale, bcp47(locale)]), locale.split("-")[0], "en"];
  for (const key of keys) {
    if (market.names[key]) return market.names[key];
  }
  return market.code;
}
