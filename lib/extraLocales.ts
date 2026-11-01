// Resolved string tables of registry languages (docs/swapspot-africa.md §4, website row).
//
// The 16 shipped locales live in TypeScript tables. A registry language (`sw`, `ar-eg`, ...) has a
// flat locale pack `lib/locales/<code>.json`; lib/localePacks.ts (server only) merges it with its
// parents and English and registers the result here under the URL segment, before a page in
// that language renders. The getters of every table (`getDictionary`, `directoryStrings`,
// `pricingCopy`, ...) read from here for non-shipped locales. Client components never see this
// registry: they receive registry-language strings as props from the server.
import type { CookieConsentCopy } from "./copy/cookieConsent";
import type { AppPreviewCopy } from "./copy/appPreview";
import type { ForClientsCopy } from "./copy/forClients";
import type { PhoneCopy } from "./copy/phone";
import type { StaticPagesCopy } from "./copy/staticPages";
import type { DirectoryStrings } from "./directoryStrings/en";
import type { Dictionary } from "./i18n";
import type { PriceWords } from "./priceFormat";
import type { ClientPricingCopy, PassPriceCopy } from "./pricingCopy";
import type { StoreBadgeCopy } from "./storeBadges";
import type { ResetStrings } from "./resetStrings";

export type ExtraLocaleMeta = {
  /** Registry code (`ar-EG`). */
  code: string;
  /** BCP 47 tag for `lang` and Intl. */
  tag: string;
  dir: "ltr" | "rtl";
  script: string | null;
  /** Intl locale list: the tag, its parents, then English (`ary` -> `ary`, `ar`, `en`). */
  intl: string[];
};

export type ExtraLocaleTables = {
  meta: ExtraLocaleMeta;
  site: Dictionary;
  directory: DirectoryStrings;
  pricing: ClientPricingCopy;
  passPrice: PassPriceCopy;
  storeBadges: StoreBadgeCopy;
  categories: Record<string, string>;
  priceWords: PriceWords;
  staticPages: StaticPagesCopy;
  appPreview: AppPreviewCopy;
  forClients: ForClientsCopy;
  phone: PhoneCopy;
  cookieConsent: CookieConsentCopy;
  maintenance: { text: string };
  reset: ResetStrings;
};

const registry = new Map<string, ExtraLocaleTables>();

/** Registers the resolved tables of a registry language under its URL segment (server only). */
export function registerExtraLocale(segment: string, tables: ExtraLocaleTables) {
  registry.set(segment, tables);
}

/** Resolved tables of a registered registry language, or undefined (shipped or unknown locale). */
export function extraLocaleTables(segment: string): ExtraLocaleTables | undefined {
  return registry.get(segment);
}
