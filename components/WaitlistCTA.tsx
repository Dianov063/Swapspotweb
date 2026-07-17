"use client";

import Link from "next/link";
import { Hammer } from "lucide-react";
import AppStoreButtons from "./AppStoreButtons";
import { localizedPath, type Dictionary, type Locale } from "@/lib/i18n";

export default function WaitlistCTA({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <section className="mx-auto max-w-wrap px-6 pb-[clamp(56px,7vw,96px)]">
      <div className="relative overflow-hidden rounded-card bg-green px-[clamp(28px,4vw,56px)] py-[clamp(40px,5.5vw,72px)] text-center text-surface shadow-card">
        <div className="pointer-events-none absolute -left-10 -top-20 h-[300px] w-[300px] rounded-full bg-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-[120px] -right-[30px] h-[320px] w-[320px] rounded-full bg-[rgba(198,132,30,.16)]" />

        <div className="relative mx-auto max-w-[560px]">
          <h2 className="font-head text-[clamp(30px,4vw,48px)] font-bold leading-[1.06] tracking-[-0.02em]">
            {dictionary.waitlist.title}
          </h2>
          <p className="mt-4 text-[17px] leading-[1.5] text-white/80">
            {dictionary.waitlist.body}
          </p>

          <div className="mt-6">
            <div className="text-[13px] font-bold tracking-[0.02em] text-white/70">
              {dictionary.waitlist.storeCaption}
            </div>
            <AppStoreButtons tone="light" className="mt-3 justify-center" />
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
              {dictionary.waitlist.noSpam}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
