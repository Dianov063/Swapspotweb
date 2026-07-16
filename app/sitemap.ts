import type { MetadataRoute } from "next";
import { categories, cities } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { getDirectoryCategories, getDirectoryMarkets } from "@/lib/publicDirectory";

const base = "https://www.swapspot.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/helpers",
    "/trust-safety",
    "/blog",
    "/contact",
    "/support",
    "/account-deletion",
    "/delete-account",
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

  const [directoryCategories, directoryMarkets] = await Promise.all([
    getDirectoryCategories(),
    getDirectoryMarkets(),
  ]);

  const serviceMarketRoutes = directoryCategories.flatMap((category) =>
    directoryMarkets.map((market) => ({
      url: `${base}/services/${category.slug}/${market.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.72,
    })),
  );

  const localeRoutes = locales
    .filter((locale) => locale !== "en")
    .map((locale) => ({
      url: `${base}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  return [
    ...staticRoutes,
    ...localeRoutes,
    ...categoryRoutes,
    ...cityRoutes,
    ...serviceMarketRoutes,
  ];
}
