import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicServiceCards from "@/components/PublicServiceCards";
import {
  getDirectoryCategory,
  getDirectoryMarket,
  getPublicServiceListings,
} from "@/lib/publicDirectory";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    categorySlug: string;
    marketSlug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, marketSlug } = await params;
  const [category, market] = await Promise.all([
    getDirectoryCategory(categorySlug),
    getDirectoryMarket(marketSlug),
  ]);

  if (!category || !market) return {};

  return {
    title: `${category.name} Helpers in ${market.name} - SwapSpot`,
    description: `Find ${category.name.toLowerCase()} helpers in ${market.name}. Compare public service previews, ZIP-based service areas, pricing, languages, and ratings before opening SwapSpot.`,
    alternates: {
      canonical: `/services/${category.slug}/${market.slug}`,
    },
    openGraph: {
      title: `${category.name} Helpers in ${market.name}`,
      description: `Browse local ${category.name.toLowerCase()} services near ${market.name} and continue in the SwapSpot app.`,
      url: `https://www.swapspot.org/services/${category.slug}/${market.slug}`,
      type: "website",
    },
  };
}

export default async function ServiceMarketPage({ params }: Props) {
  const { categorySlug, marketSlug } = await params;
  const [category, market] = await Promise.all([
    getDirectoryCategory(categorySlug),
    getDirectoryMarket(marketSlug),
  ]);

  if (!category || !market) notFound();

  const listings = await getPublicServiceListings({
    categorySlug: category.slug,
    marketSlug: market.slug,
    limit: 30,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} helpers in ${market.name}`,
    description: `Public previews of ${category.name.toLowerCase()} services available through SwapSpot in ${market.name}.`,
    itemListElement: listings.slice(0, 12).map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: listing.search_title_en || listing.service_name,
        serviceType: listing.category_name,
        areaServed: listing.market_name,
        provider: {
          "@type": "LocalBusiness",
          name: `${listing.helper_display_name || "Local helper"} on SwapSpot`,
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

  return (
    <>
      <Header />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">
          Local service directory
        </p>
        <h1 className="mt-3 max-w-[860px] font-head text-[clamp(34px,5vw,58px)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
          {category.name} helpers in {market.name}
        </h1>
        <p className="mt-5 max-w-[760px] text-[18px] leading-[1.6] text-ink-soft">
          Browse public previews from nearby SwapSpot helpers. We show only
          service names, approximate ZIP-based areas, prices, languages, and
          ratings here. Messaging, exact addresses, quotes, and booking stay
          inside the mobile app.
        </p>

        <PublicServiceCards
          listings={listings}
          categoryName={category.name}
          marketName={market.name}
        />
      </main>
      <Footer />
    </>
  );
}

