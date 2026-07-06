import { ArrowRight, CalendarCheck, TrendingUp } from "lucide-react";
import { Button, Eyebrow } from "./ui";
import { perks } from "@/lib/data";
import { localizedPath, type Dictionary, type Locale } from "@/lib/i18n";

const bars = [42, 64, 38, 78, 54, 90, 62];

export default function ForHelpers({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <section id="helpers" className="mx-auto max-w-wrap px-6 pb-[clamp(48px,6vw,86px)]">
      <div className="relative overflow-hidden rounded-card bg-green p-[clamp(34px,4.5vw,60px)] text-surface shadow-card">
        <div className="pointer-events-none absolute -right-[60px] -top-[90px] h-[340px] w-[340px] rounded-full bg-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-[110px] left-[30%] h-[280px] w-[280px] rounded-full bg-[rgba(198,132,30,.18)]" />

        <div className="relative grid items-center gap-[clamp(32px,5vw,56px)] lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Eyebrow tone="cream">{dictionary.helpers.eyebrow}</Eyebrow>
            <h2 className="mt-3.5 font-head text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.02em]">
              {dictionary.helpers.title}
            </h2>
            <p className="mt-4 max-w-[460px] text-[17px] leading-[1.55] text-white/80">
              {dictionary.helpers.body}
            </p>

            <div className="mt-7 grid gap-3.5">
              {perks.map((p, index) => {
                const Icon = p.icon;
                const localized = dictionary.perks[index] ?? [p.title, p.text];
                return (
                  <div key={p.title} className="flex items-center gap-3.5">
                    <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-white/[0.12] text-[#F2C879]">
                      <Icon className="h-[21px] w-[21px]" />
                    </span>
                    <div>
                      <div className="text-[16.5px] font-bold">{localized[0]}</div>
                      <div className="text-[14px] text-white/70">{localized[1]}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button href={localizedPath(locale, "/#download")} variant="gold" className="mt-[30px]">
              <ArrowRight className="h-[18px] w-[18px]" />
              {dictionary.helpers.start}
            </Button>
          </div>

          <div className="mx-auto w-full max-w-[380px] rounded-[22px] bg-white p-6 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,.35)]">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-bold text-[#7A857E]">
                {dictionary.helpers.earnings}
              </div>
              <span className="inline-flex items-center gap-[3px] rounded-full bg-green-soft px-[9px] py-1 text-[12px] font-extrabold text-green">
                <TrendingUp className="h-[13px] w-[13px]" />
                +18%
              </span>
            </div>
            <div className="my-[6px] font-head text-[42px] font-extrabold tracking-[-0.02em] text-ink">
              $480
            </div>
            <div className="my-[18px] flex h-[74px] items-end gap-[7px]">
              {bars.map((h, i) => (
                <span
                  key={i}
                  className={`flex-1 rounded-md ${
                    i === 3 ? "bg-green" : i === 5 ? "bg-gold" : "bg-green-soft"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-3.5 flex items-center gap-[11px] border-t border-line pt-3.5">
              <span className="grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-gold-soft text-gold-deep">
                <CalendarCheck className="h-[19px] w-[19px]" />
              </span>
              <div className="leading-[1.3]">
                <div className="text-[14px] font-extrabold text-ink">
                  {dictionary.helpers.bookings}
                </div>
                <div className="text-[12.5px] font-semibold text-[#7A857E]">
                  {dictionary.helpers.quotes}
                </div>
              </div>
              <span className="ml-auto h-[9px] w-[9px] rounded-full bg-green" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
