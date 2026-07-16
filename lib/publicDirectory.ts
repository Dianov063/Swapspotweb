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
  const zip = listing.service_area_zip ? `ZIP ${listing.service_area_zip}` : listing.market_name;

  if (!radius) return zip;
  return `${zip} + ${radius} ${unit}`;
}
