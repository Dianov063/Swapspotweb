import { SectionHead } from "./ui";
import { steps } from "@/lib/data";
import type { Dictionary } from "@/lib/i18n";

export default function HowItWorks({ dictionary }: { dictionary: Dictionary }) {
  return (
    <section id="how" className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
      <SectionHead eyebrow={dictionary.how.eyebrow} title={dictionary.how.title}>
        {dictionary.how.body}
      </SectionHead>

      <div className="mt-12 grid gap-[22px] md:grid-cols-3">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const localized = dictionary.steps[index] ?? [s.title, s.text];
          return (
            <article
              key={s.n}
              className="relative overflow-hidden rounded-card border border-line bg-surface p-[30px_28px] shadow-card-sm"
            >
              <span className="absolute right-6 top-[18px] font-head text-[46px] font-extrabold leading-none text-green-soft">
                {s.n}
              </span>
              <span className="mb-[18px] grid h-[54px] w-[54px] place-items-center rounded-2xl bg-green-soft text-green">
                <Icon className="h-[26px] w-[26px]" />
              </span>
              <h3 className="mb-2 font-head text-[21px] font-bold tracking-[-0.01em] text-ink">
                {localized[0]}
              </h3>
              <p className="text-[15.5px] leading-[1.5] text-ink-soft">
                {localized[1]}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
