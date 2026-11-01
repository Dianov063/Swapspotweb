import type { MetadataRoute } from "next";
import { categories, cities } from "@/lib/data";
import { getSiteLanguages } from "@/lib/languages";
import { absoluteLanguageAlternates, localizedPath, siteUrl, type LanguageRoute } from "@/lib/locales";
import { getDirectoryPairs, getPublicHelperProfiles } from "@/lib/publicDirectory";

// Short localized notice pages (no hreflang: the legal texts themselves stay English).
const localizedNoticePaths = ["/trust-safety", "/contact", "/support", "/account-deletion", "/privacy", "/terms"];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

function url(path: string) {
  return `${siteUrl}${path === "/" ? "" : path}`;
}

/**
 * Every language version of an English path, each listing all alternates (hreflang + x-default).
 * `languages` are the site languages: the shipped locales plus public, bundled registry languages
 * (hidden languages get no entry and no alternate).
 */
function localizedEntries(path: string, languages: readonly LanguageRoute[], options: Omit<Entry, "url" | "alternates">): Entry[] {
  const alternates = { languages: absoluteLanguageAlternates(path, languages) };
  return languages.map(({ segment: locale }) => ({
    url: url(localizedPath(locale, path)),
    alternates,
    ...options,
    priority: locale === "en" ? options.priority : Math.max(0.1, (options.priority ?? 0.5) - 0.1),
  }));
}

/** The English URL with its language alternates (the localized URLs are announced as alternates). */
function englishEntry(path: string, languages: readonly LanguageRoute[], options: Omit<Entry, "url" | "alternates">): Entry {
  return { url: url(path), alternates: { languages: absoluteLanguageAlternates(path, languages) }, ...options };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [directoryPairs, helperProfiles, languages] = await Promise.all([
    getDirectoryPairs(),
    getPublicHelperProfiles({ limit: 1000 }),
    getSiteLanguages(),
  ]);

  // Low-cardinality pages: every site language URL is listed.
  const pages = [
    ...localizedEntries("/", languages, { lastModified, changeFrequency: "weekly", priority: 1 }),
    ...localizedEntries("/services", languages, { lastModified, changeFrequency: "weekly", priority: 0.7 }),
    ...localizedEntries("/helpers", languages, { lastModified, changeFrequency: "weekly", priority: 0.7 }),
    ...categories.flatMap((category) =>
      localizedEntries(`/categories/${category.slug}`, languages, { lastModified, changeFrequency: "weekly", priority: 0.6 }),
    ),
    ...cities.flatMap((city) =>
      localizedEntries(`/cities/${city.slug}`, languages, { lastModified, changeFrequency: "weekly", priority: 0.6 }),
    ),
  ];

  const noticePages = localizedNoticePaths.flatMap((path) =>
    languages.map(({ segment: locale }) => ({
      url: url(localizedPath(locale, path)),
      lastModified,
      changeFrequency: locale === "en" ? ("weekly" as const) : ("monthly" as const),
      priority: locale === "en" ? 0.7 : 0.55,
    })),
  );

  // Data-driven pages (hundreds of URLs): the English URL carries the language alternates; every
  // localized page also declares the same hreflang set in its HTML.
  const serviceMarketRoutes = directoryPairs.map((pair) =>
    englishEntry(`/services/${pair.categorySlug}/${pair.marketSlug}`, languages, {
      lastModified,
      changeFrequency: "daily",
      priority: 0.72,
    }),
  );
  const helperProfileRoutes = helperProfiles.slice(0, 500).map((profile) =>
    englishEntry(`/helpers/${profile.slug}`, languages, { lastModified, changeFrequency: "weekly", priority: 0.62 }),
  );

  return [...pages, ...noticePages, ...serviceMarketRoutes, ...helperProfileRoutes];
}
