import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CityPage, { cityMetadata, findCity } from "@/components/directory/CityPage";
import { cities } from "@/lib/data";
import { isLocale, locales } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales
    .filter((locale) => locale !== "en")
    .flatMap((locale) => cities.map((city) => ({ locale, slug: city.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return isLocale(locale) && locale !== "en" ? cityMetadata(locale, slug) : {};
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const city = findCity(slug);
  if (!isLocale(locale) || locale === "en" || !city) notFound();
  return <CityPage locale={locale} city={city} />;
}
