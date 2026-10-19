import Header from "@/components/Header";
import AppDownloadStrip from "@/components/AppDownloadStrip";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ForClients from "@/components/ForClients";
import ClientPricing from "@/components/ClientPricing";
import ForHelpers from "@/components/ForHelpers";
import Categories from "@/components/Categories";
import TrustSafety from "@/components/TrustSafety";
import AppPreview from "@/components/AppPreview";
import WaitlistCTA from "@/components/WaitlistCTA";
import Footer from "@/components/Footer";
import { languageTag, textDirection, type Dictionary, type Locale } from "@/lib/i18n";
import { storeBadgesFor } from "@/lib/storeBadges";

export default function HomePage({
  locale,
  dictionary,
  marketCountry,
}: {
  locale: Locale;
  dictionary: Dictionary;
  marketCountry?: string | null;
}) {
  return (
    <div
      lang={languageTag(locale)}
      dir={textDirection(locale)}
      className="min-w-0 overflow-x-clip [&_*]:min-w-0"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "SwapSpot",
            description: dictionary.footer.tagline,
            url: "https://www.swapspot.org",
          }),
        }}
      />
      <Header locale={locale} dictionary={dictionary} />
      <AppDownloadStrip locale={locale} dictionary={dictionary} />
      <main>
        <Hero locale={locale} dictionary={dictionary} />
        <HowItWorks dictionary={dictionary} />
        <ForClients locale={locale} />
        <ClientPricing locale={locale} marketCountry={marketCountry} />
        <ForHelpers locale={locale} dictionary={dictionary} />
        <Categories locale={locale} dictionary={dictionary} />
        <TrustSafety dictionary={dictionary} />
        <AppPreview locale={locale} />
        <WaitlistCTA locale={locale} dictionary={dictionary} storeBadges={storeBadgesFor(locale)} />
      </main>
      <Footer locale={locale} dictionary={dictionary} />
    </div>
  );
}
