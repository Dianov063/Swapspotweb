import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://swapspot.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SwapSpot - Find Trusted Local Help Near You",
    template: "%s | SwapSpot",
  },
  description:
    "Book trusted local helpers for cleaning, repairs, beauty, lawn care, moving, pet care, senior care, tutoring, and more.",
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
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      es: "/es",
      zh: "/zh",
      fr: "/fr",
      ru: "/ru",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "SwapSpot - Find Trusted Local Help Near You",
    description:
      "The neighborhood marketplace for trusted local help. Cleaning, repairs, beauty, lawn care, moving, pet care and more.",
    siteName: "SwapSpot",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwapSpot - Find Trusted Local Help Near You",
    description:
      "Book trusted local helpers for cleaning, repairs, beauty, lawn care, moving, pet care, senior care, tutoring, and more.",
  },
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%231B6B45'/%3E%3Cpath d='M50 28c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16z' fill='%23fff'/%3E%3Ccircle cx='50' cy='44' r='6.5' fill='%231B6B45'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B6B45",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
