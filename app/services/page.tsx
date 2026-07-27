import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe2, MapPin, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui";
import { getDirectoryPairs, type DirectoryPair } from "@/lib/publicDirectory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Local Service Directory - SwapSpot",
  description:
    "Browse SwapSpot public service pages by category and local market. Find cleaning, repairs, moving, tutoring, pet care, beauty, professional services, and more.",
  alternates: {
    canonical: "/services",
  },
};

function countryLabel(countryCode: string | null) {
  if (!countryCode) return "Other markets";

  const labels: Record<string, string> = {
    DO: "Dominican Republic",
    HT: "Haiti",
    IN: "India",
    PH: "Philippines",
    PR: "Puerto Rico",
    TH: "Thailand",
    US: "United States",
    VN: "Vietnam",
  };

  return labels[countryCode] || countryCode;
}

function groupByCountry(pairs: DirectoryPair[]) {
  const countries = new Map<string, DirectoryPair[]>();

  for (const pair of pairs) {
    const label = countryLabel(pair.countryCode);
    const existing = countries.get(label) || [];
    existing.push(pair);
    countries.set(label, existing);
  }

  return [...countries.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default async function ServicesDirectoryPage() {
  const pairs = await getDirectoryPairs();
  const countries = groupByCountry(pairs);
  const topPairs = [...pairs]
    .sort((a, b) => b.listingCount - a.listingCount)
    .slice(0, 12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SwapSpot local service directory",
    description:
      "Public directory of local service pages generated from active SwapSpot helper services.",
    hasPart: topPairs.map((pair) => ({
      "@type": "WebPage",
      name: `${pair.categoryName} helpers in ${pair.marketName}`,
      url: `https://www.swapspot.org/services/${pair.categorySlug}/${pair.marketSlug}`,
    })),
  };

  return (
    <>
      <Header />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <section className="border-b border-line bg-gradient-to-br from-green-soft via-sand to-gold-soft/40">
          <div className="mx-auto max-w-wrap px-6 py-[clamp(48px,7vw,92px)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-green/15 bg-surface/85 px-3 py-1 text-[12px] font-extrabold uppercase tracking-[0.08em] text-green-deep">
              <Search className="h-3.5 w-3.5" />
              Public SEO directory
            </div>
            <h1 className="mt-4 max-w-[900px] font-head text-[clamp(36px,6vw,68px)] font-bold leading-[1.04] tracking-[-0.02em] text-ink">
              Local helper services by category and market
            </h1>
            <p className="mt-5 max-w-[780px] text-[18px] leading-[1.6] text-ink-soft">
              These pages are generated from published helper services in
              SwapSpot. They help clients discover real service previews by city,
              ZIP code, neighborhood, category, price, language, and rating.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="#markets">Browse markets</Button>
              <Button href="/#download" variant="white">
                Get the app
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-wrap px-6 py-[clamp(42px,6vw,78px)]">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-green-soft text-green">
                <Globe2 className="h-5 w-5" />
              </div>
              <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
                {countries.length}
              </div>
              <p className="mt-1 text-[15px] font-semibold text-ink-soft">
                countries and regional markets
              </p>
            </div>
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-green-soft text-green">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
                {pairs.length}
              </div>
              <p className="mt-1 text-[15px] font-semibold text-ink-soft">
                live category-market SEO pages
              </p>
            </div>
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold-soft text-gold-deep">
                <Search className="h-5 w-5" />
              </div>
              <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
                {pairs.reduce((sum, pair) => sum + pair.listingCount, 0)}
              </div>
              <p className="mt-1 text-[15px] font-semibold text-ink-soft">
                public service previews indexed into pages
              </p>
            </div>
          </div>
        </section>

        <section id="markets" className="border-t border-line bg-cream">
          <div className="mx-auto max-w-wrap px-6 py-[clamp(46px,6vw,82px)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">
                  Available pages
                </p>
                <h2 className="mt-3 font-head text-[clamp(30px,4vw,46px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
                  Browse by country
                </h2>
              </div>
              <p className="max-w-[520px] text-[15.5px] leading-[1.55] text-ink-soft">
                Every link below should resolve to a public SEO page. If a helper
                publishes a new service area, it appears here after the site cache
                refreshes.
              </p>
            </div>

            {!countries.length ? (
              <div className="mt-8 rounded-card-md border border-line bg-surface p-6 shadow-card-sm">
                <h3 className="font-head text-[24px] font-extrabold text-ink">
                  Service links are being prepared
                </h3>
                <p className="mt-3 max-w-[680px] text-[15.5px] leading-[1.6] text-ink-soft">
                  The directory is connected to published helper services. If no
                  links appear here, the public data feed is temporarily empty or
                  the website environment needs its Supabase read key.
                </p>
              </div>
            ) : null}

            <div className="mt-8 grid gap-6">
              {countries.map(([country, countryPairs]) => (
                <section key={country} className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
                  <div className="flex flex-col gap-1 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-head text-[24px] font-extrabold text-ink">
                      {country}
                    </h3>
                    <span className="text-[14px] font-bold text-ink-soft">
                      {countryPairs.length} pages
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {countryPairs
                      .sort((a, b) =>
                        `${a.marketName} ${a.categoryName}`.localeCompare(
                          `${b.marketName} ${b.categoryName}`,
                        ),
                      )
                      .map((pair) => (
                        <Link
                          key={`${pair.categorySlug}:${pair.marketSlug}`}
                          href={`/services/${pair.categorySlug}/${pair.marketSlug}`}
                          className="group rounded-[12px] border border-line bg-sand px-4 py-3 transition-colors hover:border-green hover:bg-green-soft"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[15px] font-extrabold leading-snug text-ink">
                                {pair.categoryName}
                              </p>
                              <p className="mt-1 text-[14px] font-semibold text-ink-soft">
                                {pair.marketName}
                              </p>
                              <p className="mt-2 text-[12.5px] font-bold text-green-deep">
                                {pair.listingCount} services
                              </p>
                            </div>
                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-green opacity-70 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
