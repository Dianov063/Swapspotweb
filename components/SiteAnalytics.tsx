"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import CookieConsent from "./CookieConsent";

// Pages that carry one-time secrets in the URL (password reset links): no
// analytics tag, no consent banner. next.config.js adds a CSP that blocks
// third-party scripts and beacons there as a second line of defence.
export const PRIVATE_PATH_PREFIXES = ["/auth/"];

export function isPrivatePath(pathname: string) {
  return PRIVATE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function SiteAnalytics({ googleAnalyticsId }: { googleAnalyticsId: string }) {
  const pathname = usePathname() ?? "";
  if (isPrivatePath(pathname)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', '${googleAnalyticsId}');
        `}
      </Script>
      <CookieConsent />
    </>
  );
}
