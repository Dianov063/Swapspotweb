import { Check, Clock, LockKeyhole, MessageSquareText, Search } from "lucide-react";
import { Button, Eyebrow } from "./ui";
import { localizedPath, type Locale } from "@/lib/i18n";
import { clientPricingCopy, passPriceCopy } from "@/lib/pricingCopy";
import { getMarket, isActive } from "@/lib/markets";
import { formatPassPrice } from "@/lib/priceFormat";
import { referencePassPrices, type StorePrice } from "@/lib/storePrices";

const actionIcons = [MessageSquareText, Search, LockKeyhole];

export default async function ClientPricing({ locale, marketCountry }: { locale: Locale; marketCountry?: string | null }) {
  // Complete in all 16 locales (checked by npm run test:intl).
  const t = clientPricingCopy[locale] ?? clientPricingCopy.en;
  const priceCopy = passPriceCopy[locale] ?? passPriceCopy.en;
  // Unknown, absent or inactive country: neutral text, never a US price.
  const market = await getMarket(marketCountry);
  const reference = referencePassPrices(marketCountry, isActive(market));
  const priceFor = (price: StorePrice | undefined, period: "day" | "month") =>
    price ? formatPassPrice(price.amount, price.currency, locale, period) : null;
  const localizedPlans = t.plans.map((plan, index) => ({
    ...plan,
    price: index === 0 ? priceFor(reference?.dayPass, "day") : priceFor(reference?.monthlyPass, "month"),
  }));

  return (
    <section id="pricing" className="border-y border-line bg-cream">
      <div className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <div className="grid gap-[clamp(28px,5vw,56px)] lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 className="mt-3.5 font-head text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
              {t.title}
            </h2>
            <p className="mt-4 text-[17px] leading-[1.55] text-ink-soft">
              {t.body}
            </p>

            <div className="mt-7 rounded-card-md border border-line bg-surface p-5 shadow-card-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-green-soft text-green">
                  <Search className="h-[22px] w-[22px]" />
                </span>
                <div>
                  <h3 className="font-head text-[19px] font-extrabold text-ink">
                    {t.freeTitle}
                  </h3>
                  <p className="mt-1.5 text-[14.5px] leading-[1.5] text-ink-soft">
                    {t.freeBody}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-line pt-5">
                <div className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.06em] text-green-deep">
                  {t.unlock}
                </div>
                <div className="grid gap-2">
                  {t.actions.map((action, index) => {
                    const Icon = actionIcons[index];
                    return (
                      <div key={action} className="flex items-center gap-2.5 text-[14px] font-bold text-ink">
                        <Icon className="h-4 w-4 text-green" />
                        {action}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {localizedPlans.map((plan) => (
              <article
                key={plan.name}
                className={`relative rounded-card border p-6 shadow-card-sm ${
                  plan.best
                    ? "border-green bg-surface shadow-card"
                    : "border-line bg-surface"
                }`}
              >
                {plan.best ? (
                  <span className="absolute right-5 top-5 rounded-full bg-green px-3 py-1 text-[12px] font-extrabold text-white">
                    {plan.best}
                  </span>
                ) : null}
                <h3 className="font-head text-[24px] font-extrabold text-ink">
                  {plan.name}
                </h3>
                {plan.price ? (
                  <>
                    <div className="mt-3 font-head text-[42px] font-extrabold tracking-[-0.02em] text-green-deep">
                      {plan.price}
                    </div>
                    <p className="mt-1 text-[12.5px] font-semibold text-ink-soft">{priceCopy.referenceNote}</p>
                  </>
                ) : (
                  <div className="mt-3 text-[17px] font-extrabold leading-[1.35] text-green-deep">
                    {priceCopy.seeStore}
                  </div>
                )}
                <p className="mt-2 min-h-[48px] text-[14.5px] leading-[1.5] text-ink-soft">
                  {plan.note}
                </p>
                <div className="mt-6 grid gap-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-[14px] font-semibold text-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button
                  href={localizedPath(locale, "/#download")}
                  variant={plan.best ? "green" : "white"}
                  className="mt-7 w-full justify-center"
                >
                  {plan.best ? <Clock className="h-4 w-4" /> : null}
                  {plan.cta}
                </Button>
              </article>
            ))}
          </div>
        </div>
        <p className="mt-5 text-center text-[13px] font-semibold text-ink-soft">
          {priceCopy.footnote}
        </p>
      </div>
    </section>
  );
}
