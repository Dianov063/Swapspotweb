import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicesDirectoryPage, { servicesDirectoryMetadata } from "@/components/directory/ServicesDirectoryPage";
import { routeLocale } from "@/lib/languages";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await routeLocale((await params).locale);
  return locale ? servicesDirectoryMetadata(locale) : {};
}

export default async function Page({ params }: Props) {
  const locale = await routeLocale((await params).locale);
  if (!locale) notFound();
  return <ServicesDirectoryPage locale={locale} />;
}
