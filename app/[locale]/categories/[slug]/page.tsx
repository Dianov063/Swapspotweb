import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPage, { categoryMetadata, findCategory } from "@/components/directory/CategoryPage";
import { categories } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { routeLocale } from "@/lib/languages";

type Props = { params: Promise<{ locale: string; slug: string }> };

// Shipped locales are prerendered; public registry languages render on demand.
export function generateStaticParams() {
  return locales
    .filter((locale) => locale !== "en")
    .flatMap((locale) => categories.map((category) => ({ locale, slug: category.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = await routeLocale(segment);
  return locale ? categoryMetadata(locale, slug) : {};
}

export default async function Page({ params }: Props) {
  const { locale: segment, slug } = await params;
  const locale = await routeLocale(segment);
  const category = findCategory(slug);
  if (!locale || !category) notFound();
  return <CategoryPage locale={locale} category={category} />;
}
