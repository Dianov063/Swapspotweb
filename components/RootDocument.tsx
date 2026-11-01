import Script from "next/script";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import SiteAnalytics from "@/components/SiteAnalytics";
import type { RegistryLanguageCopy } from "@/lib/registryLanguageCopy";
import "@/app/globals.css";

const googleAnalyticsId = "G-7Q90DY0VEK";
const consentRegions = [
  "AT", "BE", "BG", "CH", "CY", "CZ", "DE", "DK", "EE", "ES", "FI",
  "FR", "GB", "GR", "HR", "HU", "IE", "IS", "IT", "LI", "LT", "LU",
  "LV", "MT", "NL", "NO", "PL", "PT", "RO", "SE", "SI", "SK",
];

/**
 * `<html>` shell shared by the two root layouts: app/(site) (English, `lang="en"`) and
 * app/[locale] (`lang` and `dir` of the URL locale from the language registry, e.g. `rtl` for
 * ar, ar-EG and ary). `className` carries font variables (Tifinagh for zgh); `registryCopy` the
 * client-side strings of a registry language.
 */
export default function RootDocument({
  lang,
  dir = "ltr",
  className,
  registryCopy,
  children,
}: {
  lang: string;
  dir?: "ltr" | "rtl";
  className?: string;
  registryCopy?: RegistryLanguageCopy;
  children: React.ReactNode;
}) {
  return (
    <html lang={lang} dir={dir} className={className}>
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
      </head>
      <body>
        <MaintenanceBanner registryCopy={registryCopy} />
        {children}
        <SiteAnalytics googleAnalyticsId={googleAnalyticsId} registryCopy={registryCopy} />
      </body>
    </html>
  );
}
