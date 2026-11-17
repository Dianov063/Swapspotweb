import type { Metadata } from "next";
import HelperProfilePage, { helperProfileMetadata } from "@/components/directory/HelperProfilePage";

export const revalidate = 300;

// Cache public pages on demand without rendering every city and language at build time.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ helperSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { helperSlug } = await params;
  return helperProfileMetadata("en", helperSlug);
}

export default async function Page({ params }: Props) {
  const { helperSlug } = await params;
  return <HelperProfilePage locale="en" helperSlug={helperSlug} />;
}
