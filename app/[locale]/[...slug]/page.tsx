import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustSafety from "@/components/TrustSafety";
import { staticPageSlugs, staticPagesCopy, type StaticPageSlug } from "@/lib/copy/staticPages";
import { getDictionary, languageTag, localizedPath, locales, textDirection } from "@/lib/i18n";
import { pageLocale } from "@/lib/languages";

type Props = { params: Promise<{ locale: string; slug: string[] }> };

function isSupportedPage(value: string): value is StaticPageSlug {
  return staticPageSlugs.includes(value as StaticPageSlug);
}

// Shipped locales are prerendered; public registry languages render on demand.
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    staticPageSlugs.map((page) => ({ locale, slug: [page] })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = await pageLocale(segment);
  if (!locale || slug.length !== 1 || !isSupportedPage(slug[0])) return {};

  const copy = staticPagesCopy(locale);
  const title = copy.titles[slug[0]];
  const canonicalPage =
    slug[0] === "delete-account" ? "account-deletion" : slug[0];
  return {
    title,
    description: `${title}. ${copy.intro}`,
    alternates: { canonical: localizedPath(locale, `/${canonicalPage}`) },
  };
}

export default async function LocalizedStaticPage({ params }: Props) {
  const { locale: segment, slug } = await params;
  const locale = await pageLocale(segment);
  if (!locale || slug.length !== 1 || !isSupportedPage(slug[0])) notFound();

  const dictionary = getDictionary(locale);
  const copy = staticPagesCopy(locale);
  const page = slug[0];
  const title = copy.titles[page];
  const direction = textDirection(locale);
  const lang = languageTag(locale);

  if (page === "trust-safety") {
    return (
      <div
        lang={lang}
        dir={direction}
        className="min-w-0 overflow-x-clip [&_*]:min-w-0"
      >
        <Header locale={locale} dictionary={dictionary} />
        <main className="py-[clamp(32px,5vw,64px)]">
          <TrustSafety dictionary={dictionary} headingLevel="h1" />
        </main>
        <Footer locale={locale} dictionary={dictionary} />
      </div>
    );
  }

  return (
    <div
      lang={lang}
      dir={direction}
      className="min-w-0 overflow-x-clip [&_*]:min-w-0"
    >
      <Header locale={locale} dictionary={dictionary} />
      <main className="mx-auto max-w-[860px] px-6 py-[clamp(48px,6vw,86px)]">
        <h1 className="font-head text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-ink">
          {title}
        </h1>
        <p className="mt-4 text-[18px] leading-[1.6] text-ink-soft">
          {copy.intro}
        </p>
        <section className="mt-8 rounded-card-md border border-line bg-surface p-6 shadow-card-sm">
          <h2 className="font-head text-[22px] font-extrabold text-ink">
            SwapSpot
          </h2>
          <p className="mt-3 text-[15.5px] leading-[1.65] text-ink-soft">
            {dictionary.footer.tagline}
          </p>
          <p className="mt-3 text-[15.5px] leading-[1.65] text-ink-soft">
            {dictionary.footer.companyLine}
          </p>
          <a
            href="mailto:hello@swapspot.org"
            className="mt-5 inline-flex rounded-full bg-green px-5 py-3 text-[15px] font-extrabold text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-green-deep"
          >
            hello@swapspot.org
          </a>
        </section>
      </main>
      <Footer locale={locale} dictionary={dictionary} />
    </div>
  );
}
