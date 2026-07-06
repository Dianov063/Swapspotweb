import Link from "next/link";
import { Brand } from "./ui";
import {
  defaultLocale,
  dictionaries,
  localizedPath,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

export default function Footer({
  locale = defaultLocale,
  dictionary = dictionaries[defaultLocale],
}: {
  locale?: Locale;
  dictionary?: Dictionary;
}) {
  const columns = [
    {
      heading: dictionary.footer.product,
      links: [
        { href: localizedPath(locale, "/#how"), label: dictionary.nav.how },
        { href: localizedPath(locale, "/#pricing"), label: "Pricing" },
        { href: localizedPath(locale, "/#categories"), label: dictionary.nav.categories },
        { href: localizedPath(locale, "/#trust"), label: dictionary.nav.trust },
      ],
    },
    {
      heading: dictionary.nav.helpers,
      links: [
        { href: "/helpers", label: dictionary.hero.becomeHelper },
        { href: localizedPath(locale, "/#download"), label: dictionary.nav.getApp },
        { href: "/helpers#pricing", label: "Pricing & payouts" },
      ],
    },
    {
      heading: dictionary.footer.company,
      links: [
        { href: "/blog", label: "Blog" },
        { href: "/contact", label: dictionary.footer.contact },
        { href: "/support", label: "Support" },
        { href: "/account-deletion", label: "Account deletion" },
        { href: "/privacy", label: dictionary.footer.privacy },
        { href: "/terms", label: "Terms" },
      ],
    },
  ];

  return (
    <footer className="bg-green-deep text-white/[0.78]">
      <div className="mx-auto grid max-w-wrap grid-cols-2 gap-8 px-6 pb-[clamp(28px,3vw,40px)] pt-[clamp(40px,5vw,64px)] md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="col-span-2 max-w-[320px] md:col-span-1">
          <Brand invert className="mb-3.5" href={localizedPath(locale, "/")} />
          <p className="text-[15px] leading-[1.55]">
            {dictionary.footer.tagline}
          </p>
          <p className="mt-3 text-[12.5px] leading-[1.5] text-white/55">
            Operating under USPROJECT LLC · EIN 83-3989558 · New York, USA
          </p>
          <a
            href="mailto:hello@swapspot.org"
            className="mt-2 inline-flex text-[12.5px] font-bold text-white/70 transition-colors hover:text-white"
          >
            hello@swapspot.org
          </a>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <h4 className="mb-3 text-[14px] font-extrabold text-white">
              {col.heading}
            </h4>
            <div className="grid gap-[9px]">
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[14.5px] transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.14]">
        <div className="mx-auto flex max-w-wrap flex-wrap items-center justify-between gap-3 px-6 py-5 text-[13.5px]">
          <span>{dictionary.footer.rights}</span>
          <span>{dictionary.footer.bottom}</span>
        </div>
      </div>
    </footer>
  );
}
