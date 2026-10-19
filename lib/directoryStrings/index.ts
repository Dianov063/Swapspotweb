// Translated UI chrome of the public directory pages. User content (names, service titles,
// descriptions, place names) is shown as entered and never machine-translated.
import { categoryName } from "@/lib/categoryNames";
import { dictionaries, type Locale } from "@/lib/i18n";
import { ar } from "./ar";
import { bn } from "./bn";
import { de } from "./de";
import { en, type DirectoryStrings } from "./en";
import { es } from "./es";
import { fil } from "./fil";
import { fr } from "./fr";
import { hi } from "./hi";
import { ht } from "./ht";
import { pt } from "./pt";
import { ru } from "./ru";
import { ta } from "./ta";
import { te } from "./te";
import { th } from "./th";
import { vi } from "./vi";
import { zh } from "./zh";

export type { DirectoryStrings } from "./en";

const strings: Record<Locale, DirectoryStrings> = { en, es, zh, fr, ru, ar, pt, ht, de, fil, hi, bn, te, ta, vi, th };

export function directoryStrings(locale: Locale): DirectoryStrings {
  return strings[locale] ?? en;
}

export type TemplateVars = Record<string, string | number>;

/** Replaces `{name}` placeholders; unknown placeholders are left as is. */
export function fillTemplate(template: string, vars: TemplateVars) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

// Languages where a category name inside a sentence reads naturally in lower case.
const LOWERCASE_IN_SENTENCE = new Set<Locale>(["en", "es", "fr", "pt", "ru", "vi", "ht", "fil"]);

/** Template variables for a category name: `{category}` as is, `{categoryLower}` for in-sentence use. */
export function categoryVars(name: string, locale: Locale): { category: string; categoryLower: string } {
  return {
    category: name,
    categoryLower: LOWERCASE_IN_SENTENCE.has(locale) ? name.toLocaleLowerCase(locale) : name,
  };
}

/**
 * Category label in the page language. Directory slugs from the backend
 * (`home-repair-and-maintenance`) map to the site's category keys (`home-repair-maintenance`);
 * unknown categories (and English pages) keep the backend name.
 */
export function localizedCategoryName(slug: string | null | undefined, fallbackName: string, locale: Locale) {
  if (locale === "en") return fallbackName;
  const names = dictionaries[locale].categories.names as Record<string, string>;
  return categoryName(slug, locale) ?? names[String(slug ?? "")] ?? fallbackName;
}

export function t(locale: Locale, key: keyof DirectoryStrings, vars: TemplateVars = {}) {
  return fillTemplate(directoryStrings(locale)[key], vars);
}

/** Language label in the page language when the value is a language code ("es" -> "Spanish"); other values as entered. */
export function languageLabel(value: string, locale: Locale) {
  if (!/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(value)) return value;
  try {
    const name = new Intl.DisplayNames([locale === "zh" ? "zh-Hans" : locale, "en"], { type: "language" }).of(value);
    return name && name !== value ? name : value;
  } catch {
    return value;
  }
}
