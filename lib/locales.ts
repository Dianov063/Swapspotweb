// Site locales, localized paths and hreflang alternates.
// Pure module without imports: used by the app and by `node --test` (scripts/intl.test.mjs).

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

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const siteUrl = "https://www.swapspot.org";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localizedPath(locale: Locale, path: string) {
  if (locale === defaultLocale) return path;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

/** BCP 47 tag for `<html lang>`, hreflang and Intl (the site's `zh` is Simplified Chinese). */
export function languageTag(locale: Locale) {
  return locale === "zh" ? "zh-Hans" : locale;
}

export function textDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Splits `/es/services` into `{ locale: "es", path: "/services" }`; English paths have no prefix. */
export function splitLocalePath(pathname: string): { locale: Locale; path: string } {
  const clean = pathname.split(/[?#]/)[0] || "/";
  const [, first = "", ...rest] = clean.split("/");
  if (first && first !== defaultLocale && isLocale(first)) {
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
export function switchLocalePath(pathname: string, target: Locale) {
  const { path } = splitLocalePath(pathname);
  return localizedPath(target, hasLocalizedVersion(path) ? path : "/");
}

/**
 * `alternates` for Next metadata: canonical of the current locale plus hreflang links for every
 * locale and `x-default` (the English page). `path` is the English path, e.g. `/services`.
 */
export function hreflangAlternates(path: string, locale: Locale = defaultLocale) {
  const languages: Record<string, string> = {};
  for (const item of locales) languages[languageTag(item)] = localizedPath(item, path);
  languages["x-default"] = path;
  return { canonical: localizedPath(locale, path), languages };
}

/** Same alternates as absolute URLs, for the sitemap. */
export function absoluteLanguageAlternates(path: string) {
  const { languages } = hreflangAlternates(path);
  return Object.fromEntries(
    Object.entries(languages).map(([tag, href]) => [tag, `${siteUrl}${href === "/" ? "" : href}`]),
  );
}
