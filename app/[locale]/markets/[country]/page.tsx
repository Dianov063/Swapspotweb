import NationalMarketPage, { activeNationalMarket, nationalMarketMetadata } from "@/components/directory/NationalMarketPage";

type Props = { params: Promise<{ country: string; locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { country, locale } = await params;
  return nationalMarketMetadata(await activeNationalMarket(country, locale));
}

export default async function Page({ params }: Props) {
  const { country, locale } = await params;
  return <NationalMarketPage page={await activeNationalMarket(country, locale)} />;
}
