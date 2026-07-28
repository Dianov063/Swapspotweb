import { CheckCircle2, Languages, MapPin, ShieldCheck, Star } from "lucide-react";
import AppStoreButtons from "@/components/AppStoreButtons";
import {
  formatServiceArea,
  formatServicePrice,
  getHelperName,
  getListingLanguages,
  getServiceTitle,
  type PublicServiceListing,
} from "@/lib/publicDirectory";

type PublicServiceCardsProps = {
  listings: PublicServiceListing[];
  categoryName: string;
  marketName: string;
};

export default function PublicServiceCards({
  listings,
  categoryName,
  marketName,
}: PublicServiceCardsProps) {
  if (!listings.length) {
    return (
      <section className="mt-10 rounded-card-md border border-line bg-surface p-7 shadow-card-sm">
        <h2 className="font-head text-[26px] font-extrabold text-ink">
          Browse {categoryName.toLowerCase()} helpers in the app
        </h2>
        <p className="mt-3 max-w-[720px] text-[16px] leading-[1.55] text-ink-soft">
          SwapSpot is opening local helper profiles by market. Download the app to
          see nearby services, compare prices, and message helpers when you are
          ready.
        </p>
        <AppStoreButtons className="mt-6" />
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-head text-[28px] font-extrabold text-ink">
            Real {categoryName.toLowerCase()} helper previews
          </h2>
          <p className="mt-2 text-[16px] text-ink-soft">
            Compare services, prices, areas, languages, ratings, and helper
            experience near {marketName}. Exact addresses and direct contact stay
            inside SwapSpot.
          </p>
        </div>
        <AppStoreButtons />
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => {
          const languages = getListingLanguages(listing);
          const helperName = getHelperName(listing);
          const ratingCount = Number(listing.rating_count || 0);

          return (
            <article
              key={listing.service_id}
              className="flex min-h-[360px] flex-col rounded-card-md border border-line bg-surface p-5 shadow-card-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-green hover:shadow-card"
            >
              <div className="flex items-start gap-4">
                <div className="relative grid h-[58px] w-[58px] shrink-0 place-items-center overflow-hidden rounded-full border-2 border-green bg-green-soft text-[18px] font-extrabold text-green-deep">
                  {listing.avatar_url ? (
                    <img
                      src={listing.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    helperName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-extrabold text-ink">
                    {helperName}
                  </p>
                  <p className="mt-1 text-[13px] font-extrabold uppercase tracking-[0.1em] text-green">
                    {listing.category_name}
                  </p>
                  <h3 className="mt-2 text-[21px] font-extrabold leading-[1.18] text-ink">
                    {getServiceTitle(listing)}
                  </h3>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-green-soft px-3 py-1 text-[14px] font-extrabold text-green-deep">
                  {formatServicePrice(listing)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-[13px] font-bold text-ink-soft">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  {Number(listing.rating_avg || 0).toFixed(1)}
                  {ratingCount ? ` (${ratingCount})` : ""}
                </span>
              </div>

              {listing.service_description ? (
                <p className="mt-4 line-clamp-4 text-[15px] leading-[1.55] text-ink-soft">
                  {listing.service_description}
                </p>
              ) : (
                <p className="mt-4 text-[15px] leading-[1.55] text-ink-soft">
                  See this service preview in SwapSpot, then open the app to
                  message, request a quote, or book.
                </p>
              )}

              <div className="mt-5 grid gap-2 text-[14px] font-semibold text-ink-soft">
                <span className="inline-flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                  <span>{formatServiceArea(listing)}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green" />
                  {Number(listing.jobs_completed || 0)} jobs completed
                </span>
                {languages.length ? (
                  <span className="inline-flex items-start gap-2">
                    <Languages className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                    <span>{languages.slice(0, 4).join(", ")}</span>
                  </span>
                ) : null}
              </div>

              <div className="mt-auto pt-5">
                <a
                  href="/#download"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-green px-4 py-2.5 text-[15px] font-extrabold text-surface transition hover:bg-green-deep"
                >
                  Open in SwapSpot
                  <CheckCircle2 className="h-4 w-4" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
