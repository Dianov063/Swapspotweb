"use client";

import { useEffect } from "react";
import { defaultLocale } from "@/lib/locales";
import { matchLanguage } from "@/lib/languagesCore";

/**
 * First visit of the English home page: redirects once to the visitor's browser language when the
 * site has it. `segments` are the current site languages (shipped + public registry languages).
 * Exact match first, then the language part (`ar-MA` -> `ar`, never `ary`).
 */
export default function LocaleAutoRedirect({ segments }: { segments: string[] }) {
  useEffect(() => {
    const storageKey = "swapspot-locale-detected";
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "1");

    const detected = matchLanguage(navigator.languages ?? [navigator.language], segments);
    if (detected && detected !== defaultLocale) {
      window.location.replace(`/${detected}`);
    }
  }, [segments]);

  return null;
}
