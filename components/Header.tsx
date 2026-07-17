"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Languages, Menu } from "lucide-react";
import { Brand, Button } from "./ui";
import {
  dictionaries,
  defaultLocale,
  localeNames,
  locales,
  localizedPath,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

export default function Header({
  locale = defaultLocale,
  dictionary = dictionaries[defaultLocale],
}: {
  locale?: Locale;
  dictionary?: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const navLinks = [
    { href: localizedPath(locale, "/#how"), label: dictionary.nav.how },
    { href: localizedPath(locale, "/#clients"), label: dictionary.nav.clients },
    { href: localizedPath(locale, "/#pricing"), label: dictionary.nav.pricing },
    { href: localizedPath(locale, "/#categories"), label: dictionary.nav.categories },
    { href: localizedPath(locale, "/#helpers"), label: dictionary.nav.helpers },
    { href: localizedPath(locale, "/#trust"), label: dictionary.nav.trust },
  ];

  function changeLanguage(value: string) {
    if (!locales.includes(value as Locale)) return;
    window.location.href = localizedPath(value as Locale, "/");
  }

  return (
    <header
      id="top"
      className="sticky top-0 z-[60] border-b border-line bg-sand/90 backdrop-blur-md"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-wrap items-center gap-5 px-6 py-3.5"
      >
        <Brand className="mr-auto" href={localizedPath(locale, "/")} />

        <div className="hidden items-center gap-[18px] md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[15px] font-semibold text-ink-soft transition-colors hover:text-green-deep"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden items-center lg:flex">
            <Languages className="pointer-events-none absolute left-3 h-4 w-4 text-green" />
            <select
              aria-label="Language"
              value={locale}
              onChange={(event) => changeLanguage(event.target.value)}
              className="h-10 appearance-none rounded-full border border-line bg-surface pl-9 pr-9 text-[13px] font-extrabold text-ink outline-none transition-colors hover:border-green"
            >
              {locales.map((item) => (
                <option key={item} value={item}>
                  {localeNames[item]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-ink-soft" />
          </div>
          <Button href={localizedPath(locale, "/#download")} size="sm" className="hidden sm:inline-flex">
            {dictionary.nav.getApp}
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-xl border-[1.5px] border-line bg-surface text-ink md:hidden"
          >
            <Menu className="h-[22px] w-[22px]" />
          </button>
        </div>
      </nav>

      <div
        className={`${
          open ? "flex" : "hidden"
        } flex-col gap-1 border-t border-line bg-sand px-4 pb-4 pt-2 md:hidden`}
      >
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="rounded-[10px] px-2 py-3 font-semibold text-ink hover:bg-green-soft"
          >
            {l.label}
          </Link>
        ))}
        <div className="relative mt-2">
          <Languages className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green" />
          <select
            aria-label="Language"
            value={locale}
            onChange={(event) => changeLanguage(event.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-line bg-surface pl-9 pr-9 text-[14px] font-extrabold text-ink outline-none"
          >
            {locales.map((item) => (
              <option key={item} value={item}>
                {localeNames[item]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        </div>
        <Button href={localizedPath(locale, "/#download")} className="mt-2">
          {dictionary.nav.getApp}
        </Button>
      </div>
    </header>
  );
}
