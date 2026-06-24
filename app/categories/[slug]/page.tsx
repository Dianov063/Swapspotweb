import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

// Pre-render every known category at build time for SEO.
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return {};
  return {
    title: `${cat.name} Near You - Trusted Local Helpers`,
    description: `Book trusted local ${cat.name.toLowerCase()} helpers near you on SwapSpot. Compare profiles, prices, and reviews.`,
    alternates: { canonical: `/categories/${cat.slug}` },
  };
}

/**
 * /categories/[slug] — one indexable page per service category.
 */
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-wrap px-6 py-[clamp(48px,6vw,86px)]">
        <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
          {cat.name} helpers near you
        </h1>
        <p className="mt-4 text-[18px] text-ink-soft">
          {cat.count} verified {cat.name.toLowerCase()} helpers in your area.
        </p>
      </main>
      <Footer />
    </>
  );
}
