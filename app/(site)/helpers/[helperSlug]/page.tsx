import type { Metadata } from "next";
import HelperProfilePage, { helperProfileMetadata } from "@/components/directory/HelperProfilePage";

// Public HTML is cached at the CDN. Helper profiles can contain many services.
export const revalidate = 0;

type Props = { params: Promise<{ helperSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { helperSlug } = await params;
  return helperProfileMetadata("en", helperSlug);
}

export default async function Page({ params }: Props) {
  const { helperSlug } = await params;
  return <HelperProfilePage locale="en" helperSlug={helperSlug} />;
}
