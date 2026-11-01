// Strings of a registry language that client components of the root layout need (cookie banner,
// maintenance banner). Client components cannot read the server-side registry
// (lib/extraLocales.ts), so the [locale] layout passes this object down as a prop.
import type { CookieConsentCopy } from "./copy/cookieConsent";
import { extraLocaleTables } from "./extraLocales";

export type RegistryLanguageCopy = {
  segment: string;
  dir: "ltr" | "rtl";
  cookieConsent: CookieConsentCopy;
  maintenance: string;
};

/** Server side: the copy of a registered registry language, undefined for shipped locales. */
export function registryLanguageCopy(segment: string): RegistryLanguageCopy | undefined {
  const tables = extraLocaleTables(segment);
  if (!tables) return undefined;
  return { segment, dir: tables.meta.dir, cookieConsent: tables.cookieConsent, maintenance: tables.maintenance.text };
}
