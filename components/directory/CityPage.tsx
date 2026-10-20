import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categoryLabel } from "@/components/directory/CategoryPage";
import { categories, cities } from "@/lib/data";
import { directoryStrings, fillTemplate } from "@/lib/directoryStrings";
import { getDictionary, languageTag, localizedPath, textDirection, type Locale } from "@/lib/i18n";
import { localeAlternates } from "@/lib/languages";

export type City = (typeof cities)[number];

export function findCity(slug: string) {
  return cities.find((city) => city.slug === slug) ?? null;
}

export async function cityMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const city = findCity(slug);
  if (!city) return {};
  const t = directoryStrings(locale);
  return {
    title: fillTemplate(t.cityMetaTitle, { city: city.name }),
    description: fillTemplate(t.cityMetaDescription, { city: city.name }),
    alternates: await localeAlternates(`/cities/${city.slug}`, locale),
  };
}

/** /cities/[slug]. City names are place names and stay as written. */
export default function CityPage({ locale, city }: { locale: Locale; city: City }) {
  const t = directoryStrings(locale);
  const dictionary = getDictionary(locale);

  return (
    <div lang={languageTag(locale)} dir={textDirection(locale)} className="min-w-0 overflow-x-clip [&_*]:min-w-0">
      <Header locale={locale} dictionary={dictionary} />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
          {fillTemplate(t.cityTitle, { city: city.name })}
        </h1>
        <p className="mt-4 max-w-[720px] text-[18px] leading-[1.55] text-ink-soft">{t.cityBody}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.slug}
              href={localizedPath(locale, `/categories/${category.slug}`)}
              className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm transition-transform duration-150 hover:-translate-y-0.5"
            >
              <div className="text-[15px] font-extrabold text-ink">
                {fillTemplate(t.cityCategory, { category: categoryLabel(category, locale), city: city.name })}
              </div>
              <div className="mt-1 text-[14px] font-semibold text-ink-soft">{t.cityCategoryBody}</div>
            </Link>
          ))}
        </div>
      </main>
      <Footer locale={locale} dictionary={dictionary} />
    </div>
  );
}
