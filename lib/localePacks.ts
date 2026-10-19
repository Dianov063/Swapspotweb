// Locale packs of registry languages: `lib/locales/<code>.json` (flat key -> string, written by the
// translation workflow, docs/swapspot-africa.md §5). Server only (reads the file system); the
// files are traced into the deployment by `outputFileTracingIncludes` in next.config.js.
//
// A language counts as bundled when its pack exists and is a valid flat object. Strings are
// resolved exact -> parents -> English and registered for the page's getters (lib/extraLocales.ts).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { extraLocaleTables, registerExtraLocale } from "./extraLocales";
import type { SiteLanguage } from "./languagesCore";
import { urlSegment } from "./languagesCore";
import { isLocale } from "./locales";
import { resolveExtraTables, shippedFlatStrings, type FlatStrings } from "./stringTables";

const PACK_DIR = join(process.cwd(), "lib", "locales");
const CODE_PATTERN = /^[a-z]{2,3}(-[A-Z][a-z]{3})?(-(?:[A-Z]{2}|\d{3}))?$/;
// Packs are immutable in a deployment; in development they are re-read so translators see edits.
const cachePacks = process.env.NODE_ENV === "production";
const packs = new Map<string, FlatStrings | null>();

/** Parses a pack: a JSON object of string values (nested values are ignored). Null when invalid. */
export function parseLocalePack(text: string): FlatStrings | null {
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const strings: FlatStrings = {};
    for (const [key, item] of Object.entries(value)) if (typeof item === "string") strings[key] = item;
    return strings;
  } catch {
    return null;
  }
}

/** The pack of a registry code (`sw`, `ar-EG`), or null when it is not bundled. */
export function readLocalePack(code: string): FlatStrings | null {
  if (!CODE_PATTERN.test(code)) return null;
  if (cachePacks && packs.has(code)) return packs.get(code) ?? null;
  let pack: FlatStrings | null = null;
  try {
    pack = parseLocalePack(readFileSync(join(PACK_DIR, `${code}.json`), "utf8"));
  } catch {
    pack = null;
  }
  if (cachePacks) packs.set(code, pack);
  return pack;
}

export function isLocalePackBundled(code: string) {
  return readLocalePack(code) !== null;
}

/** Intl locale list of a registry language: its chain as BCP 47 tags, then English. */
function intlChain(language: SiteLanguage) {
  return [...new Set([...language.chain, "en"])];
}

/**
 * Resolves and registers the tables of a registry language (idempotent). Shipped locales need
 * nothing. Call before rendering anything in that language.
 */
export function ensureLocaleTables(language: SiteLanguage) {
  if (language.shipped) return;
  if (cachePacks && extraLocaleTables(language.segment)) return;
  const chain = language.chain.map((code) => {
    const segment = urlSegment(code);
    return isLocale(segment) ? shippedFlatStrings(segment) : (readLocalePack(code) ?? {});
  });
  registerExtraLocale(
    language.segment,
    resolveExtraTables(chain, {
      code: language.code,
      tag: language.tag,
      dir: language.dir,
      script: language.script,
      intl: intlChain(language),
    }),
  );
}
