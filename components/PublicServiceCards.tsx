import { MapPin, ShieldCheck, Star } from "lucide-react";
import AppStoreButtons from "@/components/AppStoreButtons";
import {
  formatServiceArea,
  formatServicePrice,
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
            Available {categoryName.toLowerCase()} services
          </h2>
          <p className="mt-2 text-[16px] text-ink-soft">
            Public previews from active helpers near {marketName}. Exact addresses
            and contact details stay inside SwapSpot.
          </p>
        </div>
        <AppStoreButtons />
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <article
            key={listing.service_id}
            className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-green">
                  {listing.category_name}
                </p>
                <h3 className="mt-2 text-[20px] font-extrabold leading-[1.2] text-ink">
                  {listing.search_title_en || listing.service_name}
                </h3>
              </div>
              <div className="rounded-full bg-green-soft px-3 py-1 text-[14px] font-extrabold text-green-deep">
                {formatServicePrice(listing)}
              </div>
            </div>

            {listing.service_description ? (
              <p className="mt-3 line-clamp-3 text-[15px] leading-[1.55] text-ink-soft">
                {listing.service_description}
              </p>
            ) : null}

            <div className="mt-5 grid gap-2 text-[14px] font-semibold text-ink-soft">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green" />
                {formatServiceArea(listing)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 text-gold" />
                {Number(listing.rating_avg || 0).toFixed(1)} rating -{" "}
                {Number(listing.rating_count || 0)} reviews
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green" />
                {listing.helper_display_name || "Local helper"} -{" "}
                {Number(listing.jobs_completed || 0)} jobs completed
              </span>
            </div>

            {listing.languages?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {listing.languages.slice(0, 4).map((language) => (
                  <span
                    key={language}
                    className="rounded-full border border-line px-3 py-1 text-[13px] font-bold text-ink-soft"
                  >
                    {language.toUpperCase()}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}


