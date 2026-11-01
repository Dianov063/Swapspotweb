import HomePage from "@/components/HomePage";
import LocaleAutoRedirect from "@/components/LocaleAutoRedirect";
import { dictionaries, defaultLocale } from "@/lib/i18n";
import { getSiteLanguages, localeAlternates } from "@/lib/languages";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { alternates: await localeAlternates("/") };
}

export default async function Page() {
  const country = (await headers()).get("x-vercel-ip-country");
  const segments = (await getSiteLanguages()).map((language) => language.segment);
  return (
    <>
      <LocaleAutoRedirect segments={segments} />
      <HomePage locale={defaultLocale} dictionary={dictionaries[defaultLocale]} marketCountry={country} />
    </>
  );
}
