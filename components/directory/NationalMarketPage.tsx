import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/appLinks";
import { getDictionary, localizedPath } from "@/lib/i18n";
import { getMarket, isActive } from "@/lib/markets";
import { nationalMarkets } from "@/lib/nationalMarkets";

type NationalMarketPage = (typeof nationalMarkets)[number];

export async function activeNationalMarket(country: string, locale: string) {
  const page = nationalMarkets.find((market) => market.slug === country && market.locale === locale);
  if (!page || !isActive(await getMarket(page.code, { live: true }))) notFound();
  return page;
}

export function nationalMarketMetadata(page: NationalMarketPage): Metadata {
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
  };
}

export default function NationalMarketPage({ page }: { page: NationalMarketPage }) {
  const dictionary = getDictionary(page.locale);
  const appleUrl = APP_STORE_URL.replace("apple.com/app/", `apple.com/${page.code.toLowerCase()}/app/`);
  const googleUrl = `${GOOGLE_PLAY_URL}&gl=${page.code}&hl=${page.locale}`;

  return (
    <div lang={page.locale}>
      <Header locale={page.locale} dictionary={dictionary} />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,8vw,112px)]">
        <h1 className="font-head text-[clamp(36px,6vw,68px)] font-bold leading-tight text-ink">{page.title}</h1>
        <p className="mt-5 max-w-[680px] text-lg text-ink-soft">{page.description}</p>
        <p className="mt-3 max-w-[680px] text-ink-soft">{page.coverage}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href={appleUrl}>App Store</Button>
          <Button href={googleUrl}>Google Play</Button>
          <Button href={localizedPath(page.locale, "/services")} variant="white">{page.directory}</Button>
        </div>
        <p className="mt-8 max-w-[680px] text-sm text-ink-soft">{page.demoNote}</p>
      </main>
      <Footer locale={page.locale} dictionary={dictionary} tagline={"footerTagline" in page ? page.footerTagline : undefined} />
    </div>
  );
}
