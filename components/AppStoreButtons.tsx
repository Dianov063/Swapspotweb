import { Apple, Play } from "lucide-react";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/appLinks";
import type { Locale } from "@/lib/locales";
import { storeBadgesFor, type StoreBadgeCopy } from "@/lib/storeBadges";

type AppStoreButtonsProps = {
  tone?: "dark" | "light";
  className?: string;
  locale?: Locale;
  /** Copy resolved on the server; required inside client components for registry languages. */
  copy?: StoreBadgeCopy;
};

export default function AppStoreButtons({
  tone = "dark",
  className = "",
  locale = "en",
  copy,
}: AppStoreButtonsProps) {
  const t = copy ?? storeBadgesFor(locale);
  const buttonClass =
    tone === "light"
      ? "border-white/15 bg-[#10231A] text-white hover:bg-[#0A1A12]"
      : "border-line bg-ink text-surface hover:bg-green-deep";

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.appStoreLabel}
        className={`inline-flex min-h-[54px] items-center gap-3 rounded-[14px] border px-5 py-2.5 text-start shadow-card-sm transition-all duration-150 hover:-translate-y-0.5 ${buttonClass}`}
      >
        <Apple className="h-6 w-6 shrink-0" />
        <span>
          <span className="block text-[10.5px] font-semibold leading-[1.1] opacity-70">
            {t.appStoreTop}
          </span>
          <span className="block text-[15px] font-extrabold leading-[1.15]">
            App Store
          </span>
        </span>
      </a>

      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.playLabel}
        className={`inline-flex min-h-[54px] items-center gap-3 rounded-[14px] border px-5 py-2.5 text-start shadow-card-sm transition-all duration-150 hover:-translate-y-0.5 ${buttonClass}`}
      >
        <Play className="h-6 w-6 shrink-0" />
        <span>
          <span className="block text-[10.5px] font-semibold leading-[1.1] opacity-70">
            {t.playTop}
          </span>
          <span className="block text-[15px] font-extrabold leading-[1.15]">
            Google Play
          </span>
        </span>
      </a>
    </div>
  );
}
