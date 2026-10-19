"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cookieConsentCopyTable, type CookieConsentCopy } from "@/lib/copy/cookieConsent";
import { isLocale } from "@/lib/locales";
import type { RegistryLanguageCopy } from "@/lib/registryLanguageCopy";

type ConsentChoice = "granted" | "denied";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const storageKey = "swapspot-consent-v1";

function updateGoogleConsent(choice: ConsentChoice) {
  window.dataLayer = window.dataLayer || [];
  const gtag = window.gtag ?? ((...args: unknown[]) => window.dataLayer.push(args));
  gtag("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });
}

/** Locale, text and direction for the current path: shipped tables, or the registry language copy of the layout. */
function localeCopy(pathname: string, registry?: RegistryLanguageCopy): { locale: string; text: CookieConsentCopy; dir: "ltr" | "rtl" } {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (registry && segment === registry.segment) return { locale: segment, text: registry.cookieConsent, dir: registry.dir };
  const locale = isLocale(segment) ? segment : "en";
  return { locale, text: cookieConsentCopyTable[locale], dir: locale === "ar" ? "rtl" : "ltr" };
}

export default function CookieConsent({ registryCopy }: { registryCopy?: RegistryLanguageCopy }) {
  const pathname = usePathname();
  const { locale, text, dir } = useMemo(() => localeCopy(pathname, registryCopy), [pathname, registryCopy]);
  const [visible, setVisible] = useState(false);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    let active = true;
    let saved: ConsentChoice | null = null;
    try {
      saved = window.localStorage.getItem(storageKey) as ConsentChoice | null;
    } catch {}

    if (saved === "granted" || saved === "denied") {
      updateGoogleConsent(saved);
      setCanManage(true);
      return () => {
        active = false;
      };
    }

    fetch("/api/privacy/region", { cache: "no-store" })
      .then((response) => response.json())
      .then((region: { requiresConsent?: boolean }) => {
        if (!active || !region.requiresConsent) return;
        setCanManage(true);
        setVisible(true);
      })
      .catch(() => {
        if (!active) return;
        setCanManage(true);
        setVisible(true);
      });

    return () => {
      active = false;
    };
  }, []);

  function choose(choice: ConsentChoice) {
    updateGoogleConsent(choice);
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch {}
    setCanManage(true);
    setVisible(false);
  }

  const privacyHref = locale === "en" ? "/privacy" : `/${locale}/privacy`;

  return (
    <>
      {visible && (
        <section
          aria-label={text.title}
          className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/15 bg-green-deep text-white shadow-[0_-12px_40px_rgba(9,45,30,0.24)]"
          dir={dir}
        >
          <div className="mx-auto flex max-w-wrap flex-col gap-5 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between md:py-6">
            <div className="max-w-[760px]">
              <div className="flex items-start gap-3">
                <Cookie aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-gold" />
                <div>
                  <h2 className="font-head text-[19px] font-extrabold text-white">
                    {text.title}
                  </h2>
                  <p className="mt-1.5 text-[14.5px] leading-[1.55] text-white/80">
                    {text.body}{" "}
                    <Link className="font-bold text-white underline underline-offset-4" href={privacyHref}>
                      {text.privacy}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-3 sm:flex">
              <button
                type="button"
                onClick={() => choose("denied")}
                className="min-h-12 rounded-md border border-white/55 px-5 text-[15px] font-extrabold text-white transition-colors hover:bg-white/10"
              >
                {text.reject}
              </button>
              <button
                type="button"
                onClick={() => choose("granted")}
                className="min-h-12 rounded-md bg-white px-5 text-[15px] font-extrabold text-green-deep transition-colors hover:bg-sand"
              >
                {text.accept}
              </button>
            </div>
          </div>
        </section>
      )}

      {canManage && !visible && (
        <button
          type="button"
          aria-label={text.settings}
          title={text.settings}
          onClick={() => setVisible(true)}
          className="fixed bottom-4 left-4 z-[90] grid size-12 place-items-center rounded-full border border-white/25 bg-green-deep text-white shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <Cookie aria-hidden="true" className="size-5" />
        </button>
      )}

    </>
  );
}
