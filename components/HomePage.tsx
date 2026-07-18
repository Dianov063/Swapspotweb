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
import type { Dictionary, Locale } from "@/lib/i18n";

export default function HomePage({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <div
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
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
        <ClientPricing locale={locale} />
        <ForHelpers locale={locale} dictionary={dictionary} />
        <Categories locale={locale} dictionary={dictionary} />
        <TrustSafety dictionary={dictionary} />
        <AppPreview locale={locale} />
        <WaitlistCTA locale={locale} dictionary={dictionary} />
      </main>
      <Footer locale={locale} dictionary={dictionary} />
    </div>
  );
}
