import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CityPage, { cityMetadata, findCity } from "@/components/directory/CityPage";
import { cities } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { routeLocale } from "@/lib/languages";

type Props = { params: Promise<{ locale: string; slug: string }> };

// Shipped locales are prerendered; public registry languages render on demand.
export function generateStaticParams() {
  return locales
    .filter((locale) => locale !== "en")
    .flatMap((locale) => cities.map((city) => ({ locale, slug: city.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = await routeLocale(segment);
  return locale ? cityMetadata(locale, slug) : {};
}

export default async function Page({ params }: Props) {
  const { locale: segment, slug } = await params;
  const locale = await routeLocale(segment);
  const city = findCity(slug);
  if (!locale || !city) notFound();
  return <CityPage locale={locale} city={city} />;
}
