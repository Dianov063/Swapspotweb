import type { Metadata } from "next";
import ServiceMarketPage, { serviceMarketMetadata } from "@/components/directory/ServiceMarketPage";

// Public HTML is cached at the CDN. Avoid a durable ISR copy per city and language.
export const revalidate = 0;

type Props = { params: Promise<{ categorySlug: string; marketSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, marketSlug } = await params;
  return serviceMarketMetadata("en", categorySlug, marketSlug);
}

export default async function Page({ params }: Props) {
  const { categorySlug, marketSlug } = await params;
  return <ServiceMarketPage locale="en" categorySlug={categorySlug} marketSlug={marketSlug} />;
}
