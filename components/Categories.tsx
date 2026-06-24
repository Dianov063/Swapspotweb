import Link from "next/link";
import { Eyebrow } from "./ui";
import { categories } from "@/lib/data";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function Categories({
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <section id="categories" className="mx-auto max-w-wrap px-6 pb-[clamp(48px,6vw,86px)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[560px]">
          <Eyebrow>{dictionary.categories.eyebrow}</Eyebrow>
          <h2 className="mt-3.5 font-head text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink">
            {dictionary.categories.title}
          </h2>
        </div>
        <p className="max-w-[300px] text-[16px] text-ink-soft">
          {dictionary.categories.body}
        </p>
      </div>

      <div className="mt-[38px] grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => {
          const Icon = c.icon;
          const name =
            dictionary.categories.names[
              c.slug as keyof typeof dictionary.categories.names
            ] ?? c.name;
          return (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="group flex flex-col gap-3.5 rounded-card-md border border-line bg-surface p-[24px_20px] shadow-card-sm transition-all duration-150 hover:-translate-y-[3px] hover:border-green hover:shadow-card"
            >
              <span className="grid h-[50px] w-[50px] place-items-center rounded-[14px] bg-green-soft text-green">
                <Icon className="h-[25px] w-[25px]" />
              </span>
              <div>
                <div className="font-head text-[17px] font-bold text-ink">
                  {name}
                </div>
                <div className="mt-0.5 text-[13px] font-semibold text-ink-soft">
                  {c.count} {dictionary.categories.nearby}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
