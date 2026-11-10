import NationalMarketPage, { activeNationalMarket, nationalMarketMetadata } from "@/components/directory/NationalMarketPage";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props) {
  return nationalMarketMetadata(await activeNationalMarket((await params).country, "en"));
}

export default async function Page({ params }: Props) {
  return <NationalMarketPage page={await activeNationalMarket((await params).country, "en")} />;
}
