import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPage, { categoryMetadata, findCategory } from "@/components/directory/CategoryPage";
import { categories } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

// Pre-render every known category at build time for SEO.
export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return categoryMetadata("en", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();
  return <CategoryPage locale="en" category={category} />;
}
