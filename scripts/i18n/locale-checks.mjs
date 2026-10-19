// Automated checks for site locale packs `lib/locales/<code>.json` (docs/swapspot-africa.md §5).
// Pure functions shared by scripts/i18n/check-locales.mjs, scripts/i18n/export-source.mjs and the
// tests. A pack is a flat JSON object: source key (i18n-source/web.json) -> translated string.
import { createHash } from "node:crypto";

/** Brand and product names that stay as written; a string made only of these may equal English. */
export const BRAND_TERMS = ["SwapSpot", "Client Pro", "App Store", "Google Play"];

const PLACEHOLDER = /\{\{\s*\w+\s*\}\}|\{\w+\}|%\d+\$[sd]|%[sd]/g;

// Script ranges for the sanity check (ISO 15924 code -> letters of that script).
const SCRIPT_LETTERS = {
  Ethi: /[ሀ-᎟ⶀ-⷟꬀-꬯]/u,
  Tfng: /[ⴰ-⵿]/u,
  Arab: /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/u,
  Latn: /[A-Za-zÀ-ɏḀ-ỿƆƐɔɛɣʋ]/u,
};
// Letters of scripts that must not appear in a Latin-script language.
const FOREIGN_TO_LATIN = /[Ѐ-ӿ؀-ۿሀ-᎟ⴰ-⵿一-鿿ऀ-෿฀-๿]/u;

export function placeholders(text) {
  return [...new Set(String(text).match(PLACEHOLDER) ?? [])].sort();
}

/** Placeholders compared across languages: {categoryLower} is {category} in another spelling. */
function comparablePlaceholders(text) {
  return placeholders(text).map((item) => (item === "{categoryLower}" ? "{category}" : item));
}

/** Short stable hash of the English text, so translation runs can re-translate changed keys only. */
export function sourceHash(text) {
  return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 12);
}

/** Length hint for short UI strings (labels, buttons): about twice the English length. */
export function maxLengthHint(text) {
  return text.length <= 60 ? Math.max(12, Math.ceil(text.length * 2)) : null;
}

/** The text without brand names, placeholders, e-mail addresses, URLs, digits and punctuation. */
function letters(text) {
  let value = String(text);
  for (const term of BRAND_TERMS) value = value.split(term).join(" ");
  return value
    .replace(PLACEHOLDER, " ")
    .replace(/\S+@\S+|https?:\/\/\S+/g, " ")
    .replace(/[\p{N}\p{P}\p{S}\s]/gu, "");
}

export function isBrandOnly(text) {
  return letters(text).length === 0;
}

/** Is the string written in the expected script? Unknown scripts are not checked. */
export function scriptMatches(text, script) {
  const rest = letters(text);
  if (!rest) return true;
  if (script === "Latn") return SCRIPT_LETTERS.Latn.test(rest) && !FOREIGN_TO_LATIN.test(rest);
  const pattern = SCRIPT_LETTERS[script];
  return pattern ? pattern.test(rest) : true;
}

/** Regional variants (`ar-EG`, `pt-AO`, `sw-KE`) hold only overrides of their parent. */
export function isRegionalVariant(code) {
  return /^[a-z]{2,3}(-[A-Z][a-z]{3})?-(?:[A-Z]{2}|\d{3})$/.test(code);
}

/**
 * Checks one pack. `source` is i18n-source/web.json, `language` the registry entry
 * ({code, script, parent}), `text` the file content. Returns {errors, warnings} (strings).
 */
export function checkLocalePack({ code, text, source, language, hashes = null }) {
  const errors = [];
  const warnings = [];
  if (!language) {
    errors.push(`${code}: not in the language registry (lib/languagesSnapshot.json)`);
    return { errors, warnings };
  }

  let pack;
  try {
    pack = JSON.parse(text);
  } catch (error) {
    errors.push(`${code}: invalid JSON (${error.message})`);
    return { errors, warnings };
  }
  if (!pack || typeof pack !== "object" || Array.isArray(pack)) {
    errors.push(`${code}: the file must be a flat JSON object of key -> string`);
    return { errors, warnings };
  }

  const strings = new Map(source.strings.map((item) => [item.key, item]));
  const untranslated = new Set(source.untranslated ?? []);
  const regional = isRegionalVariant(code);

  for (const [key, value] of Object.entries(pack)) {
    const entry = strings.get(key);
    if (!entry) {
      errors.push(untranslated.has(key) ? `${code}: ${key} is not translated (always English)` : `${code}: unknown key ${key}`);
      continue;
    }
    if (typeof value !== "string") {
      errors.push(`${code}: ${key} must be a string (flat key -> string, no nesting)`);
      continue;
    }
    if (!value.trim()) {
      errors.push(`${code}: ${key} is empty`);
      continue;
    }
    const expected = comparablePlaceholders(entry.text);
    const actual = comparablePlaceholders(value);
    if (expected.join(" ") !== actual.join(" ")) {
      errors.push(`${code}: ${key} placeholders ${JSON.stringify(actual)} differ from English ${JSON.stringify(expected)}`);
    }
    if (value.trim() === entry.text.trim() && !isBrandOnly(entry.text)) {
      errors.push(`${code}: ${key} is a copy of the English text`);
    }
    if (language.script && !scriptMatches(value, language.script)) {
      errors.push(`${code}: ${key} is not written in the ${language.script} script`);
    }
    if (entry.max_length && value.length > entry.max_length) {
      warnings.push(`${code}: ${key} is ${value.length} characters (hint ${entry.max_length})`);
    }
    if (hashes && hashes[key] && hashes[key] !== entry.hash) {
      warnings.push(`${code}: ${key} was translated from an older English text (re-translate)`);
    }
  }

  if (!regional) {
    for (const key of strings.keys()) {
      if (!(key in pack)) errors.push(`${code}: missing ${key}`);
    }
  } else if (!language.parent) {
    errors.push(`${code}: a regional variant needs a parent in the registry`);
  }
  return { errors, warnings };
}
