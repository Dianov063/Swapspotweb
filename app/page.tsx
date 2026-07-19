import HomePage from "@/components/HomePage";
import LocaleAutoRedirect from "@/components/LocaleAutoRedirect";
import { dictionaries, defaultLocale } from "@/lib/i18n";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Page() {
  const country = (await headers()).get("x-vercel-ip-country");
  return (
    <>
      <LocaleAutoRedirect />
      <HomePage locale={defaultLocale} dictionary={dictionaries[defaultLocale]} marketCountry={country} />
    </>
  );
}
