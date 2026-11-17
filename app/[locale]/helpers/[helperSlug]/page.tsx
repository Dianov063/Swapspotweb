import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HelperProfilePage, { helperProfileMetadata } from "@/components/directory/HelperProfilePage";
import { routeLocale } from "@/lib/languages";

export const revalidate = 300;

// Cache public pages on demand without rendering every city and language at build time.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ locale: string; helperSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: segment, helperSlug } = await params;
  const locale = await routeLocale(segment);
  if (!locale) return {};
  return helperProfileMetadata(locale, helperSlug);
}

export default async function Page({ params }: Props) {
  const { locale: segment, helperSlug } = await params;
  const locale = await routeLocale(segment);
  if (!locale) notFound();
  return <HelperProfilePage locale={locale} helperSlug={helperSlug} />;
}
