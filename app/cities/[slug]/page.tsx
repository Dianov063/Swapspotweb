import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories, cities } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return cities.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = cities.find((item) => item.slug === slug);
  if (!city) return {};

  return {
    title: `Local Help in ${city.name} - SwapSpot`,
    description: `Find trusted local helpers in ${city.name} for cleaning, repairs, lawn care, pet care, and more.`,
    alternates: { canonical: `/cities/${city.slug}` },
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = cities.find((item) => item.slug === slug);
  if (!city) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
          Trusted local help in {city.name}
        </h1>
        <p className="mt-4 max-w-[720px] text-[18px] leading-[1.55] text-ink-soft">
          Book nearby helpers for cleaning, repairs, lawn care, moving, pet care,
          senior care, tutoring, and more. SwapSpot helps neighbors compare
          services, prices, reviews, and availability before they book.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((category) => (
            <a
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="rounded-card-md border border-line bg-surface p-5 shadow-card-sm transition-transform duration-150 hover:-translate-y-0.5"
            >
              <div className="text-[15px] font-extrabold text-ink">
                {category.name} in {city.name}
              </div>
              <div className="mt-1 text-[14px] font-semibold text-ink-soft">
                Compare trusted local helpers near you
              </div>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
