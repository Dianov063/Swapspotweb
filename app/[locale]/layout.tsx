import type { Metadata } from "next";
import RootDocument from "@/components/RootDocument";
import { getDictionary } from "@/lib/i18n";
import { findSiteLanguage, routeLocale } from "@/lib/languages";
import { registryLanguageCopy } from "@/lib/registryLanguageCopy";
import { baseMetadata, siteViewport } from "@/lib/siteMetadata";
import { tifinagh } from "./fonts";

// Root layout of /<locale>/... pages: `<html lang>` (BCP 47) and `dir` of the URL language from the
// language registry (rtl for ar, ar-EG, ary). Unknown or hidden languages (404s) render with English.
type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export const viewport = siteViewport;

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const locale = await routeLocale((await params).locale);
  if (!locale) return baseMetadata();
  const dictionary = getDictionary(locale);
  return baseMetadata({ title: dictionary.metaTitle, description: dictionary.metaDescription, locale });
}

export default async function LocaleLayout({ children, params }: Props) {
  const locale = await routeLocale((await params).locale);
  const language = locale ? await findSiteLanguage(locale) : null;
  if (!locale || !language) return <RootDocument lang="en">{children}</RootDocument>;
  return (
    <RootDocument
      lang={language.tag}
      dir={language.dir}
      className={language.script === "Tfng" ? tifinagh.variable : undefined}
      registryCopy={registryLanguageCopy(locale)}
    >
      {children}
    </RootDocument>
  );
}
