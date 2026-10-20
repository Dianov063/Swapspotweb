import {
  CalendarCheck,
  Handshake,
  MapPinned,
  MessageCircle,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { Button, Eyebrow } from "./ui";
import { forClientsCopy } from "@/lib/copy/forClients";
import { localizedPath, type Locale } from "@/lib/i18n";

const icons = [SearchCheck, MapPinned, MessageCircle, ShieldCheck];

export default function ForClients({ locale }: { locale: Locale }) {
  const t = forClientsCopy(locale);

  return (
    <section id="clients" className="mx-auto max-w-wrap px-6 pb-[clamp(48px,6vw,86px)]">
      <div className="grid items-center gap-[clamp(30px,5vw,58px)] lg:grid-cols-[1fr_1.05fr]">
        <div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 className="mt-3.5 font-head text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
            {t.title}
          </h2>
          <p className="mt-4 max-w-[520px] text-[17px] leading-[1.55] text-ink-soft">
            {t.body}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[t.statA, t.statB, t.statC].map((stat) => (
              <div
                key={stat}
                className="rounded-card-sm border border-line bg-surface px-4 py-3 text-[14px] font-extrabold text-green-deep shadow-card-sm"
              >
                {stat}
              </div>
            ))}
          </div>

          <Button href={localizedPath(locale, "/#download")} className="mt-7">
            {t.cta}
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-head text-[22px] font-extrabold text-ink">
                  {t.panelTitle}
                </div>
                <div className="mt-1 text-[14px] font-semibold text-ink-soft">
                  {t.panelMeta}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-[12px] font-extrabold text-gold-deep">
                <CalendarCheck className="h-4 w-4" />
                {t.panelAction}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-card-sm bg-cream px-4 py-3">
              <span className="text-[14px] font-bold text-ink-soft">{t.panelTotal}</span>
              <span className="inline-flex items-center gap-2 text-[14px] font-extrabold text-green">
                <Handshake className="h-4 w-4" />
                {t.panelSecure}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {t.cards.map(([title, text], index) => {
              const Icon = icons[index];
              return (
                <article
                  key={title}
                  className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm"
                >
                  <span className="mb-3 grid h-11 w-11 place-items-center rounded-[13px] bg-green-soft text-green">
                    <Icon className="h-[22px] w-[22px]" />
                  </span>
                  <h3 className="font-head text-[17px] font-bold text-ink">{title}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.5] text-ink-soft">{text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
