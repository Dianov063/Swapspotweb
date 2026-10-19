import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe2, MapPin, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui";
import { categoryVars, directoryStrings, fillTemplate, localizedCategoryName } from "@/lib/directoryStrings";
import { dictionaries, hreflangAlternates, localizedPath, textDirection, type Locale } from "@/lib/i18n";
import { getMarkets, marketName } from "@/lib/markets";
import { getDirectoryPairs, type DirectoryPair } from "@/lib/publicDirectory";
import { siteUrl } from "@/lib/locales";

export function servicesDirectoryMetadata(locale: Locale): Metadata {
  const t = directoryStrings(locale);
  return {
    title: t.indexMetaTitle,
    description: t.indexMetaDescription,
    alternates: hreflangAlternates("/services", locale),
  };
}

type CountryGroup = { code: string | null; name: string; pairs: DirectoryPair[] };

function groupByCountry(pairs: DirectoryPair[], locale: Locale, otherMarkets: string, names: (code: string) => string) {
  const groups = new Map<string, CountryGroup>();
  for (const pair of pairs) {
    const code = pair.countryCode ? pair.countryCode.toUpperCase() : null;
    const key = code ?? "";
    const group = groups.get(key) ?? { code, name: code ? names(code) : otherMarkets, pairs: [] };
    group.pairs.push(pair);
    groups.set(key, group);
  }
  return [...groups.values()].sort((left, right) => {
    if (!left.code !== !right.code) return left.code ? -1 : 1;
    return left.name.localeCompare(right.name, locale);
  });
}

export default async function ServicesDirectoryPage({ locale }: { locale: Locale }) {
  const t = directoryStrings(locale);
  const dictionary = dictionaries[locale];
  const [pairs, markets] = await Promise.all([getDirectoryPairs(), getMarkets()]);
  const countries = groupByCountry(pairs, locale, t.otherMarkets, (code) => marketName(code, locale, markets));
  const pairLabel = (pair: DirectoryPair) => ({
    ...categoryVars(localizedCategoryName(pair.categorySlug, pair.categoryName, locale), locale),
    market: pair.marketName,
  });
  const pairHref = (pair: DirectoryPair) => localizedPath(locale, `/services/${pair.categorySlug}/${pair.marketSlug}`);
  const topPairs = [...pairs].sort((a, b) => b.listingCount - a.listingCount).slice(0, 12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t.indexTitle,
    description: t.indexMetaDescription,
    inLanguage: locale,
    hasPart: topPairs.map((pair) => ({
      "@type": "WebPage",
      name: fillTemplate(t.pairTitle, pairLabel(pair)),
      url: `${siteUrl}${pairHref(pair)}`,
    })),
  };

  return (
    <div lang={locale} dir={textDirection(locale)} className="min-w-0 overflow-x-clip [&_*]:min-w-0">
      <Header locale={locale} dictionary={dictionary} />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <section className="border-b border-line bg-gradient-to-br from-green-soft via-sand to-gold-soft/40">
          <div className="mx-auto max-w-wrap px-6 py-[clamp(48px,7vw,92px)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-green/15 bg-surface/85 px-3 py-1 text-[12px] font-extrabold uppercase tracking-[0.08em] text-green-deep">
              <Search className="h-3.5 w-3.5" />
              {t.indexBadge}
            </div>
            <h1 className="mt-4 max-w-[900px] font-head text-[clamp(36px,6vw,68px)] font-bold leading-[1.04] tracking-[-0.02em] text-ink">
              {t.indexTitle}
            </h1>
            <p className="mt-5 max-w-[780px] text-[18px] leading-[1.6] text-ink-soft">{t.indexIntro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="#markets">{t.browseMarkets}</Button>
              <Button href={localizedPath(locale, "/#download")} variant="white">
                {dictionary.nav.getApp}
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-wrap px-6 py-[clamp(42px,6vw,78px)]">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Globe2, value: countries.length, label: t.statCountries, tone: "bg-green-soft text-green" },
              { icon: MapPin, value: pairs.length, label: t.statPages, tone: "bg-green-soft text-green" },
              {
                icon: Search,
                value: pairs.reduce((sum, pair) => sum + pair.listingCount, 0),
                label: t.statPreviewsIndexed,
                tone: "bg-gold-soft text-gold-deep",
              },
            ].map(({ icon: Icon, value, label, tone }) => (
              <div key={label} className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-head text-[30px] font-extrabold text-ink">
                  {value.toLocaleString(locale)}
                </div>
                <p className="mt-1 text-[15px] font-semibold text-ink-soft">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="markets" className="border-t border-line bg-cream">
          <div className="mx-auto max-w-wrap px-6 py-[clamp(46px,6vw,82px)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-gold">{t.availableEyebrow}</p>
                <h2 className="mt-3 font-head text-[clamp(30px,4vw,46px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
                  {t.byCountryTitle}
                </h2>
              </div>
              <p className="max-w-[520px] text-[15.5px] leading-[1.55] text-ink-soft">{t.byCountryBody}</p>
            </div>

            {!countries.length ? (
              <div className="mt-8 rounded-card-md border border-line bg-surface p-6 shadow-card-sm">
                <h3 className="font-head text-[24px] font-extrabold text-ink">{t.emptyTitle}</h3>
                <p className="mt-3 max-w-[680px] text-[15.5px] leading-[1.6] text-ink-soft">{t.emptyBody}</p>
              </div>
            ) : null}

            <div className="mt-8 grid gap-6">
              {countries.map((country) => (
                <section key={country.code ?? "other"} className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
                  <div className="flex flex-col gap-1 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-head text-[24px] font-extrabold text-ink">{country.name}</h3>
                    <span className="text-[14px] font-bold text-ink-soft">
                      {fillTemplate(t.pagesCount, { count: country.pairs.length })}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {country.pairs
                      .map((pair) => ({ pair, label: pairLabel(pair) }))
                      .sort((a, b) =>
                        `${a.label.market} ${a.label.category}`.localeCompare(`${b.label.market} ${b.label.category}`, locale),
                      )
                      .map(({ pair, label }) => (
                        <Link
                          key={`${pair.categorySlug}:${pair.marketSlug}`}
                          href={pairHref(pair)}
                          className="group rounded-[12px] border border-line bg-sand px-4 py-3 transition-colors hover:border-green hover:bg-green-soft"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[15px] font-extrabold leading-snug text-ink">{label.category}</p>
                              <p className="mt-1 text-[14px] font-semibold text-ink-soft">{pair.marketName}</p>
                              <p className="mt-2 text-[12.5px] font-bold text-green-deep">
                                {fillTemplate(t.servicesCount, { count: pair.listingCount })}
                              </p>
                            </div>
                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-green opacity-70 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
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
      <Footer locale={locale} dictionary={dictionary} />
    </div>
  );
}
