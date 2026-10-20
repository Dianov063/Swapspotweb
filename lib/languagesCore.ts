// SwapSpot language registry (docs/swapspot-africa.md §3): parsing, fallback, gating of site
// languages. Pure module without imports so `node --test` can load it; lib/languages.ts adds the
// Next.js wiring (server fetch, bundled locale packs).

export const LANGUAGES_FORMAT = 1;

export type LanguageStatus = "production" | "draft" | "machine" | "reviewed";

export type RegistryLanguage = {
  /** BCP 47 code as used by the app (`zh-Hans`, `ar-EG`, `sw`, `ary`). */
  code: string;
  englishName: string;
  nativeName: string;
  /** ISO 15924 (`Latn`, `Arab`, `Ethi`, `Tfng`, ...). */
  script: string | null;
  dir: "ltr" | "rtl";
  /** Registry parent for regional variants (`ar-EG` -> `ar`) and `ary` -> `ar`. */
  parent: string | null;
  status: LanguageStatus;
  public: boolean;
};

export type LanguagesSource = "registry" | "snapshot";

export type LanguagesResult = { languages: RegistryLanguage[]; source: LanguagesSource; updatedAt: string | null };

/** A language the site serves under `/<segment>/...` (English has no prefix). */
export type SiteLanguage = {
  /** URL segment and the site's locale key: `es`, `zh`, `sw`, `sw-ke`, `ar-eg`. */
  segment: string;
  /** Registry code (`zh-Hans` for the `zh` segment). */
  code: string;
  /** BCP 47 tag for `<html lang>`, hreflang and Intl. */
  tag: string;
  dir: "ltr" | "rtl";
  nativeName: string;
  script: string | null;
  /** One of the 16 languages shipped in TypeScript tables before the registry. */
  shipped: boolean;
  /** Registry codes to read strings from, most specific first, without `en`. */
  chain: string[];
};

const STATUSES: readonly string[] = ["production", "draft", "machine", "reviewed"];

/** Statuses a non-shipped language needs (besides `public` and bundled strings) to get routes. */
export const PUBLISHABLE_STATUSES: readonly LanguageStatus[] = ["machine", "reviewed"];

/** Complete translations: a non-public ancestor of a public regional variant must have one of these. */
const COMPLETE_STATUSES: readonly LanguageStatus[] = ["production", "machine", "reviewed"];

const CODE_PATTERN = /^[a-z]{2,3}(-[A-Z][a-z]{3})?(-(?:[A-Z]{2}|\d{3}))?$/;

const RTL_SCRIPTS = new Set(["Arab", "Hebr", "Syrc", "Thaa", "Nkoo", "Adlm", "Rohg"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** BCP 47 casing of a tag or URL segment: `ar-eg` -> `ar-EG`, `zh-hans` -> `zh-Hans`. */
export function canonicalTag(value: string) {
  return value
    .trim()
    .replace(/_/g, "-")
    .split("-")
    .filter(Boolean)
    .map((part, index) => {
      if (index === 0) return part.toLowerCase();
      if (/^[A-Za-z]{2}$/.test(part) || /^\d{3}$/.test(part)) return part.toUpperCase();
      if (/^[A-Za-z]{4}$/.test(part)) return part[0].toUpperCase() + part.slice(1).toLowerCase();
      return part.toLowerCase();
    })
    .join("-");
}

/** URL segment of a registry code: lower case BCP 47; the site keeps `/zh` for `zh-Hans`. */
export function urlSegment(code: string) {
  return code === "zh-Hans" ? "zh" : code.toLowerCase();
}

/** One language of the registry. Unknown fields are ignored; an invalid entry returns null. */
export function parseLanguage(raw: unknown): RegistryLanguage | null {
  if (!isRecord(raw)) return null;
  const code = typeof raw.code === "string" ? raw.code : "";
  if (!CODE_PATTERN.test(code)) return null;
  if (typeof raw.status !== "string" || !STATUSES.includes(raw.status)) return null;
  const script = text(raw.script);
  const parent = text(raw.parent);
  return {
    code,
    englishName: text(raw.english_name) ?? code,
    nativeName: text(raw.native_name) ?? text(raw.english_name) ?? code,
    script,
    dir: raw.dir === "rtl" || raw.dir === "ltr" ? raw.dir : script && RTL_SCRIPTS.has(script) ? "rtl" : "ltr",
    parent: parent && CODE_PATTERN.test(parent) && parent !== code ? parent : null,
    status: raw.status as LanguageStatus,
    public: raw.public === true,
  };
}

/**
 * Parses the registry body (`GET /v1/apps/{slug}/swapspot/languages`, same shape as
 * `swapspot_languages.json`). Null when unusable: wrong shape, a `format` other than 1 (a higher
 * format is refused, the caller keeps the bundled snapshot) or no valid `en`.
 */
export function parseLanguagesPayload(payload: unknown): { languages: RegistryLanguage[]; updatedAt: string | null } | null {
  if (!isRecord(payload) || payload.format !== LANGUAGES_FORMAT || !Array.isArray(payload.languages)) return null;
  const byCode = new Map<string, RegistryLanguage>();
  for (const raw of payload.languages) {
    const language = parseLanguage(raw);
    if (language && !byCode.has(language.code)) byCode.set(language.code, language);
  }
  if (!byCode.has("en")) return null;
  return { languages: [...byCode.values()], updatedAt: text(payload.updated_at) };
}

type FetchLike = (input: string, init?: Record<string, unknown>) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

/**
 * Registry from the endpoint, or the bundled snapshot when the endpoint is not configured,
 * unreachable, slow, returns an error or an unusable body.
 */
export async function loadLanguages({
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
}): Promise<LanguagesResult> {
  const fallback = parseLanguagesPayload(snapshot);
  if (!fallback) throw new Error("The bundled languages snapshot is invalid");
  const fromSnapshot: LanguagesResult = { ...fallback, source: "snapshot" };
  if (!url) return fromSnapshot;

  try {
    const response = await fetchImpl(url, {
      ...init,
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      onError?.("languages registry returned an error status");
      return fromSnapshot;
    }
    const parsed = parseLanguagesPayload(await response.json());
    if (!parsed) {
      onError?.("languages registry body is not format 1 or has no valid en");
      return fromSnapshot;
    }
    return { ...parsed, source: "registry" };
  } catch (error) {
    onError?.(error instanceof Error ? error.message : "languages registry request failed");
    return fromSnapshot;
  }
}

/** Registry codes to read strings from: exact, then parents (`sw-KE` -> `sw`), without `en`. */
export function fallbackChain(code: string, languages: readonly RegistryLanguage[]): string[] {
  const byCode = new Map(languages.map((language) => [language.code, language]));
  const chain: string[] = [];
  let current: string | null = code;
  while (current && current !== "en" && !chain.includes(current)) {
    chain.push(current);
    current = byCode.get(current)?.parent ?? null;
  }
  return chain;
}

export function isPublishable(language: Pick<RegistryLanguage, "public" | "status">) {
  return language.public && PUBLISHABLE_STATUSES.includes(language.status);
}

/**
 * Languages with routes: the shipped site locales (always, in their order), then every registry
 * language that is public, `machine`/`reviewed`, bundled (`lib/locales/<code>.json` exists) and
 * whose ancestors are shipped or bundled and complete. Hidden languages produce nothing: no
 * route, no hreflang, no sitemap entry, no switcher option.
 */
export function siteLanguages({
  registry,
  shipped,
  shippedNames,
  isBundled,
}: {
  registry: readonly RegistryLanguage[];
  /** Shipped URL segments (`en`, `es`, `zh`, ...). */
  shipped: readonly string[];
  shippedNames: Readonly<Record<string, string>>;
  isBundled: (code: string) => boolean;
}): SiteLanguage[] {
  const byCode = new Map(registry.map((language) => [language.code, language]));
  const shippedSet = new Set(shipped);
  const result: SiteLanguage[] = shipped.map((segment) => {
    const code = segment === "zh" ? "zh-Hans" : segment;
    const entry = byCode.get(code);
    return {
      segment,
      code,
      tag: code,
      dir: entry?.dir ?? (segment === "ar" ? "rtl" : "ltr"),
      nativeName: shippedNames[segment] ?? entry?.nativeName ?? code,
      script: entry?.script ?? null,
      shipped: true,
      chain: [code],
    };
  });

  for (const language of registry) {
    const segment = urlSegment(language.code);
    if (shippedSet.has(segment) || result.some((item) => item.segment === segment)) continue;
    if (!isPublishable(language) || !isBundled(language.code)) continue;
    const chain = fallbackChain(language.code, registry);
    const ancestorsReady = chain.slice(1).every((ancestor) => {
      if (shippedSet.has(urlSegment(ancestor))) return true;
      const entry = byCode.get(ancestor);
      return Boolean(entry && COMPLETE_STATUSES.includes(entry.status) && isBundled(ancestor));
    });
    if (!ancestorsReady) continue;
    result.push({
      segment,
      code: language.code,
      tag: language.code,
      dir: language.dir,
      nativeName: language.nativeName,
      script: language.script,
      shipped: false,
      chain,
    });
  }
  return result;
}

/**
 * Site language for a visitor's language preferences (`navigator.languages`, `?lang=`): exact
 * match first, then the language part (`ar-MA` -> `ar`, never `ary`; `sw-TZ` -> `sw`).
 * `segments` are the available URL segments. Returns null when nothing matches.
 */
export function matchLanguage(preferences: readonly string[], segments: readonly string[]): string | null {
  const available = new Set(segments);
  const aliases: Record<string, string> = { tl: "fil", "zh-cn": "zh", "zh-sg": "zh", "zh-hans": "zh", "zh-hans-cn": "zh" };
  for (const raw of preferences) {
    const value = String(raw ?? "").trim().toLowerCase().replace(/_/g, "-");
    if (!value) continue;
    const exact = aliases[value] ?? value;
    if (available.has(exact)) return exact;
    const base = value.split("-")[0];
    const fromBase = aliases[base] ?? base;
    if (available.has(fromBase)) return fromBase;
  }
  return null;
}
