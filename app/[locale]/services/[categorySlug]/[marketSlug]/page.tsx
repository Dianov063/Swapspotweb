import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceMarketPage, { serviceMarketMetadata } from "@/components/directory/ServiceMarketPage";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; categorySlug: string; marketSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, categorySlug, marketSlug } = await params;
  if (!isLocale(locale) || locale === "en") return {};
  return serviceMarketMetadata(locale, categorySlug, marketSlug);
}

export default async function Page({ params }: Props) {
  const { locale, categorySlug, marketSlug } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  return <ServiceMarketPage locale={locale} categorySlug={categorySlug} marketSlug={marketSlug} />;
}
