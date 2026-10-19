import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HelpersLandingPage, { helpersLandingMetadata } from "@/components/directory/HelpersLandingPage";
import { isLocale, locales } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.filter((locale) => locale !== "en").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) && locale !== "en" ? helpersLandingMetadata(locale) : {};
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  return <HelpersLandingPage locale={locale} />;
}
