import type { Metadata } from "next";
import RootDocument from "@/components/RootDocument";
import { dictionaries, isLocale, languageTag, textDirection } from "@/lib/i18n";
import { baseMetadata, siteViewport } from "@/lib/siteMetadata";

// Root layout of /<locale>/... pages: `<html lang>` of the URL locale and `dir="rtl"` for Arabic.
// Unknown first segments (404s) render with English.
type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export const viewport = siteViewport;

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return baseMetadata();
  const dictionary = dictionaries[locale];
  return baseMetadata({ title: dictionary.metaTitle, description: dictionary.metaDescription, locale });
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return <RootDocument lang="en">{children}</RootDocument>;
  return (
    <RootDocument lang={languageTag(locale)} dir={textDirection(locale)}>
      {children}
    </RootDocument>
  );
}
