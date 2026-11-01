import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import HomePage from "@/components/HomePage";
import { getDictionary, locales } from "@/lib/i18n";
import { localeAlternates, routeLocale } from "@/lib/languages";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.filter((locale) => locale !== "en").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await routeLocale((await params).locale);
  if (!locale) return {};
  const dictionary = getDictionary(locale);

  return {
    title: { absolute: dictionary.metaTitle },
    description: dictionary.metaDescription,
    alternates: await localeAlternates("/", locale),
  };
}

export default async function LocalizedPage({ params }: Props) {
  const locale = await routeLocale((await params).locale);
  if (!locale) notFound();
  const country = (await headers()).get("x-vercel-ip-country");

  return <HomePage locale={locale} dictionary={getDictionary(locale)} marketCountry={country} />;
}
