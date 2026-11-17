import { cache } from "react";
import { supabaseAdminFetch, swapspotBackend } from "@/lib/supabaseAdmin";
import { categories as fallbackCategories, cities as fallbackCities } from "@/lib/data";
import { directoryStrings, fillTemplate } from "@/lib/directoryStrings";
import type { Locale } from "@/lib/locales";
import { formatRadius, formatServicePrice as formatListingPrice } from "@/lib/priceFormat";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://hoohhuqgyaifjglfzanx.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

export type PublicServiceListing = {
  service_id: string;
  helper_id: string;
  category_id: string | null;
  category_name: string;
  category_slug: string;
  service_name: string;
  service_description: string | null;
  search_title_en: string | null;
  search_keywords: string | null;
  price: string | number | null;
  price_type: "fixed" | "hourly" | "starting_at" | string | null;
  currency_code: string | null;
  helper_display_name: string | null;
  avatar_url: string | null;
  helper_bio: string | null;
  service_area_zip: string | null;
  service_area_label: string | null;
  service_area_slug: string | null;
  country_code: string | null;
  radius_miles: string | number | null;
  distance_unit: "mi" | "km" | string | null;
  languages: string[] | null;
  rating_avg: string | number | null;
  rating_count: string | number | null;
  jobs_completed: string | number | null;
  market_slug: string;
  market_name: string;
  created_at: string;
};

export type DirectoryCategory = {
  slug: string;
  name: string;
};

export type DirectoryMarket = {
  slug: string;
  name: string;
};

export type DirectoryPair = {
  categorySlug: string;
  categoryName: string;
  marketSlug: string;
  marketName: string;
  countryCode: string | null;
  listingCount: number;
  sourceMarketSlugs: string[];
};

export type PublicHelperProfile = {
  helperId: string;
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  languages: string[];
  ratingAvg: number;
  ratingCount: number;
  jobsCompleted: number;
  listings: PublicServiceListing[];
  categories: DirectoryCategory[];
  markets: DirectoryMarket[];
  countryCodes: string[];
};

const categoryAliases: Record<string, string> = {
  handyman: "home-repair-and-maintenance",
  plumbing: "home-repair-and-maintenance",
  electrical: "home-repair-and-maintenance",
  "lawn-garden": "lawn-and-outdoor",
  moving: "moving-and-delivery",
  "pet-care": "pet-services",
  "senior-care": "care-and-assistance",
  tutoring: "tutoring-and-lessons",
  "nails-beauty": "beauty-and-wellness",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function supabaseHeaders() {
  if (!SUPABASE_KEY) return null;

  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };
}

const directoryRevalidateSeconds = 300;

async function fetchRest<T>(path: string, required = false): Promise<T[]> {
  let response: Response;
  if (swapspotBackend() === "appplatform") {
    // Same PostgREST path through the App Platform backend credential.
    try {
      response = await supabaseAdminFetch(path, { next: { revalidate: directoryRevalidateSeconds } });
    } catch (error) {
      if (required) throw error;
      console.error("SwapSpot public directory is not configured", error);
      return [];
    }
  } else {
    const headers = supabaseHeaders();
    if (!headers) {
      if (required) throw new Error("SwapSpot public directory is not configured");
      return [];
    }
    response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`, {
      headers,
      next: { revalidate: directoryRevalidateSeconds },
    });
  }

  if (!response.ok) {
    if (required) throw new Error(`SwapSpot public directory returned HTTP ${response.status}`);
    console.error("SwapSpot public directory fetch failed", await response.text());
    return [];
  }

  return (await response.json()) as T[];
}

const directoryPageSize = 500;

async function readPublicListingPages<T>(query: URLSearchParams, required = false): Promise<T[]> {
  query.set("order", "helper_id.asc,service_id.asc,service_area_id.asc");
  query.set("limit", String(directoryPageSize));
  const rows: T[] = [];
  for (let offset = 0; ; ) {
    query.set("offset", String(offset));
    const page = await fetchRest<T>(`public_service_listings?${query}`, required);
    if (page.length === 0) return rows;
    rows.push(...page);
    offset += page.length;
  }
}

export async function getDirectoryCategories(): Promise<DirectoryCategory[]> {
  const rows = await fetchRest<{ category_name: string; category_slug: string }>(
    "public_service_listings?select=category_name,category_slug&order=category_name.asc",
  );
  const bySlug = new Map<string, DirectoryCategory>();

  for (const row of rows) {
    if (row.category_slug && row.category_name) {
      bySlug.set(row.category_slug, { slug: row.category_slug, name: row.category_name });
    }
  }

  if (bySlug.size) return [...bySlug.values()];

  return fallbackCategories.map((category) => ({
    slug: slugify(category.name),
    name: category.name,
  }));
}

export async function getDirectoryMarkets(): Promise<DirectoryMarket[]> {
  const rows = await fetchRest<{ market_name: string; market_slug: string }>(
    "public_service_listings?select=market_name,market_slug&order=market_name.asc",
  );
  const bySlug = new Map<string, DirectoryMarket>();

  for (const row of rows) {
    if (row.market_slug && row.market_name) {
      bySlug.set(row.market_slug, { slug: row.market_slug, name: row.market_name });
    }
  }

  if (bySlug.size) return [...bySlug.values()];
  return fallbackCities.map((city) => ({ slug: city.slug, name: city.name }));
}

type DirectoryListing = Pick<
  PublicServiceListing,
  "helper_id" | "helper_display_name" | "category_name" | "category_slug" | "market_name" | "market_slug" | "country_code"
>;

function readDirectoryListings(required = false, categorySlug?: string) {
  const query = new URLSearchParams({
    select: "helper_id,helper_display_name,category_name,category_slug,market_name,market_slug,country_code",
  });
  if (categorySlug) query.set("category_slug", `eq.${categorySlug}`);
  return readPublicListingPages<DirectoryListing>(query, required);
}

function buildRawDirectoryPairs(rows: DirectoryListing[]): DirectoryPair[] {
  const byKey = new Map<string, DirectoryPair>();

  for (const row of rows) {
    if (!row.category_slug || !row.market_slug) continue;
    const key = `${row.category_slug}:${row.market_slug}`;
    const existing = byKey.get(key);

    if (existing) {
      existing.listingCount += 1;
    } else {
      byKey.set(key, {
        categorySlug: row.category_slug,
        categoryName: row.category_name,
        marketSlug: row.market_slug,
        marketName: row.market_name,
        countryCode: row.country_code,
        listingCount: 1,
        sourceMarketSlugs: [row.market_slug],
      });
    }
  }

  return [...byKey.values()].sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName) || a.marketName.localeCompare(b.marketName),
  );
}

function directoryPairGroupKey(pair: DirectoryPair) {
  return [
    pair.categorySlug,
    pair.marketName.trim().toLocaleLowerCase("en-US"),
  ].join(":");
}

function preferredDirectoryPair(pairs: DirectoryPair[]) {
  return [...pairs].sort((left, right) =>
    left.marketSlug.length - right.marketSlug.length ||
    left.marketSlug.localeCompare(right.marketSlug),
  )[0];
}

function mergeDirectoryPairGroup(pairs: DirectoryPair[]): DirectoryPair {
  const preferred = preferredDirectoryPair(pairs);
  return {
    ...preferred,
    listingCount: pairs.reduce((total, pair) => total + pair.listingCount, 0),
    sourceMarketSlugs: [...new Set(pairs.map((pair) => pair.marketSlug))],
  };
}

function mergeDirectoryPairs(pairs: DirectoryPair[]): DirectoryPair[] {
  const grouped = new Map<string, DirectoryPair[]>();
  for (const pair of pairs) {
    const key = directoryPairGroupKey(pair);
    grouped.set(key, [...(grouped.get(key) || []), pair]);
  }
  return [...grouped.values()].map(mergeDirectoryPairGroup);
}

export async function getDirectoryPairs(): Promise<DirectoryPair[]> {
  return mergeDirectoryPairs(buildRawDirectoryPairs(await readDirectoryListings()));
}

export const getDirectoryPair = cache(async (categorySlug: string, marketSlug: string) => {
  const canonicalCategorySlug = categoryAliases[categorySlug] || categorySlug;
  const pairs = buildRawDirectoryPairs(await readDirectoryListings(true, canonicalCategorySlug));
  const requested = pairs.find(
    (pair) => pair.categorySlug === canonicalCategorySlug && pair.marketSlug === marketSlug,
  );
  if (!requested) return null;
  return mergeDirectoryPairGroup(
    pairs.filter((pair) => directoryPairGroupKey(pair) === directoryPairGroupKey(requested)),
  );
});

export async function getDirectoryCategory(slug: string) {
  const categories = await getDirectoryCategories();
  const canonicalSlug = categoryAliases[slug] || slug;
  return categories.find((category) => category.slug === canonicalSlug) || null;
}

export async function getDirectoryMarket(slug: string) {
  return (await getDirectoryMarkets()).find((market) => market.slug === slug) || null;
}

export async function getPublicServiceListings({
  categorySlug,
  marketSlug,
  marketSlugs,
  limit = 24,
}: {
  categorySlug?: string;
  marketSlug?: string;
  marketSlugs?: string[];
  limit?: number;
}) {
  const params = new URLSearchParams({
    select: "*",
    order: "rating_avg.desc,service_name.asc",
    limit: String(limit),
  });

  if (categorySlug) params.set("category_slug", `eq.${categorySlug}`);
  const uniqueMarketSlugs = [...new Set((marketSlugs || []).filter(Boolean))];
  if (uniqueMarketSlugs.length > 1) {
    params.set("market_slug", `in.(${uniqueMarketSlugs.join(",")})`);
  } else if (uniqueMarketSlugs.length === 1) {
    params.set("market_slug", `eq.${uniqueMarketSlugs[0]}`);
  } else if (marketSlug) {
    params.set("market_slug", `eq.${marketSlug}`);
  }

  return fetchRest<PublicServiceListing>(`public_service_listings?${params}`, true);
}

function sortListings(listings: PublicServiceListing[]) {
  return [...listings].sort((a, b) => {
    const marketCompare = (a.market_name || "").localeCompare(b.market_name || "");
    if (marketCompare) return marketCompare;

    const categoryCompare = (a.category_name || "").localeCompare(b.category_name || "");
    if (categoryCompare) return categoryCompare;

    return getServiceTitle(a).localeCompare(getServiceTitle(b));
  });
}

export function getHelperSlug(
  listingOrProfile: Pick<PublicServiceListing, "helper_id" | "helper_display_name"> | PublicHelperProfile,
) {
  const helperId =
    "helperId" in listingOrProfile ? listingOrProfile.helperId : listingOrProfile.helper_id;
  const helperName =
    "displayName" in listingOrProfile
      ? listingOrProfile.displayName
      : getHelperName(listingOrProfile);

  const idTail = helperId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toLowerCase();
  return `${slugify(helperName || "local-helper")}-${idTail}`;
}

export function buildPublicHelperProfile(
  helperId: string,
  listings: PublicServiceListing[],
): PublicHelperProfile | null {
  const helperListings = sortListings(listings.filter((listing) => listing.helper_id === helperId));
  const first = helperListings[0];
  if (!first) return null;

  const categories = new Map<string, DirectoryCategory>();
  const markets = new Map<string, DirectoryMarket>();
  const languages = new Set<string>();
  const countryCodes = new Set<string>();

  for (const listing of helperListings) {
    if (listing.category_slug && listing.category_name) {
      categories.set(listing.category_slug, {
        slug: listing.category_slug,
        name: listing.category_name,
      });
    }

    if (listing.market_slug && listing.market_name) {
      markets.set(listing.market_slug, {
        slug: listing.market_slug,
        name: listing.market_name,
      });
    }

    for (const language of getListingLanguages(listing)) languages.add(language);
    if (listing.country_code) countryCodes.add(listing.country_code);
  }

  const ratingAvg =
    helperListings.reduce((sum, listing) => sum + Number(listing.rating_avg || 0), 0) /
    helperListings.length;
  const ratingCount = helperListings.reduce(
    (sum, listing) => sum + Number(listing.rating_count || 0),
    0,
  );
  const jobsCompleted = Math.max(
    ...helperListings.map((listing) => Number(listing.jobs_completed || 0)),
    0,
  );

  const profile: PublicHelperProfile = {
    helperId,
    slug: "",
    displayName: getHelperName(first),
    avatarUrl: first.avatar_url,
    bio: first.helper_bio,
    languages: [...languages].sort((a, b) => a.localeCompare(b)),
    ratingAvg: Number.isFinite(ratingAvg) ? ratingAvg : 0,
    ratingCount,
    jobsCompleted,
    listings: helperListings,
    categories: [...categories.values()].sort((a, b) => a.name.localeCompare(b.name)),
    markets: [...markets.values()].sort((a, b) => a.name.localeCompare(b.name)),
    countryCodes: [...countryCodes.values()].sort((a, b) => a.localeCompare(b)),
  };

  profile.slug = getHelperSlug(profile);
  return profile;
}

async function getIndexableHelperIds(helperIds: string[]) {
  const indexable = new Set<string>();
  // Legacy demo accounts live alongside regular profiles. The separate discovery
  // seed catalog never enters public_service_listings.
  const testAccount = /(?:^|[+._-])(?:qa|test|demo|seed|review|smoke|e2e|staging)(?:[+._@-]|$)|@example\.(?:com|org|net)$/i;

  for (let start = 0; start < helperIds.length; start += 50) {
    const ids = helperIds.slice(start, start + 50);
    const helpers = await fetchRest<{ id: string; user_id: string }>(
      `helpers?select=id,user_id&id=in.(${ids.join(",")})&is_active=eq.true`,
      true,
    );
    if (!helpers.length) continue;
    const userIds = [...new Set(helpers.map(({ user_id }) => user_id))];
    const profiles = await fetchRest<{ id: string; email: string | null }>(
      `profiles?select=id,email&id=in.(${userIds.join(",")})`,
      true,
    );
    const eligibleUsers = new Set(
      profiles.filter(({ email }) => email?.trim() && !testAccount.test(email.trim())).map(({ id }) => id),
    );
    for (const { id, user_id } of helpers) {
      if (eligibleUsers.has(user_id)) indexable.add(id);
    }
  }

  return indexable;
}

export async function getSitemapDirectory() {
  const listings = await readDirectoryListings(true);
  const indexable = await getIndexableHelperIds([...new Set(listings.map(({ helper_id }) => helper_id))]);
  const included = listings.filter(({ helper_id }) => indexable.has(helper_id));
  const includedPairs = new Set(included.map((row) => `${row.category_slug}:${row.market_slug}`));
  const directoryPairs = mergeDirectoryPairs(buildRawDirectoryPairs(listings)).filter((pair) =>
    pair.sourceMarketSlugs.some((slug) => includedPairs.has(`${pair.categorySlug}:${slug}`)),
  );
  return {
    directoryPairs,
    helperSlugs: [...new Set(included.map(getHelperSlug))].sort(),
  };
}

export async function isPublicHelperIndexable(helperId: string) {
  return (await getIndexableHelperIds([helperId])).has(helperId);
}

export const getPublicHelperProfileBySlug = cache(async (helperSlug: string) => {
  // The canonical slug ends with the first ten hexadecimal digits of the helper UUID.
  const prefix = /-([0-9a-f]{8})([0-9a-f]{2})$/.exec(helperSlug);
  if (!prefix) return null;
  const uuidPrefix = `${prefix[1]}-${prefix[2]}`;
  const listings = await readPublicListingPages<PublicServiceListing>(new URLSearchParams({
    select: "*",
    and: `(helper_id.gte.${uuidPrefix}00-0000-0000-000000000000,helper_id.lte.${uuidPrefix}ff-ffff-ffff-ffffffffffff)`,
  }), true);
  const matching = listings.filter((listing) => getHelperSlug(listing) === helperSlug);
  return matching.length ? buildPublicHelperProfile(matching[0].helper_id, matching) : null;
});

/**
 * Price label in the page language with the listing's own currency ("Price on request" for
 * quote-only services). Never assumes USD; see lib/priceFormat.ts.
 */
export function formatServicePrice(listing: PublicServiceListing, locale: Locale = "en") {
  return formatListingPrice(listing, locale);
}

/** Approximate service area: label (or postal code, or market) plus the radius in the market unit. */
export function formatServiceArea(listing: PublicServiceListing, locale: Locale = "en") {
  const words = directoryStrings(locale);
  const country = (listing.country_code || "").toUpperCase();
  const postalTemplate = country === "US" || country === "PR" ? words.zipArea : words.postalArea;
  const area =
    listing.service_area_label ||
    (listing.service_area_zip ? fillTemplate(postalTemplate, { code: listing.service_area_zip }) : listing.market_name);
  const radius = Number(listing.radius_miles || 0);

  if (!radius) return area;
  return `${area} + ${formatRadius(radius, listing.distance_unit, locale)}`;
}

export function getListingLanguages(listing: PublicServiceListing) {
  if (!Array.isArray(listing.languages)) return [];

  return listing.languages
    .map((language) => String(language).trim())
    .filter(Boolean);
}

/**
 * Service title. English pages use the normalized English search title; other languages show the
 * helper's own title as entered (user content is never machine-translated).
 */
export function getServiceTitle(listing: PublicServiceListing, locale: Locale = "en") {
  if (locale === "en") return listing.search_title_en || listing.service_name;
  return listing.service_name || listing.search_title_en || "";
}

/** Helper name for slugs and English pages (stable, locale independent). */
export function getHelperName(listing: Pick<PublicServiceListing, "helper_display_name">) {
  return listing.helper_display_name || "Local helper";
}

/** Helper name for display: the name as entered, or a translated "Local helper". */
export function displayHelperName(name: string | null | undefined, locale: Locale = "en") {
  const value = name?.trim();
  return value && value !== "Local helper" ? value : directoryStrings(locale).localHelper;
}
