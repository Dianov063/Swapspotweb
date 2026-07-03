"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Apple, CheckCircle2, Hammer, Play } from "lucide-react";
import { localizedPath, type Dictionary, type Locale } from "@/lib/i18n";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.swapspotnyc.app&pcampaignid=web_share";

export default function WaitlistCTA({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setJoined(true);
  }

  return (
    <section id="waitlist" className="mx-auto max-w-wrap px-6 pb-[clamp(56px,7vw,96px)]">
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

          {joined ? (
            <div className="mx-auto mt-7 inline-flex items-center gap-2.5 rounded-full bg-white/[0.14] px-6 py-3.5 text-[16px] font-bold">
              <CheckCircle2 className="h-5 w-5" />
              {dictionary.waitlist.thanks}
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mt-7 flex flex-wrap justify-center gap-2.5"
              noValidate
            >
              <label htmlFor="waitlist-email" className="sr-only">
                {dictionary.waitlist.email}
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                autoComplete="email"
                placeholder={dictionary.waitlist.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-[340px] flex-1 basis-[260px] rounded-full px-5 py-3.5 text-[16px] text-ink outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-7 py-3.5 text-[16px] font-extrabold text-green-deep transition-transform duration-150 hover:-translate-y-0.5 hover:bg-gold-soft"
              >
                {dictionary.waitlist.join}
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="text-[13px] font-bold tracking-[0.02em] text-white/70">
              {dictionary.waitlist.storeCaption}
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <a
                href={localizedPath(locale, "/#waitlist")}
                className="inline-flex items-center gap-3 rounded-[14px] border border-white/15 bg-[#10231A] px-5 py-2.5 text-left text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#0A1A12]"
              >
                <Apple className="h-6 w-6 shrink-0" />
                <span>
                  <span className="block text-[10.5px] font-semibold leading-[1.1] opacity-70">
                    {dictionary.waitlist.comingSoon}
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
              {dictionary.waitlist.noSpam}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
