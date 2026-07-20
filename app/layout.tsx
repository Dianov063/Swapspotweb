import type { Metadata, Viewport } from "next";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent";
import { locales, localizedPath } from "@/lib/i18n";
import "./globals.css";

const siteUrl = "https://www.swapspot.org";
const googleAnalyticsId = "G-7Q90DY0VEK";
const consentRegions = [
  "AT", "BE", "BG", "CH", "CY", "CZ", "DE", "DK", "EE", "ES", "FI",
  "FR", "GB", "GR", "HR", "HU", "IE", "IS", "IT", "LI", "LT", "LU",
  "LV", "MT", "NL", "NO", "PL", "PT", "RO", "SE", "SI", "SK",
];
const localeAlternates = Object.fromEntries(
  locales.map((locale) => [locale, localizedPath(locale, "/")]),
);

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
    languages: localeAlternates,
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
      <head>
        <Script id="google-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;

            gtag('consent', 'default', {
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
              analytics_storage: 'granted'
            });
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500,
              region: ${JSON.stringify(consentRegions)}
            });
            try {
              var savedConsent = localStorage.getItem('swapspot-consent-v1');
              if (savedConsent === 'granted' || savedConsent === 'denied') {
                gtag('consent', 'update', {
                  ad_storage: savedConsent,
                  ad_user_data: savedConsent,
                  ad_personalization: savedConsent,
                  analytics_storage: savedConsent
                });
              }
            } catch (error) {}
            gtag('set', 'ads_data_redaction', true);
          `}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
          `}
        </Script>
      </head>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
