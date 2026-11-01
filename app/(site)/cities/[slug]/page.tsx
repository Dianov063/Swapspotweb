import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CityPage, { cityMetadata, findCity } from "@/components/directory/CityPage";
import { cities } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return cities.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return cityMetadata("en", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const city = findCity(slug);
  if (!city) notFound();
  return <CityPage locale="en" city={city} />;
}
