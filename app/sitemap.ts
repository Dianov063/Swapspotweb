import type { MetadataRoute } from "next";
import { categories, cities } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { getDirectoryPairs, getPublicHelperProfiles } from "@/lib/publicDirectory";

const base = "https://www.swapspot.org";
const localizedStaticPaths = [
  "/helpers",
  "/trust-safety",
  "/contact",
  "/support",
  "/account-deletion",
  "/privacy",
  "/terms",
];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/services",
    "/helpers",
    "/trust-safety",
    "/blog",
    "/contact",
    "/support",
    "/account-deletion",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const cityRoutes = cities.map((city) => ({
    url: `${base}/cities/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const directoryPairs = await getDirectoryPairs();
  const helperProfiles = await getPublicHelperProfiles({ limit: 1000 });

  const serviceMarketRoutes = directoryPairs.map((pair) => ({
      url: `${base}/services/${pair.categorySlug}/${pair.marketSlug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.72,
  }));

  const helperProfileRoutes = helperProfiles.slice(0, 500).map((profile) => ({
    url: `${base}/helpers/${profile.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.62,
  }));

  const localeRoutes = locales
    .filter((locale) => locale !== "en")
    .map((locale) => ({
      url: `${base}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  const localizedStaticRoutes = locales
    .filter((locale) => locale !== "en")
    .flatMap((locale) =>
      localizedStaticPaths.map((path) => ({
        url: `${base}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.55,
      })),
    );

  return [
    ...staticRoutes,
    ...localeRoutes,
    ...localizedStaticRoutes,
    ...categoryRoutes,
    ...cityRoutes,
    ...serviceMarketRoutes,
    ...helperProfileRoutes,
  ];
}
