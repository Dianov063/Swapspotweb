import { ShieldCheck, Sparkles } from "lucide-react";
import AppStoreButtons from "./AppStoreButtons";
import { dictionaries, defaultLocale, type Dictionary, type Locale } from "@/lib/i18n";

export default function AppDownloadStrip({
  locale = defaultLocale,
  dictionary = dictionaries[defaultLocale],
}: {
  locale?: Locale;
  dictionary?: Dictionary;
}) {
  return (
    <section
      id="download"
      aria-label="Download SwapSpot mobile apps"
      className="border-b border-line bg-gradient-to-r from-green-soft via-sand to-gold-soft/50"
    >
      <div className="mx-auto grid max-w-wrap items-center gap-5 px-6 py-5 lg:grid-cols-[1fr_auto]">
        <div className="max-w-[720px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-green/15 bg-surface/80 px-3 py-1 text-[12px] font-extrabold uppercase tracking-[0.08em] text-green-deep">
            <Sparkles className="h-3.5 w-3.5" />
            {dictionary.download.badge}
          </div>
          <h2 className="mt-2 font-head text-[clamp(24px,3vw,36px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
            {dictionary.download.title}
          </h2>
          <p className="mt-2 max-w-[620px] text-[16px] leading-[1.5] text-ink-soft">
            {dictionary.download.body}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px] font-semibold text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-green" />
              {dictionary.download.pointA}
            </span>
            <span>{dictionary.download.pointB}</span>
          </div>
        </div>

        <AppStoreButtons className="justify-start lg:justify-end" />
      </div>
    </section>
  );
}
