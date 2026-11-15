import type { Metadata } from "next";
import HelperProfilePage, { helperProfileMetadata } from "@/components/directory/HelperProfilePage";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ helperSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { helperSlug } = await params;
  return helperProfileMetadata("en", helperSlug);
}

export default async function Page({ params }: Props) {
  const { helperSlug } = await params;
  return <HelperProfilePage locale="en" helperSlug={helperSlug} />;
}
