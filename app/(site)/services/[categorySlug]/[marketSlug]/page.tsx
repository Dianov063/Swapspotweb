import type { Metadata } from "next";
import ServiceMarketPage, { serviceMarketMetadata } from "@/components/directory/ServiceMarketPage";

export const revalidate = 300;

// Cache public pages on demand without rendering every city and language at build time.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ categorySlug: string; marketSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, marketSlug } = await params;
  return serviceMarketMetadata("en", categorySlug, marketSlug);
}

export default async function Page({ params }: Props) {
  const { categorySlug, marketSlug } = await params;
  return <ServiceMarketPage locale="en" categorySlug={categorySlug} marketSlug={marketSlug} />;
}
