import type { Metadata } from "next";
import ServiceMarketPage, { serviceMarketMetadata } from "@/components/directory/ServiceMarketPage";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ categorySlug: string; marketSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, marketSlug } = await params;
  return serviceMarketMetadata("en", categorySlug, marketSlug);
}

export default async function Page({ params }: Props) {
  const { categorySlug, marketSlug } = await params;
  return <ServiceMarketPage locale="en" categorySlug={categorySlug} marketSlug={marketSlug} />;
}
