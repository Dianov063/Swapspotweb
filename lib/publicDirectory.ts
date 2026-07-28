import { categories as fallbackCategories, cities as fallbackCities } from "@/lib/data";

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

async function fetchRest<T>(path: string): Promise<T[]> {
  const headers = supabaseHeaders();
  if (!headers) return [];

  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`, {
    headers,
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    console.error("SwapSpot public directory fetch failed", await response.text());
    return [];
  }

  return (await response.json()) as T[];
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

export async function getDirectoryPairs(): Promise<DirectoryPair[]> {
  const rows = await fetchRest<{
    category_name: string;
    category_slug: string;
    market_name: string;
    market_slug: string;
    country_code: string | null;
  }>(
    "public_service_listings?select=category_name,category_slug,market_name,market_slug,country_code&order=category_name.asc,market_name.asc&limit=10000",
  );
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
      });
    }
  }

  return [...byKey.values()];
}

export async function getDirectoryPair(categorySlug: string, marketSlug: string) {
  const canonicalCategorySlug = categoryAliases[categorySlug] || categorySlug;
  const pairs = await getDirectoryPairs();

  return (
    pairs.find(
      (pair) =>
        pair.categorySlug === canonicalCategorySlug && pair.marketSlug === marketSlug,
    ) || null
  );
}

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
  limit = 24,
}: {
  categorySlug?: string;
  marketSlug?: string;
  limit?: number;
}) {
  const params = new URLSearchParams({
    select: "*",
    order: "rating_avg.desc,service_name.asc",
    limit: String(limit),
  });

  if (categorySlug) params.set("category_slug", `eq.${categorySlug}`);
  if (marketSlug) params.set("market_slug", `eq.${marketSlug}`);

  return fetchRest<PublicServiceListing>(`public_service_listings?${params}`);
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

export function getHelperSlug(listingOrProfile: PublicServiceListing | PublicHelperProfile) {
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

export async function getPublicHelperProfiles({ limit = 1000 }: { limit?: number } = {}) {
  const listings = await getPublicServiceListings({ limit });
  const helperIds = new Set(listings.map((listing) => listing.helper_id).filter(Boolean));
  const profiles: PublicHelperProfile[] = [];

  for (const helperId of helperIds) {
    const profile = buildPublicHelperProfile(helperId, listings);
    if (profile) profiles.push(profile);
  }

  return profiles.sort((a, b) => {
    const ratingCompare = b.ratingAvg - a.ratingAvg;
    if (ratingCompare) return ratingCompare;
    return a.displayName.localeCompare(b.displayName);
  });
}

export async function getPublicHelperProfileBySlug(helperSlug: string) {
  const profiles = await getPublicHelperProfiles();
  return profiles.find((profile) => profile.slug === helperSlug) || null;
}

export function formatServicePrice(listing: PublicServiceListing) {
  const amount = Number(listing.price || 0);
  if (!amount) return "Ask for quote";

  const currency = listing.currency_code || "USD";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);

  if (listing.price_type === "hourly") return `${formatted}/hr`;
  if (listing.price_type === "starting_at") return `From ${formatted}`;
  return formatted;
}

export function formatServiceArea(listing: PublicServiceListing) {
  const radius = Number(listing.radius_miles || 0);
  const unit = listing.distance_unit || "mi";
  const area = listing.service_area_label || (listing.service_area_zip ? `ZIP ${listing.service_area_zip}` : listing.market_name);

  if (!radius) return area;
  return `${area} + ${radius} ${unit}`;
}

export function getListingLanguages(listing: PublicServiceListing) {
  if (!Array.isArray(listing.languages)) return [];

  return listing.languages
    .map((language) => String(language).trim())
    .filter(Boolean);
}

export function getServiceTitle(listing: PublicServiceListing) {
  return listing.search_title_en || listing.service_name;
}

export function getHelperName(listing: PublicServiceListing) {
  return listing.helper_display_name || "Local helper";
}
