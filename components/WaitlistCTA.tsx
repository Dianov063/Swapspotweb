"use client";

import Link from "next/link";
import { Apple, Hammer, Play } from "lucide-react";
import { localizedPath, type Dictionary, type Locale } from "@/lib/i18n";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.swapspotnyc.app&pcampaignid=web_share";
const APP_STORE_URL = "https://apps.apple.com/app/swapspot-hire-local-helpers/id6783493286";

const appCtaCopy = {
  title: "Download SwapSpot today",
  body:
    "Browse nearby helpers for free. Use a pass when you are ready to message, request quotes, or book.",
  storeCaption: "Available now on iOS and Android",
  noSpam: "Download the app, browse helpers, and start when you are ready.",
};

export default function WaitlistCTA({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <section id="download" className="mx-auto max-w-wrap px-6 pb-[clamp(56px,7vw,96px)]">
      <div className="relative overflow-hidden rounded-card bg-green px-[clamp(28px,4vw,56px)] py-[clamp(40px,5.5vw,72px)] text-center text-surface shadow-card">
        <div className="pointer-events-none absolute -left-10 -top-20 h-[300px] w-[300px] rounded-full bg-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-[120px] -right-[30px] h-[320px] w-[320px] rounded-full bg-[rgba(198,132,30,.16)]" />

        <div className="relative mx-auto max-w-[560px]">
          <h2 className="font-head text-[clamp(30px,4vw,48px)] font-bold leading-[1.06] tracking-[-0.02em]">
            {appCtaCopy.title}
          </h2>
          <p className="mt-4 text-[17px] leading-[1.5] text-white/80">
            {appCtaCopy.body}
          </p>

          <div className="mt-6">
            <div className="text-[13px] font-bold tracking-[0.02em] text-white/70">
              {appCtaCopy.storeCaption}
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-[14px] border border-white/15 bg-[#10231A] px-5 py-2.5 text-left text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#0A1A12]"
              >
                <Apple className="h-6 w-6 shrink-0" />
                <span>
                  <span className="block text-[10.5px] font-semibold leading-[1.1] opacity-70">
                    Download on the
                  </span>
                  <span className="block text-[15px] font-extrabold leading-[1.15]">
                    iOS - App Store
                  </span>
                </span>
              </a>
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-[14px] border border-white/15 bg-[#10231A] px-5 py-2.5 text-left text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#0A1A12]"
              >
                <Play className="h-6 w-6 shrink-0" />
                <span>
                  <span className="block text-[10.5px] font-semibold leading-[1.1] opacity-70">
                    Get it on
                  </span>
                  <span className="block text-[15px] font-extrabold leading-[1.15]">
                    Android - Google Play
                  </span>
                </span>
              </a>
            </div>
          </div>

          <div className="mt-[18px] flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href={localizedPath(locale, "/#helpers")}
              className="inline-flex items-center gap-2 border-b-[1.5px] border-white/40 pb-px text-[15px] font-bold"
            >
              <Hammer className="h-4 w-4" />
              {dictionary.hero.becomeHelper}
            </Link>
            <span className="text-[14px] text-white/60">
              {appCtaCopy.noSpam}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
