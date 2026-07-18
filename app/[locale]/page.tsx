import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import HomePage from "@/components/HomePage";
import { dictionaries, isLocale, locales, localizedPath } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.filter((locale) => locale !== "en").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = dictionaries[locale];
  const languages = Object.fromEntries(locales.map((item) => [item, localizedPath(item, "/")]));

  return {
    title: dictionary.metaTitle,
    description: dictionary.metaDescription,
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
  };
}

export default async function LocalizedPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  const country = (await headers()).get("x-vercel-ip-country");

  return <HomePage locale={locale} dictionary={dictionaries[locale]} marketCountry={country} />;
}
