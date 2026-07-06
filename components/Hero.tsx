import { Play, Hammer, Star, Check } from "lucide-react";
import { Button } from "./ui";
import PhoneMockup from "./PhoneMockup";
import { localizedPath, type Dictionary, type Locale } from "@/lib/i18n";

const reviewers = [
  { initials: "MR", bg: "#E6F0E9", color: "#1B6B45" },
  { initials: "DT", bg: "#F7EAD2", color: "#8A5B12" },
  { initials: "AL", bg: "#EAEFF6", color: "#3A5A8C" },
  { initials: "JC", bg: "#F3E7EE", color: "#8C3A66" },
];

export default function Hero({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const copy = dictionary.hero;

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-20 -top-[120px] h-[520px] w-[520px] rounded-full bg-green-soft opacity-70 blur-[10px]" />
      <div className="pointer-events-none absolute -bottom-[160px] -left-[120px] h-[420px] w-[420px] rounded-full bg-gold-soft opacity-[0.55] blur-[10px]" />

      <div className="relative mx-auto grid max-w-wrap items-center gap-[clamp(36px,5vw,56px)] px-6 py-[clamp(40px,5.5vw,78px)] lg:grid-cols-[1.05fr_1fr]">
        <div className="order-2 lg:order-1">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-[15px] py-[7px] text-[13.5px] font-bold text-green-deep shadow-card-sm">
            <span className="relative h-[9px] w-[9px]">
              <span className="absolute inset-0 rounded-full bg-green" />
              <span className="absolute inset-0 animate-ping2 rounded-full bg-green" />
            </span>
            {copy.badge}
          </span>

          <h1 className="mt-5 text-balance font-head text-[clamp(38px,5.4vw,60px)] font-bold leading-[1.03] tracking-[-0.02em] text-ink">
            {copy.before} <span className="hl">{copy.highlight}</span> {copy.after}
          </h1>

          <p className="mt-[22px] max-w-[500px] text-pretty text-[clamp(17px,1.5vw,20px)] leading-[1.55] text-ink-soft">
            {copy.body}
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <Button href={localizedPath(locale, "/#download")}>
              <Play className="h-[19px] w-[19px]" />
              {copy.findHelp}
            </Button>
            <Button href={localizedPath(locale, "/#helpers")} variant="white">
              <Hammer className="h-[19px] w-[19px]" />
              {copy.becomeHelper}
            </Button>
          </div>

          <div className="mt-[34px] flex flex-wrap items-center gap-[18px]">
            <div className="flex">
              {reviewers.map((r, i) => (
                <span
                  key={r.initials}
                  className={`grid h-[38px] w-[38px] place-items-center rounded-full border-2 border-sand text-[13px] font-extrabold ${
                    i === 0 ? "" : "-ml-2.5"
                  }`}
                  style={{ background: r.bg, color: r.color }}
                >
                  {r.initials}
                </span>
              ))}
            </div>
            <div className="leading-[1.3]">
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-[15px] w-[15px]" fill="currentColor" />
                ))}
                <span className="ml-1 text-[14px] font-extrabold text-ink">4.9</span>
              </div>
              <div className="mt-0.5 text-[14px] font-semibold text-ink-soft">
                {copy.rating}
              </div>
            </div>
          </div>
        </div>

        <div className="relative order-1 flex min-h-[520px] items-center justify-center lg:order-2 lg:min-h-[560px]">
          <PhoneMockup />

          <div className="absolute -left-1.5 top-[26px] z-10 w-[212px] animate-floaty rounded-[18px] border border-line bg-surface p-4 shadow-card max-[420px]:hidden">
            <div className="mb-[7px] flex items-center gap-1 text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-[13px] w-[13px]" fill="currentColor" />
              ))}
            </div>
            <p className="text-[13.5px] font-semibold leading-[1.4] text-ink">
              &ldquo;{copy.review}&rdquo;
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-gold-soft text-[10px] font-extrabold text-gold-deep">
                DT
              </span>
              <span className="text-[12px] font-semibold text-ink-soft">
                {copy.reviewer}
              </span>
            </div>
          </div>

          <div className="absolute -right-2 bottom-[52px] z-10 flex w-[214px] animate-floaty2 items-center gap-3 rounded-[18px] border border-line bg-surface p-3.5 shadow-card">
            <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-green-soft text-green">
              <Check className="h-5 w-5" />
            </span>
            <div className="leading-[1.25]">
              <div className="text-[13.5px] font-extrabold text-ink">
                {copy.bookingConfirmed}
              </div>
              <div className="text-[12px] font-semibold text-ink-soft">
                {copy.bookingMeta}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
