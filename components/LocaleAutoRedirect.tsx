"use client";

import { useEffect } from "react";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";

const languageAliases: Record<string, Locale> = {
  tl: "fil",
  "zh-cn": "zh",
  "zh-sg": "zh",
};

export default function LocaleAutoRedirect() {
  useEffect(() => {
    const storageKey = "swapspot-locale-detected";
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "1");

    const supported = new Set<string>(locales);
    const detected = navigator.languages
      .map((value) => value.toLowerCase())
      .map((value) => languageAliases[value] ?? languageAliases[value.split("-")[0]] ?? value.split("-")[0])
      .find((value) => supported.has(value)) as Locale | undefined;

    if (detected && detected !== defaultLocale) {
      window.location.replace(`/${detected}`);
    }
  }, []);

  return null;
}
