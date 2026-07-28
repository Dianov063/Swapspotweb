import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ClipboardCheck,
  Languages,
  MapPin,
  MessageCircle,
  Search,
  Star,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicServiceCards from "@/components/PublicServiceCards";
import {
  formatServicePrice,
  getDirectoryPair,
  getPublicServiceListings,
  getHelperName,
  getListingLanguages,
  getServiceTitle,
} from "@/lib/publicDirectory";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    categorySlug: string;
    marketSlug: string;
  }>;
};

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function buildPageSummary({
  categoryName,
  marketName,
  serviceCount,
  helperCount,
}: {
  categoryName: string;
  marketName: string;
  serviceCount: number;
  helperCount: number;
}) {
  if (!serviceCount) {
    return `SwapSpot is preparing ${categoryName.toLowerCase()} helper previews in ${marketName}. Open the app to browse nearby helpers, compare service areas, and request quotes.`;
  }

  return `Compare ${serviceCount} public ${categoryName.toLowerCase()} service preview${
    serviceCount === 1 ? "" : "s"
  } from ${helperCount} helper${
    helperCount === 1 ? "" : "s"
  } around ${marketName}. Use the app when you are ready to message, request a quote, or book.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, marketSlug } = await params;
  const pair = await getDirectoryPair(categorySlug, marketSlug);

  if (!pair) return {};

  return {
    title: `${pair.categoryName} Helpers in ${pair.marketName} - SwapSpot`,
    description: `Find ${pair.categoryName.toLowerCase()} helpers in ${pair.marketName}. Compare public service previews, ZIP-based service areas, pricing, languages, and ratings before opening SwapSpot.`,
    alternates: {
      canonical: `/services/${pair.categorySlug}/${pair.marketSlug}`,
    },
    openGraph: {
      title: `${pair.categoryName} Helpers in ${pair.marketName}`,
      description: `Browse local ${pair.categoryName.toLowerCase()} services near ${pair.marketName} and continue in the SwapSpot app.`,
      url: `https://www.swapspot.org/services/${pair.categorySlug}/${pair.marketSlug}`,
      type: "website",
    },
  };
}

export default async function ServiceMarketPage({ params }: Props) {
  const { categorySlug, marketSlug } = await params;
  const pair = await getDirectoryPair(categorySlug, marketSlug);

  if (!pair) notFound();

  const listings = await getPublicServiceListings({
    categorySlug: pair.categorySlug,
    marketSlug: pair.marketSlug,
    limit: 30,
  });
  const serviceNames = uniqueValues(listings.map((listing) => getServiceTitle(listing)));
  const helperNames = uniqueValues(listings.map((listing) => getHelperName(listing)));
  const languages = uniqueValues(listings.flatMap((listing) => getListingLanguages(listing)));
  const pricedListings = listings.filter((listing) => Number(listing.price || 0) > 0);
  const lowestPricedListing = pricedListings.sort(
    (a, b) => Number(a.price || 0) - Number(b.price || 0),
  )[0];
  const pageSummary = buildPageSummary({
    categoryName: pair.categoryName,
    marketName: pair.marketName,
    serviceCount: listings.length,
    helperCount: helperNames.length,
  });
  const faq = [
    {
      question: `Can I book ${pair.categoryName.toLowerCase()} helpers in ${pair.marketName} on this page?`,
      answer:
        "This website page is a public preview for discovery. Download SwapSpot to message helpers, request quotes, share exact addresses, and manage bookings.",
    },
    {
      question: "Are exact helper addresses public?",
      answer:
        "No. SwapSpot shows approximate service areas such as ZIP codes, neighborhoods, cities, or radius. Exact addresses stay private and can be shared in chat only when both sides are ready.",
    },
    {
      question: "Do helpers pay SwapSpot a commission?",
      answer:
        "No. Helpers can create a profile and list services without a SwapSpot commission or percentage fee. Clients pay for access when they want to message, request quotes, or book.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${pair.categoryName} helpers in ${pair.marketName}`,
    description: `Public previews of ${pair.categoryName.toLowerCase()} services available through SwapSpot in ${pair.marketName}.`,
    itemListElement: listings.slice(0, 12).map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: getServiceTitle(listing),
        serviceType: listing.category_name,
        areaServed: listing.market_name,
        provider: {
          "@type": "LocalBusiness",
          name: `${getHelperName(listing)} on SwapSpot`,
          address: listing.service_area_zip
            ? {
                "@type": "PostalAddress",
                postalCode: listing.service_area_zip,
                addressCountry: listing.country_code || "US",
              }
            : undefined,
          aggregateRating: Number(listing.rating_count || 0)
            ? {
                "@type": "AggregateRating",
                ratingValue: Number(listing.rating_avg || 0),
                reviewCount: Number(listing.rating_count || 0),
              }
            : undefined,
        },
        offers: Number(listing.price || 0)
          ? {
              "@type": "Offer",
              price: Number(listing.price || 0),
              priceCurrency: listing.currency_code || "USD",
            }
          : undefined,
      },
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">
          Local service directory
        </p>
        <h1 className="mt-3 max-w-[860px] font-head text-[clamp(34px,5vw,58px)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
          {pair.categoryName} helpers in {pair.marketName}
        </h1>
        <p className="mt-5 max-w-[760px] text-[18px] leading-[1.6] text-ink-soft">
          {pageSummary}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
            <Search className="h-5 w-5 text-green" />
            <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
              {listings.length}
            </div>
            <p className="text-[14px] font-semibold text-ink-soft">
              service previews
            </p>
          </div>
          <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
            <Star className="h-5 w-5 text-gold" />
            <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
              {helperNames.length || "-"}
            </div>
            <p className="text-[14px] font-semibold text-ink-soft">
              helpers listed
            </p>
          </div>
          <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
            <Languages className="h-5 w-5 text-green" />
            <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
              {languages.length || "-"}
            </div>
            <p className="text-[14px] font-semibold text-ink-soft">
              languages shown
            </p>
          </div>
          <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
            <ClipboardCheck className="h-5 w-5 text-green" />
            <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
              {lowestPricedListing ? formatServicePrice(lowestPricedListing) : "Quotes"}
            </div>
            <p className="text-[14px] font-semibold text-ink-soft">
              sample starting price
            </p>
          </div>
        </div>

        {serviceNames.length ? (
          <section className="mt-10 rounded-card-md border border-line bg-cream p-6 shadow-card-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">
                  Popular local services
                </p>
                <h2 className="mt-2 font-head text-[30px] font-extrabold text-ink">
                  What people can find in {pair.marketName}
                </h2>
              </div>
              <p className="max-w-[470px] text-[15px] leading-[1.55] text-ink-soft">
                These services come from published helper profiles, not a static
                marketing list.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {serviceNames.slice(0, 18).map((serviceName) => (
                <span
                  key={serviceName}
                  className="rounded-full border border-green/25 bg-surface px-4 py-2 text-[14px] font-extrabold text-green-deep"
                >
                  {serviceName}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          <article className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
            <MapPin className="h-5 w-5 text-green" />
            <h2 className="mt-4 font-head text-[23px] font-extrabold text-ink">
              Local area, not exact address
            </h2>
            <p className="mt-2 text-[15px] leading-[1.55] text-ink-soft">
              Public pages show neighborhoods, ZIP codes, cities, and service
              radius so clients can discover nearby help without exposing private
              addresses.
            </p>
          </article>
          <article className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
            <Search className="h-5 w-5 text-green" />
            <h2 className="mt-4 font-head text-[23px] font-extrabold text-ink">
              Search-ready service names
            </h2>
            <p className="mt-2 text-[15px] leading-[1.55] text-ink-soft">
              Helper services are normalized into searchable titles, local terms,
              and category pages so clients can search by real jobs they need.
            </p>
          </article>
          <article className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
            <MessageCircle className="h-5 w-5 text-green" />
            <h2 className="mt-4 font-head text-[23px] font-extrabold text-ink">
              Chat and booking stay in-app
            </h2>
            <p className="mt-2 text-[15px] leading-[1.55] text-ink-soft">
              The website helps people discover services. SwapSpot keeps quotes,
              messages, bookings, reviews, and safety controls inside the mobile
              app.
            </p>
          </article>
        </section>

        <PublicServiceCards
          listings={listings}
          categoryName={pair.categoryName}
          marketName={pair.marketName}
        />

        <section className="mt-12 rounded-card-md border border-line bg-surface p-6 shadow-card-sm">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">
            Questions
          </p>
          <h2 className="mt-2 font-head text-[30px] font-extrabold text-ink">
            How this public page works
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {faq.map((item) => (
              <article key={item.question} className="rounded-[14px] border border-line bg-sand p-4">
                <h3 className="text-[16px] font-extrabold leading-snug text-ink">
                  {item.question}
                </h3>
                <p className="mt-2 text-[14.5px] leading-[1.55] text-ink-soft">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

