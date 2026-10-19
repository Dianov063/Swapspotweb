import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HelpersLandingPage, { helpersLandingMetadata } from "@/components/directory/HelpersLandingPage";
import { locales } from "@/lib/i18n";
import { routeLocale } from "@/lib/languages";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.filter((locale) => locale !== "en").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await routeLocale((await params).locale);
  return locale ? helpersLandingMetadata(locale) : {};
}

export default async function Page({ params }: Props) {
  const locale = await routeLocale((await params).locale);
  if (!locale) notFound();
  return <HelpersLandingPage locale={locale} />;
}
