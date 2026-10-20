// Every string table of the site in one list (docs/swapspot-africa.md §4-5).
//
// A registry language has one flat locale pack `lib/locales/<code>.json`: `"<table>.<path>":
// "text"`, e.g. `"site.nav.how"`, `"site.steps.0.1"`, `"directory.pairTitle"`,
// `"categories.cleaning"`. This module
// - flattens the English tables into the source pack (scripts/i18n/export-source.mjs ->
//   i18n-source/web.json),
// - flattens a shipped locale's tables (a parent such as `ar` for `ar-EG`),
// - rebuilds typed tables for a registry language from its fallback chain (exact -> parents -> en).
// The shipped 16 locales keep their TypeScript tables unchanged.
import { appPreviewCopy, appPreviewCopyTable } from "./copy/appPreview";
import { cookieConsentCopyTable } from "./copy/cookieConsent";
import { forClientsCopy, forClientsCopyTable } from "./copy/forClients";
import { maintenanceCopyTable } from "./copy/maintenance";
import { phoneCopyTable } from "./copy/phone";
import { staticPageIntros, staticPageTitles } from "./copy/staticPages";
import { categoryNamesTable, categorySlugs } from "./categoryNames";
import { directoryStringsTable } from "./directoryStrings";
import type { ExtraLocaleMeta, ExtraLocaleTables } from "./extraLocales";
import { dictionaries } from "./i18n";
import type { ShippedLocale } from "./locales";
import { PRICE_WORDS } from "./priceFormat";
import { clientPricingCopy, passPriceCopy } from "./pricingCopy";
import { resetStrings } from "./resetStrings";
import { storeBadgeCopy } from "./storeBadges";

export type FlatStrings = Record<string, string>;

type TableId = Exclude<keyof ExtraLocaleTables, "meta">;

type StringTable = {
  id: TableId;
  /** Where the strings are shown (file / section), for translators. */
  context: string;
  english: unknown;
  /** What the shipped locale renders today (its own table or its existing fallback). */
  shipped: (locale: ShippedLocale) => unknown;
};

const categoriesObject = (names: readonly string[]) =>
  Object.fromEntries(categorySlugs.map((slug, index) => [slug, names[index] ?? categoryNamesTable.en[index]]));

const staticPages = (locale: ShippedLocale) => ({ titles: staticPageTitles[locale], intro: staticPageIntros[locale] });

export const stringTables: readonly StringTable[] = [
  { id: "site", context: "lib/i18n.ts (home page, header, footer)", english: dictionaries.en, shipped: (l) => dictionaries[l] },
  { id: "directory", context: "lib/directoryStrings (public directory pages: /services, /helpers, /categories, /cities)", english: directoryStringsTable.en, shipped: (l) => directoryStringsTable[l] },
  { id: "categories", context: "lib/categoryNames.ts (service category names)", english: categoriesObject(categoryNamesTable.en), shipped: (l) => categoriesObject(categoryNamesTable[l]) },
  { id: "pricing", context: "lib/pricingCopy.ts (home page pricing section)", english: clientPricingCopy.en, shipped: (l) => clientPricingCopy[l] },
  { id: "passPrice", context: "lib/pricingCopy.ts (pass price notes)", english: passPriceCopy.en, shipped: (l) => passPriceCopy[l] },
  { id: "priceWords", context: "lib/priceFormat.ts (price labels; {price} is the formatted amount)", english: PRICE_WORDS.en, shipped: (l) => PRICE_WORDS[l] },
  { id: "storeBadges", context: "lib/storeBadges.ts (App Store / Google Play buttons)", english: storeBadgeCopy.en, shipped: (l) => storeBadgeCopy[l] },
  { id: "staticPages", context: "lib/copy/staticPages.ts (privacy, terms, support, contact, account deletion notice pages)", english: staticPages("en"), shipped: staticPages },
  { id: "appPreview", context: "lib/copy/appPreview.ts (home page: inside the app mockups)", english: appPreviewCopyTable.en, shipped: (l) => appPreviewCopy(l) },
  { id: "forClients", context: "lib/copy/forClients.ts (home page: for clients section)", english: forClientsCopyTable.en, shipped: (l) => forClientsCopy(l) },
  { id: "phone", context: "lib/copy/phone.ts (home page hero phone mockup)", english: phoneCopyTable.en, shipped: (l) => phoneCopyTable[l] },
  { id: "cookieConsent", context: "lib/copy/cookieConsent.ts (cookie consent banner)", english: cookieConsentCopyTable.en, shipped: (l) => cookieConsentCopyTable[l] },
  { id: "maintenance", context: "lib/copy/maintenance.ts (maintenance banner)", english: { text: maintenanceCopyTable.en }, shipped: (l) => ({ text: maintenanceCopyTable[l] }) },
  { id: "reset", context: "lib/resetStrings.ts (password reset page)", english: resetStrings.en, shipped: (l) => resetStrings[l] },
];

/** Keys whose English value is kept in every language (not exported for translation). */
export const UNTRANSLATED_KEYS: ReadonlySet<string> = new Set(["site.waitlist.placeholder"]);

/** `{a: {b: ["x"]}}` -> `{"a.b.0": "x"}`. Non-string leaves are ignored. */
export function flattenStrings(value: unknown, prefix = "", out: FlatStrings = {}): FlatStrings {
  if (typeof value === "string") {
    if (prefix) out[prefix] = value;
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => flattenStrings(item, prefix ? `${prefix}.${index}` : String(index), out));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) flattenStrings(item, prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

/** English source strings of every table, keyed `<table>.<path>`, with their context. */
export function englishSource(): { key: string; text: string; context: string; translate: boolean }[] {
  return stringTables.flatMap((table) =>
    Object.entries(flattenStrings(table.english, table.id)).map(([key, text]) => ({
      key,
      text,
      context: table.context,
      translate: !UNTRANSLATED_KEYS.has(key),
    })),
  );
}

/** Flat strings of a shipped locale as it renders today (used as a parent, e.g. `ar` for `ar-EG`). */
export function shippedFlatStrings(locale: ShippedLocale): FlatStrings {
  const out: FlatStrings = {};
  for (const table of stringTables) flattenStrings(table.shipped(locale), table.id, out);
  return out;
}

/** Rebuilds `english` with each string replaced by the first non-empty value of `chain`. */
function rebuild(english: unknown, key: string, chain: readonly FlatStrings[]): unknown {
  if (typeof english === "string") {
    if (UNTRANSLATED_KEYS.has(key)) return english;
    for (const strings of chain) {
      const value = strings[key];
      if (typeof value === "string" && value.trim()) return value;
    }
    return english;
  }
  if (Array.isArray(english)) return english.map((item, index) => rebuild(item, `${key}.${index}`, chain));
  if (english && typeof english === "object") {
    return Object.fromEntries(Object.entries(english).map(([name, item]) => [name, rebuild(item, `${key}.${name}`, chain)]));
  }
  return english;
}

/**
 * Typed tables of a registry language from its flat strings, most specific first (exact code,
 * then parents; a regional pack only holds overrides). Every key missing from all of them is
 * English (never the key itself).
 */
export function resolveExtraTables(chain: readonly FlatStrings[], meta: ExtraLocaleMeta): ExtraLocaleTables {
  const tables = Object.fromEntries(stringTables.map((table) => [table.id, rebuild(table.english, table.id, chain)]));
  return { meta, ...tables } as ExtraLocaleTables;
}
