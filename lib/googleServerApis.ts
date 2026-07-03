import { createSign } from "crypto";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleEnv = {
  clientEmail: string;
  privateKey: string;
};

type Ga4Cell = { value?: string };
type Ga4Row = { dimensionValues?: Ga4Cell[]; metricValues?: Ga4Cell[] };
type SearchConsoleRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

function getGoogleEnv(): GoogleEnv {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY");
  }

  return { clientEmail, privateKey };
}

function base64Url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(scope: string) {
  const { clientEmail, privateKey } = getGoogleEnv();
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: clientEmail,
      scope,
      aud: GOOGLE_TOKEN_URL,
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsignedJwt = `${header}.${claim}`;
  const signature = createSign("RSA-SHA256").update(unsignedJwt).sign(privateKey, "base64");
  const jwt = `${unsignedJwt}.${signature
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    cache: "no-store",
  });
  const data = (await response.json()) as TokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Google token request failed");
  }

  return data.access_token;
}

export function requireAnalyticsAccess(request: Request) {
  const secret = process.env.ANALYTICS_API_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Analytics access is not configured");
    }
    return;
  }

  const auth = request.headers.get("authorization");
  const token = request.headers.get("x-analytics-token");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length) : undefined;

  if (bearer !== secret && token !== secret) {
    throw new Error("Unauthorized");
  }
}

export async function fetchGa4Report() {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    throw new Error("Missing GA4_PROPERTY_ID");
  }

  const accessToken = await getAccessToken(GA4_SCOPE);
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "engagedSessions" },
        ],
        dimensions: [{ name: "date" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      cache: "no-store",
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "GA4 report request failed");
  }

  return data;
}

async function runGa4Report({
  dimensions,
  metrics,
  rowLimit = 25,
  orderByMetric,
}: {
  dimensions: string[];
  metrics: string[];
  rowLimit?: number;
  orderByMetric?: string;
}) {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    throw new Error("Missing GA4_PROPERTY_ID");
  }

  const accessToken = await getAccessToken(GA4_SCOPE);
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: dimensions.map((name) => ({ name })),
        metrics: metrics.map((name) => ({ name })),
        orderBys: orderByMetric
          ? [{ metric: { metricName: orderByMetric }, desc: true }]
          : dimensions.includes("date")
            ? [{ dimension: { dimensionName: "date" } }]
            : undefined,
        limit: `${rowLimit}`,
      }),
      cache: "no-store",
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "GA4 report request failed");
  }

  return data;
}

function normalizeGa4Rows(data: { rows?: Ga4Row[] }, dimensions: string[], metrics: string[]) {
  return (data.rows || []).map((row) => {
    const normalized: Record<string, string | number> = {};

    dimensions.forEach((dimension, index) => {
      normalized[dimension] = row.dimensionValues?.[index]?.value || "";
    });
    metrics.forEach((metric, index) => {
      normalized[metric] = Number(row.metricValues?.[index]?.value || 0);
    });

    return normalized;
  });
}

async function runSearchConsoleReport({
  dimensions,
  rowLimit = 25,
}: {
  dimensions: string[];
  rowLimit?: number;
}) {
  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;

  if (!siteUrl) {
    throw new Error("Missing SEARCH_CONSOLE_SITE_URL");
  }

  const accessToken = await getAccessToken(SEARCH_CONSOLE_SCOPE);
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
        endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
        dimensions,
        rowLimit,
        startRow: 0,
      }),
      cache: "no-store",
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Search Console report request failed");
  }

  return data;
}

function normalizeSearchRows(data: { rows?: SearchConsoleRow[] }, dimensions: string[]) {
  return (data.rows || []).map((row) => {
    const normalized: Record<string, string | number> = {};

    dimensions.forEach((dimension, index) => {
      normalized[dimension] = row.keys?.[index] || "";
    });

    normalized.clicks = row.clicks || 0;
    normalized.impressions = row.impressions || 0;
    normalized.ctr = row.ctr || 0;
    normalized.position = row.position || 0;

    return normalized;
  });
}

export async function fetchSearchConsoleReport() {
  return runSearchConsoleReport({ dimensions: ["query"], rowLimit: 25 });
}

export async function fetchAnalyticsOverview() {
  const gaMetrics = ["activeUsers", "sessions", "screenPageViews", "engagedSessions"];
  const [
    gaTotals,
    gaByDate,
    gaByCountry,
    gaByCity,
    gaBySource,
    gaByPage,
    gaByDevice,
    gaByLanguage,
    searchQueries,
    searchPages,
    searchCountries,
    searchDevices,
    searchDates,
  ] = await Promise.all([
    runGa4Report({ dimensions: [], metrics: gaMetrics, rowLimit: 1 }),
    runGa4Report({ dimensions: ["date"], metrics: gaMetrics, rowLimit: 60 }),
    runGa4Report({ dimensions: ["country"], metrics: gaMetrics, rowLimit: 50, orderByMetric: "activeUsers" }),
    runGa4Report({ dimensions: ["city"], metrics: gaMetrics, rowLimit: 50, orderByMetric: "activeUsers" }),
    runGa4Report({
      dimensions: ["sessionSourceMedium"],
      metrics: gaMetrics,
      rowLimit: 50,
      orderByMetric: "sessions",
    }),
    runGa4Report({
      dimensions: ["pagePath"],
      metrics: gaMetrics,
      rowLimit: 50,
      orderByMetric: "screenPageViews",
    }),
    runGa4Report({
      dimensions: ["deviceCategory"],
      metrics: gaMetrics,
      rowLimit: 20,
      orderByMetric: "activeUsers",
    }),
    runGa4Report({
      dimensions: ["language"],
      metrics: gaMetrics,
      rowLimit: 30,
      orderByMetric: "activeUsers",
    }),
    runSearchConsoleReport({ dimensions: ["query"], rowLimit: 100 }),
    runSearchConsoleReport({ dimensions: ["page"], rowLimit: 100 }),
    runSearchConsoleReport({ dimensions: ["country"], rowLimit: 100 }),
    runSearchConsoleReport({ dimensions: ["device"], rowLimit: 20 }),
    runSearchConsoleReport({ dimensions: ["date"], rowLimit: 60 }),
  ]);

  return {
    range: {
      ga4: "last 30 days",
      searchConsole: "last 30 days, ending 2 days ago",
    },
    ga4: {
      totals: normalizeGa4Rows(gaTotals, [], gaMetrics)[0] || {},
      byDate: normalizeGa4Rows(gaByDate, ["date"], gaMetrics),
      byCountry: normalizeGa4Rows(gaByCountry, ["country"], gaMetrics),
      byCity: normalizeGa4Rows(gaByCity, ["city"], gaMetrics),
      bySource: normalizeGa4Rows(gaBySource, ["sessionSourceMedium"], gaMetrics),
      byPage: normalizeGa4Rows(gaByPage, ["pagePath"], gaMetrics),
      byDevice: normalizeGa4Rows(gaByDevice, ["deviceCategory"], gaMetrics),
      byLanguage: normalizeGa4Rows(gaByLanguage, ["language"], gaMetrics),
    },
    searchConsole: {
      queries: normalizeSearchRows(searchQueries, ["query"]),
      pages: normalizeSearchRows(searchPages, ["page"]),
      countries: normalizeSearchRows(searchCountries, ["country"]),
      devices: normalizeSearchRows(searchDevices, ["device"]),
      byDate: normalizeSearchRows(searchDates, ["date"]),
    },
  };
}
