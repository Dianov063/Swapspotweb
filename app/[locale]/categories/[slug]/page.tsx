import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPage, { categoryMetadata, findCategory } from "@/components/directory/CategoryPage";
import { categories } from "@/lib/data";
import { isLocale, locales } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales
    .filter((locale) => locale !== "en")
    .flatMap((locale) => categories.map((category) => ({ locale, slug: category.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return isLocale(locale) && locale !== "en" ? categoryMetadata(locale, slug) : {};
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const category = findCategory(slug);
  if (!isLocale(locale) || locale === "en" || !category) notFound();
  return <CategoryPage locale={locale} category={category} />;
}
