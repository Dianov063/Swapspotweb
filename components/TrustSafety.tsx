import { SectionHead } from "./ui";
import { trustItems } from "@/lib/data";
import {
  defaultLocale,
  dictionaries,
  type Dictionary,
} from "@/lib/i18n";

export default function TrustSafety({
  dictionary = dictionaries[defaultLocale],
}: {
  dictionary?: Dictionary;
}) {
  return (
    <section id="trust" className="border-y border-line bg-cream">
      <div className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <SectionHead
          eyebrow={dictionary.trust.eyebrow}
          title={dictionary.trust.title}
        >
          {dictionary.trust.body}
        </SectionHead>

        <div className="mt-[46px] grid grid-cols-2 gap-[18px] md:grid-cols-3 lg:grid-cols-5">
          {trustItems.map((t, index) => {
            const Icon = t.icon;
            const localized = dictionary.trustItems[index] ?? [t.title, t.text];
            return (
              <article
                key={t.title}
                className="rounded-card-md border border-line bg-surface p-[26px_24px] shadow-card-sm"
              >
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-[13px] bg-green-soft text-green">
                  <Icon className="h-[23px] w-[23px]" />
                </span>
                <h3 className="mb-[7px] font-head text-[18px] font-bold text-ink">
                  {localized[0]}
                </h3>
                <p className="text-[14.5px] leading-[1.5] text-ink-soft">
                  {localized[1]}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
