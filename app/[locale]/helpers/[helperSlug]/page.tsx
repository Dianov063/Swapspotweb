import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HelperProfilePage, { helperProfileMetadata } from "@/components/directory/HelperProfilePage";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; helperSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, helperSlug } = await params;
  if (!isLocale(locale) || locale === "en") return {};
  return helperProfileMetadata(locale, helperSlug);
}

export default async function Page({ params }: Props) {
  const { locale, helperSlug } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  return <HelperProfilePage locale={locale} helperSlug={helperSlug} />;
}
