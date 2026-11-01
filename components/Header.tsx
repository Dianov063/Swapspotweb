import HeaderClient from "./HeaderClient";
import { defaultLocale, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { languageOptions } from "@/lib/languages";

/**
 * Site header (server wrapper): the language switcher lists the current site languages, i.e. the
 * 16 shipped locales plus public, bundled registry languages (lib/languages.ts).
 */
export default async function Header({
  locale = defaultLocale,
  dictionary = getDictionary(locale),
}: {
  locale?: Locale;
  dictionary?: Dictionary;
}) {
  return <HeaderClient locale={locale} dictionary={dictionary} languages={await languageOptions()} />;
}
