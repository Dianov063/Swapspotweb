import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicesDirectoryPage, { servicesDirectoryMetadata } from "@/components/directory/ServicesDirectoryPage";
import { isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) && locale !== "en" ? servicesDirectoryMetadata(locale) : {};
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  return <ServicesDirectoryPage locale={locale} />;
}
