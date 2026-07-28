import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Languages,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppStoreButtons from "@/components/AppStoreButtons";
import {
  formatServiceArea,
  formatServicePrice,
  getPublicHelperProfileBySlug,
  getPublicHelperProfiles,
  getServiceTitle,
  type PublicHelperProfile,
  type PublicServiceListing,
} from "@/lib/publicDirectory";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    helperSlug: string;
  }>;
};

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function firstInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildDescription(profile: PublicHelperProfile) {
  const marketText = profile.markets.slice(0, 3).map((market) => market.name).join(", ");
  const serviceText = uniqueValues(profile.listings.map((listing) => getServiceTitle(listing)))
    .slice(0, 4)
    .join(", ");

  return `${profile.displayName} offers ${serviceText || "local services"} through SwapSpot${
    marketText ? ` around ${marketText}` : ""
  }. Compare public service previews, prices, languages, ratings, and service areas before opening the app.`;
}

function serviceJsonLd(listing: PublicServiceListing, profile: PublicHelperProfile) {
  return {
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: getServiceTitle(listing),
      serviceType: listing.category_name,
      areaServed: listing.market_name,
      description: listing.service_description || undefined,
    },
    price: Number(listing.price || 0) || undefined,
    priceCurrency: listing.currency_code || undefined,
    seller: {
      "@type": "LocalBusiness",
      name: `${profile.displayName} on SwapSpot`,
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { helperSlug } = await params;
  const profile = await getPublicHelperProfileBySlug(helperSlug);

  if (!profile) return {};

  const primaryCategory = profile.categories[0]?.name || "Local Services";
  const primaryMarket = profile.markets[0]?.name || "your area";
  const description = buildDescription(profile);

  return {
    title: `${profile.displayName} - ${primaryCategory} Helper in ${primaryMarket} | SwapSpot`,
    description,
    alternates: {
      canonical: `/helpers/${profile.slug}`,
    },
    openGraph: {
      title: `${profile.displayName} on SwapSpot`,
      description,
      url: `https://www.swapspot.org/helpers/${profile.slug}`,
      type: "profile",
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const profiles = await getPublicHelperProfiles({ limit: 1000 });
  return profiles.slice(0, 500).map((profile) => ({
    helperSlug: profile.slug,
  }));
}

export default async function PublicHelperPage({ params }: Props) {
  const { helperSlug } = await params;
  const profile = await getPublicHelperProfileBySlug(helperSlug);

  if (!profile) notFound();

  const serviceTitles = uniqueValues(profile.listings.map((listing) => getServiceTitle(listing)));
  const serviceAreas = uniqueValues(profile.listings.map((listing) => listing.service_area_label || listing.market_name));
  const primaryMarket = profile.markets[0]?.name || "nearby";
  const primaryCategory = profile.categories[0]?.name || "Local Services";
  const pricedListings = profile.listings.filter((listing) => Number(listing.price || 0) > 0);
  const lowestPricedListing = pricedListings.sort(
    (a, b) => Number(a.price || 0) - Number(b.price || 0),
  )[0];
  const description = buildDescription(profile);
  const faq = [
    {
      question: `How do I contact ${profile.displayName}?`,
      answer:
        "Open SwapSpot to message the helper, request a quote, share exact job details, and manage booking safely inside the app.",
    },
    {
      question: "Are exact addresses public?",
      answer:
        "No. Public pages show approximate service areas such as neighborhoods, cities, ZIP codes, or radius. Exact addresses stay private until users share them in chat.",
    },
    {
      question: "Does SwapSpot take a commission from helpers?",
      answer:
        "No. Helpers can list services without SwapSpot taking a commission or percentage from their job payments.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${profile.displayName} on SwapSpot`,
    image: profile.avatarUrl || undefined,
    description,
    areaServed: profile.markets.map((market) => market.name),
    knowsLanguage: profile.languages.length ? profile.languages : undefined,
    aggregateRating: profile.ratingCount
      ? {
          "@type": "AggregateRating",
          ratingValue: profile.ratingAvg.toFixed(1),
          reviewCount: profile.ratingCount,
        }
      : undefined,
    makesOffer: profile.listings.slice(0, 20).map((listing) => serviceJsonLd(listing, profile)),
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
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-green-soft via-sand to-gold-soft/40">
          <div className="mx-auto grid max-w-wrap gap-8 px-6 py-[clamp(46px,7vw,94px)] lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full border border-green/15 bg-surface/85 px-3 py-1.5 text-[13px] font-extrabold text-green-deep transition hover:border-green hover:bg-green-soft"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                Browse service directory
              </Link>

              <p className="mt-8 text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">
                Public helper profile
              </p>
              <h1 className="mt-3 max-w-[760px] font-head text-[clamp(40px,6vw,72px)] font-bold leading-[1.02] tracking-[-0.02em] text-ink">
                {profile.displayName}
              </h1>
              <p className="mt-4 max-w-[760px] text-[20px] font-extrabold leading-[1.35] text-green-deep">
                {primaryCategory} helper around {primaryMarket}
              </p>
              <p className="mt-5 max-w-[780px] text-[18px] leading-[1.65] text-ink-soft">
                {profile.bio || description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="/#download"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-green px-6 py-3 text-[16px] font-extrabold text-surface shadow-card-sm transition hover:bg-green-deep"
                >
                  Open in SwapSpot
                  <MessageCircle className="h-4.5 w-4.5" />
                </a>
                <Link
                  href={`/services/${profile.categories[0]?.slug || "home-repair-and-maintenance"}/${profile.markets[0]?.slug || ""}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-green/20 bg-surface px-6 py-3 text-[16px] font-extrabold text-green-deep transition hover:border-green hover:bg-green-soft"
                >
                  View local category
                </Link>
              </div>
            </div>

            <aside className="rounded-card bg-surface p-5 shadow-card">
              <div className="relative overflow-hidden rounded-card-md bg-green-soft p-5">
                <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-green/10" />
                <div className="relative flex items-center gap-4">
                  <div className="grid h-[92px] w-[92px] shrink-0 place-items-center overflow-hidden rounded-full border-4 border-surface bg-green text-[28px] font-extrabold text-surface shadow-card-sm">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      firstInitials(profile.displayName)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[22px] font-extrabold leading-tight text-ink">
                      {profile.displayName}
                    </p>
                    <p className="mt-1 text-[14px] font-bold text-ink-soft">
                      {pluralize(profile.listings.length, "service")} listed
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-[14px] font-extrabold text-ink">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      {profile.ratingAvg.toFixed(1)}
                      {profile.ratingCount ? (
                        <span className="text-ink-soft">({profile.ratingCount})</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-[14px] border border-line bg-sand p-4">
                  <div className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
                    <BadgeCheck className="h-4 w-4 text-green" />
                    Public profile preview
                  </div>
                  <p className="mt-2 text-[14px] leading-[1.55] text-ink-soft">
                    Compare services here, then message and book inside the app.
                  </p>
                </div>
                <div className="rounded-[14px] border border-line bg-sand p-4">
                  <div className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
                    <ShieldCheck className="h-4 w-4 text-green" />
                    No helper commission
                  </div>
                  <p className="mt-2 text-[14px] leading-[1.55] text-ink-soft">
                    Helpers keep job payments. SwapSpot does not take a percentage
                    or commission from helper work.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-wrap px-6 py-[clamp(38px,5vw,70px)]">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <Sparkles className="h-5 w-5 text-green" />
              <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
                {profile.listings.length}
              </div>
              <p className="text-[14px] font-semibold text-ink-soft">public services</p>
            </div>
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <MapPin className="h-5 w-5 text-green" />
              <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
                {profile.markets.length}
              </div>
              <p className="text-[14px] font-semibold text-ink-soft">markets served</p>
            </div>
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <Languages className="h-5 w-5 text-green" />
              <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
                {profile.languages.length || "-"}
              </div>
              <p className="text-[14px] font-semibold text-ink-soft">languages</p>
            </div>
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <CheckCircle2 className="h-5 w-5 text-green" />
              <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
                {lowestPricedListing ? formatServicePrice(lowestPricedListing) : "Quote"}
              </div>
              <p className="text-[14px] font-semibold text-ink-soft">sample price</p>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-cream">
          <div className="mx-auto max-w-wrap px-6 py-[clamp(46px,6vw,82px)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">
                  Services
                </p>
                <h2 className="mt-2 font-head text-[clamp(30px,4vw,46px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
                  What {profile.displayName} can help with
                </h2>
              </div>
              <p className="max-w-[520px] text-[15.5px] leading-[1.6] text-ink-soft">
                These are published service previews from SwapSpot. Prices may be
                fixed, hourly, starting from, or quote-only depending on the job.
              </p>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {profile.listings.map((listing) => (
                <article
                  key={listing.service_id}
                  className="flex min-h-[290px] flex-col rounded-card-md border border-line bg-surface p-5 shadow-card-sm transition hover:-translate-y-0.5 hover:border-green hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12.5px] font-extrabold uppercase tracking-[0.1em] text-green">
                        {listing.category_name}
                      </p>
                      <h3 className="mt-2 text-[22px] font-extrabold leading-[1.18] text-ink">
                        {getServiceTitle(listing)}
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-green-soft px-3 py-1 text-[14px] font-extrabold text-green-deep">
                      {formatServicePrice(listing)}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-4 text-[15px] leading-[1.55] text-ink-soft">
                    {listing.service_description ||
                      "Open SwapSpot to see this service, request details, and confirm scope before booking."}
                  </p>

                  <div className="mt-5 grid gap-2 text-[14px] font-semibold text-ink-soft">
                    <span className="inline-flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      <span>{formatServiceArea(listing)}</span>
                    </span>
                    <Link
                      href={`/services/${listing.category_slug}/${listing.market_slug}`}
                      className="inline-flex items-center gap-2 font-extrabold text-green-deep underline-offset-4 hover:underline"
                    >
                      More {listing.category_name.toLowerCase()} helpers in {listing.market_name}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-wrap gap-6 px-6 py-[clamp(46px,6vw,82px)] lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">
              Areas and languages
            </p>
            <h2 className="mt-2 font-head text-[clamp(30px,4vw,44px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
              Built for local discovery
            </h2>
            <p className="mt-4 text-[16px] leading-[1.65] text-ink-soft">
              Public helper pages give search engines and clients enough context:
              service names, neighborhoods, cities, approximate areas, and language
              signals. Exact contact details stay inside SwapSpot.
            </p>
            <AppStoreButtons className="mt-6" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <h3 className="font-head text-[24px] font-extrabold text-ink">
                Service areas
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {serviceAreas.slice(0, 18).map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-line bg-sand px-3 py-1.5 text-[13.5px] font-bold text-ink-soft"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <h3 className="font-head text-[24px] font-extrabold text-ink">
                Service keywords
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {serviceTitles.slice(0, 18).map((title) => (
                  <span
                    key={title}
                    className="rounded-full border border-green/20 bg-green-soft px-3 py-1.5 text-[13.5px] font-extrabold text-green-deep"
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm md:col-span-2">
              <h3 className="font-head text-[24px] font-extrabold text-ink">
                Languages
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {(profile.languages.length ? profile.languages : ["Language details in app"]).map((language) => (
                  <span
                    key={language}
                    className="rounded-full bg-gold-soft px-3 py-1.5 text-[13.5px] font-extrabold text-gold-deep"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-green-deep">
          <div className="mx-auto grid max-w-wrap gap-6 px-6 py-[clamp(42px,6vw,74px)] text-surface lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold-soft">
                Continue in the app
              </p>
              <h2 className="mt-3 font-head text-[clamp(30px,4vw,46px)] font-bold leading-[1.08] tracking-[-0.02em]">
                Message, quote, and book with privacy controls.
              </h2>
            </div>
            <div className="rounded-card-md bg-surface/10 p-5">
              <div className="grid gap-3 md:grid-cols-3">
                {faq.map((item) => (
                  <article key={item.question} className="rounded-[14px] bg-surface p-4 text-ink">
                    <h3 className="text-[15px] font-extrabold leading-snug">
                      {item.question}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-[1.5] text-ink-soft">
                      {item.answer}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
