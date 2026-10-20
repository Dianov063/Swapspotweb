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
  categoryVars,
  directoryStrings,
  fillTemplate,
  languageLabel,
  localizedCategoryName,
} from "@/lib/directoryStrings";
import { getDictionary, languageTag, localizedPath, textDirection, type Locale } from "@/lib/i18n";
import { localeAlternates } from "@/lib/languages";
import { siteUrl } from "@/lib/locales";
import { formatLowestPrices, schemaOffer } from "@/lib/priceFormat";
import {
  displayHelperName,
  formatServiceArea,
  formatServicePrice,
  getPublicHelperProfileBySlug,
  getServiceTitle,
  type PublicHelperProfile,
  type PublicServiceListing,
} from "@/lib/publicDirectory";

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function firstInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function profileText(profile: PublicHelperProfile, locale: Locale) {
  const t = directoryStrings(locale);
  const name = displayHelperName(profile.displayName, locale);
  const primary = profile.categories[0];
  const category = primary ? localizedCategoryName(primary.slug, primary.name, locale) : t.defaultCategory;
  const market = profile.markets[0]?.name || t.yourArea;
  const services = uniqueValues(profile.listings.map((listing) => getServiceTitle(listing, locale))).slice(0, 4).join(", ");
  const markets = profile.markets.slice(0, 3).map((item) => item.name).join(", ");
  const description = fillTemplate(markets ? t.helperDescription : t.helperDescriptionNoMarket, {
    name,
    services: services || t.localServices,
    markets,
  });
  return { t, name, category, market, description };
}

function serviceJsonLd(listing: PublicServiceListing, sellerName: string, locale: Locale) {
  const offer = schemaOffer(listing);
  return {
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: getServiceTitle(listing, locale),
      serviceType: listing.category_name,
      areaServed: listing.market_name,
      description: listing.service_description || undefined,
    },
    price: offer?.price,
    priceCurrency: offer?.priceCurrency,
    seller: { "@type": "LocalBusiness", name: sellerName },
  };
}

export async function helperProfileMetadata(locale: Locale, helperSlug: string): Promise<Metadata> {
  const profile = await getPublicHelperProfileBySlug(helperSlug);
  if (!profile) return {};
  const { t, name, category, market, description } = profileText(profile, locale);
  const path = `/helpers/${profile.slug}`;

  return {
    title: fillTemplate(t.helperMetaTitle, { name, category, market }),
    description,
    alternates: await localeAlternates(path, locale),
    openGraph: {
      title: fillTemplate(t.onSwapSpot, { name }),
      description,
      url: `${siteUrl}${localizedPath(locale, path)}`,
      type: "profile",
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
    },
  };
}

export default async function HelperProfilePage({ locale, helperSlug }: { locale: Locale; helperSlug: string }) {
  const profile = await getPublicHelperProfileBySlug(helperSlug);
  if (!profile) notFound();

  const dictionary = getDictionary(locale);
  const { t, name, category, market, description } = profileText(profile, locale);
  const serviceTitles = uniqueValues(profile.listings.map((listing) => getServiceTitle(listing, locale)));
  const serviceAreas = uniqueValues(profile.listings.map((listing) => listing.service_area_label || listing.market_name));
  const onSwapSpot = fillTemplate(t.onSwapSpot, { name });
  const faq = [
    { question: fillTemplate(t.helperFaq1Q, { name }), answer: t.helperFaq1A },
    { question: t.helperFaq2Q, answer: t.helperFaq2A },
    { question: t.helperFaq3Q, answer: t.helperFaq3A },
  ];
  const categoryHref = localizedPath(
    locale,
    `/services/${profile.categories[0]?.slug || "home-repair-and-maintenance"}/${profile.markets[0]?.slug || ""}`,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: onSwapSpot,
    image: profile.avatarUrl || undefined,
    description,
    areaServed: profile.markets.map((item) => item.name),
    knowsLanguage: profile.languages.length ? profile.languages : undefined,
    aggregateRating: profile.ratingCount
      ? {
          "@type": "AggregateRating",
          ratingValue: profile.ratingAvg.toFixed(1),
          reviewCount: profile.ratingCount,
        }
      : undefined,
    makesOffer: profile.listings.slice(0, 20).map((listing) => serviceJsonLd(listing, onSwapSpot, locale)),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: languageTag(locale),
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const stats = [
    { icon: Sparkles, value: String(profile.listings.length), label: t.statPublicServices },
    { icon: MapPin, value: String(profile.markets.length), label: t.statMarketsServed },
    { icon: Languages, value: profile.languages.length ? String(profile.languages.length) : "-", label: t.statLanguagesShort },
    // Lowest price per currency: amounts in different currencies are never compared.
    { icon: CheckCircle2, value: formatLowestPrices(profile.listings, locale), label: t.statSamplePrice },
  ];

  return (
    <div lang={languageTag(locale)} dir={textDirection(locale)} className="min-w-0 overflow-x-clip [&_*]:min-w-0">
      <Header locale={locale} dictionary={dictionary} />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-green-soft via-sand to-gold-soft/40">
          <div className="mx-auto grid max-w-wrap gap-8 px-6 py-[clamp(46px,7vw,94px)] lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <Link
                href={localizedPath(locale, "/services")}
                className="inline-flex items-center gap-2 rounded-full border border-green/15 bg-surface/85 px-3 py-1.5 text-[13px] font-extrabold text-green-deep transition hover:border-green hover:bg-green-soft"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180 rtl:rotate-0" />
                {t.backToDirectory}
              </Link>

              <p className="mt-8 text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">{t.profileEyebrow}</p>
              <h1 className="mt-3 max-w-[760px] font-head text-[clamp(40px,6vw,72px)] font-bold leading-[1.02] tracking-[-0.02em] text-ink">
                {name}
              </h1>
              <p className="mt-4 max-w-[760px] text-[20px] font-extrabold leading-[1.35] text-green-deep">
                {fillTemplate(t.helperTagline, { ...categoryVars(category, locale), market })}
              </p>
              <p className="mt-5 max-w-[780px] text-[18px] leading-[1.65] text-ink-soft">{profile.bio || description}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={localizedPath(locale, "/#download")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-green px-6 py-3 text-[16px] font-extrabold text-surface shadow-card-sm transition hover:bg-green-deep"
                >
                  {t.openInApp}
                  <MessageCircle className="h-4.5 w-4.5" />
                </a>
                <Link
                  href={categoryHref}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-green/20 bg-surface px-6 py-3 text-[16px] font-extrabold text-green-deep transition hover:border-green hover:bg-green-soft"
                >
                  {t.viewLocalCategory}
                </Link>
              </div>
            </div>

            <aside className="rounded-card bg-surface p-5 shadow-card">
              <div className="relative overflow-hidden rounded-card-md bg-green-soft p-5">
                <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-green/10" />
                <div className="relative flex items-center gap-4">
                  <div className="grid h-[92px] w-[92px] shrink-0 place-items-center overflow-hidden rounded-full border-4 border-surface bg-green text-[28px] font-extrabold text-surface shadow-card-sm">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      firstInitials(name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[22px] font-extrabold leading-tight text-ink">{name}</p>
                    <p className="mt-1 text-[14px] font-bold text-ink-soft">
                      {fillTemplate(t.servicesListed, { count: profile.listings.length })}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-[14px] font-extrabold text-ink">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      {profile.ratingAvg.toFixed(1)}
                      {profile.ratingCount ? <span className="text-ink-soft">({profile.ratingCount})</span> : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-[14px] border border-line bg-sand p-4">
                  <div className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
                    <BadgeCheck className="h-4 w-4 text-green" />
                    {t.previewTitle}
                  </div>
                  <p className="mt-2 text-[14px] leading-[1.55] text-ink-soft">{t.previewBody}</p>
                </div>
                <div className="rounded-[14px] border border-line bg-sand p-4">
                  <div className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
                    <ShieldCheck className="h-4 w-4 text-green" />
                    {t.noCommissionTitle}
                  </div>
                  <p className="mt-2 text-[14px] leading-[1.55] text-ink-soft">{t.noCommissionBody}</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-wrap px-6 py-[clamp(38px,5vw,70px)]">
          <div className="grid gap-4 md:grid-cols-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
                <Icon className="h-5 w-5 text-green" />
                <div className="mt-4 font-head text-[clamp(20px,2.4vw,30px)] font-extrabold leading-tight text-ink">{value}</div>
                <p className="text-[14px] font-semibold text-ink-soft">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-cream">
          <div className="mx-auto max-w-wrap px-6 py-[clamp(46px,6vw,82px)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">{t.servicesEyebrow}</p>
                <h2 className="mt-2 font-head text-[clamp(30px,4vw,46px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
                  {fillTemplate(t.servicesTitle, { name })}
                </h2>
              </div>
              <p className="max-w-[520px] text-[15.5px] leading-[1.6] text-ink-soft">{t.servicesBody}</p>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {profile.listings.map((listing) => {
                const listingCategory = localizedCategoryName(listing.category_slug, listing.category_name, locale);
                return (
                  <article
                    key={listing.service_id}
                    className="flex min-h-[290px] flex-col rounded-card-md border border-line bg-surface p-5 shadow-card-sm transition hover:-translate-y-0.5 hover:border-green hover:shadow-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[12.5px] font-extrabold uppercase tracking-[0.1em] text-green">{listingCategory}</p>
                        <h3 className="mt-2 text-[22px] font-extrabold leading-[1.18] text-ink">
                          {getServiceTitle(listing, locale)}
                        </h3>
                      </div>
                      <span className="shrink-0 rounded-full bg-green-soft px-3 py-1 text-[14px] font-extrabold text-green-deep">
                        {formatServicePrice(listing, locale)}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-4 text-[15px] leading-[1.55] text-ink-soft">
                      {listing.service_description || t.serviceFallback}
                    </p>

                    <div className="mt-5 grid gap-2 text-[14px] font-semibold text-ink-soft">
                      <span className="inline-flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                        <span>{formatServiceArea(listing, locale)}</span>
                      </span>
                      <Link
                        href={localizedPath(locale, `/services/${listing.category_slug}/${listing.market_slug}`)}
                        className="inline-flex items-center gap-2 font-extrabold text-green-deep underline-offset-4 hover:underline"
                      >
                        {fillTemplate(t.moreInMarket, { ...categoryVars(listingCategory, locale), market: listing.market_name })}
                        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-wrap gap-6 px-6 py-[clamp(46px,6vw,82px)] lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">{t.areasEyebrow}</p>
            <h2 className="mt-2 font-head text-[clamp(30px,4vw,44px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
              {t.areasTitle}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.65] text-ink-soft">{t.areasBody}</p>
            <AppStoreButtons locale={locale} className="mt-6" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <h3 className="font-head text-[24px] font-extrabold text-ink">{t.serviceAreas}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {serviceAreas.slice(0, 18).map((area) => (
                  <span key={area} className="rounded-full border border-line bg-sand px-3 py-1.5 text-[13.5px] font-bold text-ink-soft">
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <h3 className="font-head text-[24px] font-extrabold text-ink">{t.serviceKeywords}</h3>
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
              <h3 className="font-head text-[24px] font-extrabold text-ink">{t.languages}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {(profile.languages.length
                  ? profile.languages.map((language) => languageLabel(language, locale))
                  : [t.languagesInApp]
                ).map((language) => (
                  <span key={language} className="rounded-full bg-gold-soft px-3 py-1.5 text-[13.5px] font-extrabold text-gold-deep">
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
              <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold-soft">{t.continueEyebrow}</p>
              <h2 className="mt-3 font-head text-[clamp(30px,4vw,46px)] font-bold leading-[1.08] tracking-[-0.02em]">
                {t.continueTitle}
              </h2>
            </div>
            <div className="rounded-card-md bg-surface/10 p-5">
              <div className="grid gap-3 md:grid-cols-3">
                {faq.map((item) => (
                  <article key={item.question} className="rounded-[14px] bg-surface p-4 text-ink">
                    <h3 className="text-[15px] font-extrabold leading-snug">{item.question}</h3>
                    <p className="mt-2 text-[13.5px] leading-[1.5] text-ink-soft">{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} dictionary={dictionary} />
    </div>
  );
}
