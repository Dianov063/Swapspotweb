import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardCheck, Languages, MapPin, MessageCircle, Search, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicServiceCards from "@/components/PublicServiceCards";
import { categoryVars, directoryStrings, fillTemplate, localizedCategoryName } from "@/lib/directoryStrings";
import { dictionaries, hreflangAlternates, localizedPath, textDirection, type Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/locales";
import { formatLowestPrices, schemaOffer } from "@/lib/priceFormat";
import {
  displayHelperName,
  getDirectoryPair,
  getHelperName,
  getListingLanguages,
  getPublicServiceListings,
  getServiceTitle,
  type DirectoryPair,
} from "@/lib/publicDirectory";

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function pairVars(pair: DirectoryPair, locale: Locale) {
  return {
    ...categoryVars(localizedCategoryName(pair.categorySlug, pair.categoryName, locale), locale),
    market: pair.marketName,
  };
}

export async function serviceMarketMetadata(locale: Locale, categorySlug: string, marketSlug: string): Promise<Metadata> {
  const pair = await getDirectoryPair(categorySlug, marketSlug);
  if (!pair) return {};
  const t = directoryStrings(locale);
  const vars = pairVars(pair, locale);
  const path = `/services/${pair.categorySlug}/${pair.marketSlug}`;

  return {
    title: fillTemplate(t.pairMetaTitle, vars),
    description: fillTemplate(t.pairMetaDescription, vars),
    alternates: hreflangAlternates(path, locale),
    openGraph: {
      title: fillTemplate(t.pairTitle, vars),
      description: fillTemplate(t.pairOgDescription, vars),
      url: `${siteUrl}${localizedPath(locale, path)}`,
      type: "website",
    },
  };
}

export default async function ServiceMarketPage({
  locale,
  categorySlug,
  marketSlug,
}: {
  locale: Locale;
  categorySlug: string;
  marketSlug: string;
}) {
  const pair = await getDirectoryPair(categorySlug, marketSlug);
  if (!pair) notFound();

  const t = directoryStrings(locale);
  const dictionary = dictionaries[locale];
  const vars = pairVars(pair, locale);
  const listings = await getPublicServiceListings({
    categorySlug: pair.categorySlug,
    marketSlugs: pair.sourceMarketSlugs,
    limit: 30,
  });
  const serviceNames = uniqueValues(listings.map((listing) => getServiceTitle(listing, locale)));
  const helperNames = uniqueValues(listings.map((listing) => getHelperName(listing)));
  const languages = uniqueValues(listings.flatMap((listing) => getListingLanguages(listing)));
  const pageSummary = fillTemplate(listings.length ? t.pairSummary : t.pairSummaryEmpty, vars);
  const faq = [
    { question: fillTemplate(t.pairFaq1Q, vars), answer: t.pairFaq1A },
    { question: t.pairFaq2Q, answer: t.pairFaq2A },
    { question: t.pairFaq3Q, answer: t.pairFaq3A },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: fillTemplate(t.pairTitle, vars),
    description: fillTemplate(t.pairListDescription, vars),
    inLanguage: locale,
    itemListElement: listings.slice(0, 12).map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: getServiceTitle(listing, locale),
        serviceType: listing.category_name,
        areaServed: listing.market_name,
        provider: {
          "@type": "LocalBusiness",
          name: fillTemplate(t.onSwapSpot, { name: displayHelperName(listing.helper_display_name, locale) }),
          address:
            listing.service_area_zip && listing.country_code
              ? {
                  "@type": "PostalAddress",
                  postalCode: listing.service_area_zip,
                  addressCountry: listing.country_code,
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
        offers: schemaOffer(listing),
      },
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const stats = [
    { icon: Search, tone: "text-green", value: String(listings.length), label: t.statPreviews },
    { icon: Star, tone: "text-gold", value: helperNames.length ? String(helperNames.length) : "-", label: t.statHelpers },
    { icon: Languages, tone: "text-green", value: languages.length ? String(languages.length) : "-", label: t.statLanguages },
    // Lowest price per currency: amounts in different currencies are never compared.
    { icon: ClipboardCheck, tone: "text-green", value: formatLowestPrices(listings, locale), label: t.statStartingPrice },
  ];

  return (
    <div lang={locale} dir={textDirection(locale)} className="min-w-0 overflow-x-clip [&_*]:min-w-0">
      <Header locale={locale} dictionary={dictionary} />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">{t.pairEyebrow}</p>
        <h1 className="mt-3 max-w-[860px] font-head text-[clamp(34px,5vw,58px)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
          {fillTemplate(t.pairTitle, vars)}
        </h1>
        <p className="mt-5 max-w-[760px] text-[18px] leading-[1.6] text-ink-soft">{pageSummary}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {stats.map(({ icon: Icon, tone, value, label }) => (
            <div key={label} className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <Icon className={`h-5 w-5 ${tone}`} />
              <div className="mt-4 font-head text-[clamp(20px,2.4vw,30px)] font-extrabold leading-tight text-ink">{value}</div>
              <p className="text-[14px] font-semibold text-ink-soft">{label}</p>
            </div>
          ))}
        </div>

        {serviceNames.length ? (
          <section className="mt-10 rounded-card-md border border-line bg-cream p-6 shadow-card-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">{t.popularEyebrow}</p>
                <h2 className="mt-2 font-head text-[30px] font-extrabold text-ink">{fillTemplate(t.popularTitle, vars)}</h2>
              </div>
              <p className="max-w-[470px] text-[15px] leading-[1.55] text-ink-soft">{t.popularBody}</p>
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
          {[
            { icon: MapPin, title: t.areaTitle, body: t.areaBody },
            { icon: Search, title: t.namesTitle, body: t.namesBody },
            { icon: MessageCircle, title: t.inAppTitle, body: t.inAppBody },
          ].map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <Icon className="h-5 w-5 text-green" />
              <h2 className="mt-4 font-head text-[23px] font-extrabold text-ink">{title}</h2>
              <p className="mt-2 text-[15px] leading-[1.55] text-ink-soft">{body}</p>
            </article>
          ))}
        </section>

        <PublicServiceCards
          listings={listings}
          categoryName={String(vars.category)}
          marketName={pair.marketName}
          locale={locale}
        />

        <section className="mt-12 rounded-card-md border border-line bg-surface p-6 shadow-card-sm">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">{t.faqEyebrow}</p>
          <h2 className="mt-2 font-head text-[30px] font-extrabold text-ink">{t.faqTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {faq.map((item) => (
              <article key={item.question} className="rounded-[14px] border border-line bg-sand p-4">
                <h3 className="text-[16px] font-extrabold leading-snug text-ink">{item.question}</h3>
                <p className="mt-2 text-[14.5px] leading-[1.55] text-ink-soft">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer locale={locale} dictionary={dictionary} />
    </div>
  );
}
