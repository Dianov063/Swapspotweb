import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categoryName } from "@/lib/categoryNames";
import { categories, type Category } from "@/lib/data";
import { categoryVars, directoryStrings, fillTemplate } from "@/lib/directoryStrings";
import { dictionaries, hreflangAlternates, localizedPath, textDirection, type Locale } from "@/lib/i18n";

export function findCategory(slug: string) {
  return categories.find((category) => category.slug === slug) ?? null;
}

export function categoryLabel(category: Category, locale: Locale) {
  return locale === "en" ? category.name : categoryName(category.slug, locale) ?? category.name;
}

export function categoryMetadata(locale: Locale, slug: string): Metadata {
  const category = findCategory(slug);
  if (!category) return {};
  const t = directoryStrings(locale);
  const vars = categoryVars(categoryLabel(category, locale), locale);
  return {
    title: fillTemplate(t.categoryMetaTitle, vars),
    description: fillTemplate(t.categoryMetaDescription, vars),
    alternates: hreflangAlternates(`/categories/${category.slug}`, locale),
  };
}

/** /categories/[slug]: one indexable page per service category. */
export default function CategoryPage({ locale, category }: { locale: Locale; category: Category }) {
  const t = directoryStrings(locale);
  const dictionary = dictionaries[locale];
  const vars = categoryVars(categoryLabel(category, locale), locale);

  return (
    <div lang={locale} dir={textDirection(locale)} className="min-w-0 overflow-x-clip [&_*]:min-w-0">
      <Header locale={locale} dictionary={dictionary} />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
          {fillTemplate(t.categoryTitle, vars)}
        </h1>
        <p className="mt-4 text-[18px] text-ink-soft">{fillTemplate(t.categoryBody, vars)}</p>
        <Link
          href={localizedPath(locale, "/services")}
          className="mt-6 inline-flex rounded-full bg-green px-5 py-3 text-[15px] font-extrabold text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-green-deep"
        >
          {t.backToDirectory}
        </Link>
      </main>
      <Footer locale={locale} dictionary={dictionary} />
    </div>
  );
}
