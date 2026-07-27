import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppDownloadStrip from "@/components/AppDownloadStrip";
import ForHelpers from "@/components/ForHelpers";
import TrustSafety from "@/components/TrustSafety";
import { dictionaries, defaultLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Become a Helper - Earn Locally",
  description:
    "Turn your skills into local income on SwapSpot. Create a free helper profile, set your prices and availability, and get booked by nearby clients.",
  alternates: {
    canonical: "/helpers",
  },
};

export default function HelpersPage() {
  const dictionary = dictionaries[defaultLocale];

  return (
    <div lang={defaultLocale} className="min-w-0 overflow-x-clip [&_*]:min-w-0">
      <Header locale={defaultLocale} dictionary={dictionary} />
      <main className="pt-[clamp(42px,6vw,78px)]">
        <ForHelpers locale={defaultLocale} dictionary={dictionary} />
        <TrustSafety dictionary={dictionary} />
        <AppDownloadStrip locale={defaultLocale} dictionary={dictionary} />
      </main>
      <Footer locale={defaultLocale} dictionary={dictionary} />
    </div>
  );
}
