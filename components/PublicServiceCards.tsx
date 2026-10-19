import { CheckCircle2, Languages, MapPin, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import AppStoreButtons from "@/components/AppStoreButtons";
import { categoryVars, directoryStrings, fillTemplate, languageLabel } from "@/lib/directoryStrings";
import { localizedPath, type Locale } from "@/lib/i18n";
import {
  displayHelperName,
  formatServiceArea,
  formatServicePrice,
  getHelperSlug,
  getListingLanguages,
  getServiceTitle,
  type PublicServiceListing,
} from "@/lib/publicDirectory";

type PublicServiceCardsProps = {
  listings: PublicServiceListing[];
  categoryName: string;
  marketName: string;
  locale?: Locale;
};

export default function PublicServiceCards({
  listings,
  categoryName,
  marketName,
  locale = "en",
}: PublicServiceCardsProps) {
  const t = directoryStrings(locale);
  const vars = { ...categoryVars(categoryName, locale), market: marketName };

  if (!listings.length) {
    return (
      <section className="mt-10 rounded-card-md border border-line bg-surface p-7 shadow-card-sm">
        <h2 className="font-head text-[26px] font-extrabold text-ink">{fillTemplate(t.cardsEmptyTitle, vars)}</h2>
        <p className="mt-3 max-w-[720px] text-[16px] leading-[1.55] text-ink-soft">{t.cardsEmptyBody}</p>
        <AppStoreButtons locale={locale} className="mt-6" />
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-head text-[28px] font-extrabold text-ink">{fillTemplate(t.cardsTitle, vars)}</h2>
          <p className="mt-2 text-[16px] text-ink-soft">{fillTemplate(t.cardsBody, vars)}</p>
        </div>
        <AppStoreButtons locale={locale} />
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => {
          const languages = getListingLanguages(listing);
          const helperName = displayHelperName(listing.helper_display_name, locale);
          const helperHref = localizedPath(locale, `/helpers/${getHelperSlug(listing)}`);
          const ratingCount = Number(listing.rating_count || 0);

          return (
            <article
              key={listing.service_id}
              className="flex min-h-[360px] flex-col rounded-card-md border border-line bg-surface p-5 shadow-card-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-green hover:shadow-card"
            >
              <div className="flex items-start gap-4">
                <div className="relative grid h-[58px] w-[58px] shrink-0 place-items-center overflow-hidden rounded-full border-2 border-green bg-green-soft text-[18px] font-extrabold text-green-deep">
                  {listing.avatar_url ? (
                    <img src={listing.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    helperName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={helperHref}
                    className="block truncate text-[15px] font-extrabold text-ink underline-offset-4 hover:text-green hover:underline"
                  >
                    {helperName}
                  </Link>
                  <p className="mt-1 text-[13px] font-extrabold uppercase tracking-[0.1em] text-green">{categoryName}</p>
                  <h3 className="mt-2 text-[21px] font-extrabold leading-[1.18] text-ink">
                    {getServiceTitle(listing, locale)}
                  </h3>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-green-soft px-3 py-1 text-[14px] font-extrabold text-green-deep">
                  {formatServicePrice(listing, locale)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-[13px] font-bold text-ink-soft">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  {Number(listing.rating_avg || 0).toFixed(1)}
                  {ratingCount ? ` (${ratingCount})` : ""}
                </span>
              </div>

              {listing.service_description ? (
                <p className="mt-4 line-clamp-4 text-[15px] leading-[1.55] text-ink-soft">{listing.service_description}</p>
              ) : (
                <p className="mt-4 text-[15px] leading-[1.55] text-ink-soft">{t.cardNoDescription}</p>
              )}

              <div className="mt-5 grid gap-2 text-[14px] font-semibold text-ink-soft">
                <span className="inline-flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                  <span>{formatServiceArea(listing, locale)}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green" />
                  {fillTemplate(t.jobsCompleted, { count: Number(listing.jobs_completed || 0) })}
                </span>
                {languages.length ? (
                  <span className="inline-flex items-start gap-2">
                    <Languages className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                    <span>{languages.slice(0, 4).map((language) => languageLabel(language, locale)).join(", ")}</span>
                  </span>
                ) : null}
              </div>

              <div className="mt-auto pt-5">
                <Link
                  href={helperHref}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-green px-4 py-2.5 text-[15px] font-extrabold text-surface transition hover:bg-green-deep"
                >
                  {t.viewProfile}
                  <CheckCircle2 className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
