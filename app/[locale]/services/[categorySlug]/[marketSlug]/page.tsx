import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceMarketPage, { serviceMarketMetadata } from "@/components/directory/ServiceMarketPage";
import { routeLocale } from "@/lib/languages";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; categorySlug: string; marketSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: segment, categorySlug, marketSlug } = await params;
  const locale = await routeLocale(segment);
  if (!locale) return {};
  return serviceMarketMetadata(locale, categorySlug, marketSlug);
}

export default async function Page({ params }: Props) {
  const { locale: segment, categorySlug, marketSlug } = await params;
  const locale = await routeLocale(segment);
  if (!locale) notFound();
  return <ServiceMarketPage locale={locale} categorySlug={categorySlug} marketSlug={marketSlug} />;
}
