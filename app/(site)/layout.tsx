import RootDocument from "@/components/RootDocument";
import { baseMetadata, siteViewport } from "@/lib/siteMetadata";

// Root layout of the English site (URLs without a locale prefix).
export const metadata = baseMetadata();
export const viewport = siteViewport;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
