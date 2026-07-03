import type { MetadataRoute } from "next";
import { categories, cities } from "@/lib/data";
import { locales } from "@/lib/i18n";

const base = "https://www.swapspot.org";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const localeRoutes = locales
    .filter((locale) => locale !== "en")
    .map((locale) => ({
      url: `${base}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  return [...staticRoutes, ...localeRoutes, ...categoryRoutes, ...cityRoutes];
}
