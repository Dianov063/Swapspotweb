import type { Metadata } from "next";
import HelperProfilePage, { helperProfileMetadata } from "@/components/directory/HelperProfilePage";
import { getPublicHelperProfiles } from "@/lib/publicDirectory";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ helperSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { helperSlug } = await params;
  return helperProfileMetadata("en", helperSlug);
}

export async function generateStaticParams() {
  const profiles = await getPublicHelperProfiles({ limit: 1000 });
  return profiles.slice(0, 500).map((profile) => ({ helperSlug: profile.slug }));
}

export default async function Page({ params }: Props) {
  const { helperSlug } = await params;
  return <HelperProfilePage locale="en" helperSlug={helperSlug} />;
}
