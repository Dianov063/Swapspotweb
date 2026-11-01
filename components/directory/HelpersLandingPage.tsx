import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppDownloadStrip from "@/components/AppDownloadStrip";
import ForHelpers from "@/components/ForHelpers";
import TrustSafety from "@/components/TrustSafety";
import { directoryStrings } from "@/lib/directoryStrings";
import { getDictionary, languageTag, textDirection, type Locale } from "@/lib/i18n";
import { localeAlternates } from "@/lib/languages";

export async function helpersLandingMetadata(locale: Locale): Promise<Metadata> {
  const t = directoryStrings(locale);
  return {
    title: t.helpersMetaTitle,
    description: t.helpersMetaDescription,
    alternates: await localeAlternates("/helpers", locale),
  };
}

/** "Become a helper" page (/helpers and /<locale>/helpers). */
export default function HelpersLandingPage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);

  return (
    <div lang={languageTag(locale)} dir={textDirection(locale)} className="min-w-0 overflow-x-clip [&_*]:min-w-0">
      <Header locale={locale} dictionary={dictionary} />
      <main className="pt-[clamp(42px,6vw,78px)]">
        <ForHelpers locale={locale} dictionary={dictionary} headingLevel="h1" />
        <TrustSafety dictionary={dictionary} />
        <AppDownloadStrip locale={locale} dictionary={dictionary} />
      </main>
      <Footer locale={locale} dictionary={dictionary} />
    </div>
  );
}
