// Site locales, localized paths and hreflang alternates.
// Pure module without imports: used by the app and by `node --test` (scripts/intl.test.mjs).
//
// The 16 shipped locales below have TypeScript string tables. Registry languages
// (docs/swapspot-africa.md) are added at runtime by lib/languages.ts when they are bundled
// (`lib/locales/<code>.json`), public and `machine`/`reviewed`; functions that list languages take
// that list as a parameter and default to the shipped ones.

export const locales = [
  "en",
  "es",
  "zh",
  "fr",
  "ru",
  "ar",
  "pt",
  "ht",
  "de",
  "fil",
  "hi",
  "bn",
  "te",
  "ta",
  "vi",
  "th",
] as const;

/** The 16 languages with TypeScript string tables. */
export type ShippedLocale = (typeof locales)[number];

/**
 * A site language as used in URLs and as the key of string lookups: a shipped locale or the URL
 * segment of a registry language (`sw`, `sw-ke`, `ar-eg`, `zgh`). Look strings up through the
 * getters (`getDictionary`, `directoryStrings`, ...), never by indexing a shipped table.
 */
export type Locale = ShippedLocale | (string & {});

export const defaultLocale: ShippedLocale = "en";

export const siteUrl = "https://www.swapspot.org";

/** Language names in their own language for the language switcher. */
export const localeNames: Record<ShippedLocale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  fr: "Français",
  ru: "Русский",
  ar: "العربية",
  pt: "Português",
  ht: "Kreyòl Ayisyen",
  de: "Deutsch",
  fil: "Filipino",
  hi: "हिन्दी",
  bn: "বাংলা",
  te: "తెలుగు",
  ta: "தமிழ்",
  vi: "Tiếng Việt",
  th: "ไทย",
};

/** True for the 16 shipped locales. Registry languages are checked by lib/languages.ts. */
export function isLocale(value: string): value is ShippedLocale {
  return (locales as readonly string[]).includes(value);
}

/** Minimal view of a site language for paths and alternates (lib/languagesCore.ts `SiteLanguage`). */
export type LanguageRoute = { segment: string; tag: string; dir: "ltr" | "rtl" };

export const shippedLanguageRoutes: readonly LanguageRoute[] = locales.map((segment) => ({
  segment,
  tag: segment === "zh" ? "zh-Hans" : segment,
  dir: segment === "ar" ? "rtl" : "ltr",
}));

export function localizedPath(locale: Locale, path: string) {
  if (locale === defaultLocale) return path;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

/** BCP 47 tag for `<html lang>`, hreflang and Intl: `zh` -> `zh-Hans`, `ar-eg` -> `ar-EG`. */
export function languageTag(locale: Locale) {
  if (locale === "zh") return "zh-Hans";
  return locale
    .split("-")
    .map((part, index) =>
      index === 0
        ? part.toLowerCase()
        : part.length === 2 || /^\d{3}$/.test(part)
          ? part.toUpperCase()
          : part.length === 4
            ? part[0].toUpperCase() + part.slice(1).toLowerCase()
            : part.toLowerCase(),
    )
    .join("-");
}

// Right-to-left languages among the shipped and registered ones (the registry `dir` wins when a
// list is given).
const RTL_LANGUAGES = new Set(["ar", "ary", "arz", "he", "fa", "ur"]);

export function textDirection(locale: Locale, languages?: readonly LanguageRoute[]): "rtl" | "ltr" {
  const known = languages?.find((language) => language.segment === locale);
  if (known) return known.dir;
  return RTL_LANGUAGES.has(locale.split("-")[0]) ? "rtl" : "ltr";
}

/** Splits `/es/services` into `{ locale: "es", path: "/services" }`; English paths have no prefix. */
export function splitLocalePath(
  pathname: string,
  languages: readonly LanguageRoute[] = shippedLanguageRoutes,
): { locale: Locale; path: string } {
  const clean = pathname.split(/[?#]/)[0] || "/";
  const [, first = "", ...rest] = clean.split("/");
  if (first && first !== defaultLocale && languages.some((language) => language.segment === first)) {
    return { locale: first, path: rest.length && rest.join("/") ? `/${rest.join("/")}` : "/" };
  }
  return { locale: defaultLocale, path: clean };
}

// English paths that have a version under /<locale>/ for every site locale.
const localizedPatterns = [
  /^\/$/,
  /^\/services$/,
  /^\/services\/[^/]+\/[^/]+$/,
  /^\/helpers$/,
  /^\/helpers\/[^/]+$/,
  /^\/categories\/[^/]+$/,
  /^\/cities\/[^/]+$/,
  // Short localized notice pages (the legal texts themselves stay English).
  /^\/(privacy|terms|support|contact|account-deletion|delete-account|trust-safety)$/,
];

export function hasLocalizedVersion(path: string) {
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return localizedPatterns.some((pattern) => pattern.test(clean));
}

/** Target of the language switcher: the same page in `target` when it exists, else that locale's home. */
export function switchLocalePath(
  pathname: string,
  target: Locale,
  languages: readonly LanguageRoute[] = shippedLanguageRoutes,
) {
  const { path } = splitLocalePath(pathname, languages);
  return localizedPath(target, hasLocalizedVersion(path) ? path : "/");
}

/**
 * `alternates` for Next metadata: canonical of the current locale plus hreflang links for every
 * site language (BCP 47 tag -> path) and `x-default` (the English page). `path` is the English
 * path, e.g. `/services`. `languages` are the languages with routes (hidden languages excluded).
 */
export function hreflangAlternates(
  path: string,
  locale: Locale = defaultLocale,
  languages: readonly LanguageRoute[] = shippedLanguageRoutes,
) {
  const alternates: Record<string, string> = {};
  for (const language of languages) alternates[language.tag] = localizedPath(language.segment, path);
  alternates["x-default"] = path;
  return { canonical: localizedPath(locale, path), languages: alternates };
}

/** Same alternates as absolute URLs, for the sitemap. */
export function absoluteLanguageAlternates(path: string, languages: readonly LanguageRoute[] = shippedLanguageRoutes) {
  const { languages: alternates } = hreflangAlternates(path, defaultLocale, languages);
  return Object.fromEntries(
    Object.entries(alternates).map(([tag, href]) => [tag, `${siteUrl}${href === "/" ? "" : href}`]),
  );
}
