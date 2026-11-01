import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/locales";

const defaultTitle = "SwapSpot - Find Trusted Local Help Near You";
const defaultDescription =
  "Book trusted local helpers for cleaning, repairs, beauty, lawn care, moving, pet care, senior care, tutoring, and more.";

// Shared by both root layouts. No `alternates` here: every indexable page sets its own canonical
// and hreflang (lib/locales.ts `hreflangAlternates`), so nothing inherits the home page's.
export function baseMetadata({
  title = defaultTitle,
  description = defaultDescription,
  locale = "en",
}: { title?: string; description?: string; locale?: string } = {}): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: "%s | SwapSpot" },
    description,
    keywords: [
      "local help",
      "home services",
      "cleaning",
      "handyman",
      "lawn care",
      "pet care",
      "tutoring",
      "neighborhood marketplace",
    ],
    openGraph: {
      type: "website",
      url: siteUrl,
      title,
      description:
        locale === "en"
          ? "The neighborhood marketplace for trusted local help. Cleaning, repairs, beauty, lawn care, moving, pet care and more."
          : description,
      siteName: "SwapSpot",
    },
    twitter: { card: "summary_large_image", title, description },
    icons: {
      icon:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%231B6B45'/%3E%3Cpath d='M50 28c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16z' fill='%23fff'/%3E%3Ccircle cx='50' cy='44' r='6.5' fill='%231B6B45'/%3E%3C/svg%3E",
    },
  };
}

export const siteViewport: Viewport = {
  themeColor: "#1B6B45",
};
