// Server-side access to the SwapSpot language registry (docs/swapspot-africa.md §3-4, website row):
// anonymous GET `${APP_PLATFORM_URL}/v1/apps/${APP_PLATFORM_APP_SLUG}/swapspot/languages`, cached
// for an hour; the bundled snapshot (scripts/sync-languages-snapshot.mjs) when the endpoint is not
// configured, unreachable or returns an unusable body.
//
// Site languages = the 16 shipped locales + registry languages that are bundled
// (`lib/locales/<code>.json`), public and `machine`/`reviewed`. Everything else has no route, no
// hreflang, no sitemap entry and no switcher option.
import { cache } from "react";
import snapshot from "./languagesSnapshot.json";
import { loadLanguages, siteLanguages, type RegistryLanguage, type SiteLanguage } from "./languagesCore";
import { ensureLocaleTables, isLocalePackBundled } from "./localePacks";
import { defaultLocale, hreflangAlternates, localeNames, locales, type Locale } from "./locales";
import { appPlatformAppBase } from "./supabaseAdmin";

export type { SiteLanguage } from "./languagesCore";

export function languagesEndpoint() {
  const appBase = appPlatformAppBase();
  return appBase ? `${appBase}/languages` : null;
}

const loadRegistry = cache(() =>
  loadLanguages({
    url: languagesEndpoint(),
    snapshot,
    fetchImpl: fetch as never,
    init: { next: { revalidate: 3600 } },
    onError: (reason) => console.warn(`SwapSpot languages registry unavailable, using the bundled snapshot: ${reason}`),
  }),
);

export async function getLanguageRegistry(): Promise<RegistryLanguage[]> {
  return (await loadRegistry()).languages;
}

/** Languages with routes, shipped first (English included, without a URL prefix). */
export const getSiteLanguages = cache(async (): Promise<SiteLanguage[]> =>
  siteLanguages({
    registry: await getLanguageRegistry(),
    shipped: locales,
    shippedNames: localeNames,
    isBundled: isLocalePackBundled,
  }),
);

/** The site language of a URL segment, or null when it has no route. */
export async function findSiteLanguage(segment: string): Promise<SiteLanguage | null> {
  return (await getSiteLanguages()).find((language) => language.segment === segment) ?? null;
}

/**
 * Locale of a `/[locale]/...` route: the segment when it is a non-English site language (its
 * strings are resolved and registered for the getters), else null (the page answers 404).
 */
export async function routeLocale(segment: string): Promise<Locale | null> {
  if (segment === defaultLocale) return null;
  const language = await findSiteLanguage(segment);
  if (!language) return null;
  ensureLocaleTables(language);
  return language.segment;
}

/** Same as `routeLocale`, for pages that also accept English (`en` -> `en`). */
export async function pageLocale(segment: string): Promise<Locale | null> {
  return segment === defaultLocale ? defaultLocale : routeLocale(segment);
}

/** Language switcher options: segment and the language's own name. */
export async function languageOptions(): Promise<{ segment: string; label: string }[]> {
  return (await getSiteLanguages()).map((language) => ({ segment: language.segment, label: language.nativeName }));
}

/** hreflang alternates over the current site languages (lib/locales.ts `hreflangAlternates`). */
export async function localeAlternates(path: string, locale: Locale = defaultLocale) {
  return hreflangAlternates(path, locale, await getSiteLanguages());
}
