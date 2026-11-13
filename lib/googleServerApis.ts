import { createSign } from "crypto";
import { hasAdminSession } from "@/lib/adminSession";

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

type AnalyticsRow = Record<string, string | number>;

function asNumber(row: AnalyticsRow, key: string) {
  return Number(row[key] || 0);
}

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

async function getAccessToken(scope: string, signal?: AbortSignal) {
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
    signal,
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

  if (!hasAdminSession(request)) {
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

function ga4ReportRequest({
  dimensions,
  metrics,
  rowLimit = 25,
  orderByMetric,
  dateRanges = [{ startDate: "30daysAgo", endDate: "today" }],
}: {
  dimensions: string[];
  metrics: string[];
  rowLimit?: number;
  orderByMetric?: string;
  dateRanges?: { startDate: string; endDate: string }[];
}) {
  return {
    dateRanges,
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    orderBys: orderByMetric
      ? [{ metric: { metricName: orderByMetric }, desc: true }]
      : dimensions.includes("date")
        ? [{ dimension: { dimensionName: "date" } }]
        : undefined,
    limit: `${rowLimit}`,
  };
}

async function runGa4Report(options: Parameters<typeof ga4ReportRequest>[0]) {
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
      body: JSON.stringify(ga4ReportRequest(options)),
      cache: "no-store",
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "GA4 report request failed");
  }

  return data;
}

async function runGa4Batch(requests: ReturnType<typeof ga4ReportRequest>[], token: string, signal: AbortSignal) {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) throw new Error("Missing GA4_PROPERTY_ID");
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests }),
      cache: "no-store",
      signal,
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "GA4 batch request failed");
  if (!Array.isArray(data?.reports) || data.reports.length !== requests.length) {
    throw new Error("GA4 returned an incomplete batch");
  }
  return data.reports as { rows?: Ga4Row[] }[];
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
  startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
  endDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
}: {
  dimensions: string[];
  rowLimit?: number;
  startDate?: string;
  endDate?: string;
}, signal?: AbortSignal, token?: string) {
  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;

  if (!siteUrl) {
    throw new Error("Missing SEARCH_CONSOLE_SITE_URL");
  }

  const accessToken = token ?? await getAccessToken(SEARCH_CONSOLE_SCOPE, signal);
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit,
        startRow: 0,
      }),
      cache: "no-store",
      signal,
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Search Console report request failed");
  }

  return data as { rows?: SearchConsoleRow[] };
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

function buildSeoInsights({
  ga4,
  searchConsole,
}: {
  ga4: {
    byCountry: AnalyticsRow[];
    byCity: AnalyticsRow[];
    byPage: AnalyticsRow[];
    byDevice: AnalyticsRow[];
    byLanguage: AnalyticsRow[];
  };
  searchConsole: {
    queries: AnalyticsRow[];
    pages: AnalyticsRow[];
    countries: AnalyticsRow[];
    devices: AnalyticsRow[];
  };
}) {
  const quickWins = searchConsole.queries
    .filter((row) => asNumber(row, "impressions") >= 20 && asNumber(row, "position") > 4 && asNumber(row, "position") <= 20)
    .slice(0, 12)
    .map((row) => ({
      title: String(row.query || "Unknown query"),
      metric: `${asNumber(row, "impressions").toLocaleString("en-US")} impressions, avg position ${asNumber(row, "position").toFixed(1)}`,
      action: "Create or improve a focused landing page and tighten title/H1 around this query.",
    }));

  const lowCtrPages = searchConsole.pages
    .filter((row) => asNumber(row, "impressions") >= 20 && asNumber(row, "ctr") < 0.02)
    .slice(0, 10)
    .map((row) => ({
      title: String(row.page || "Unknown page"),
      metric: `${asNumber(row, "impressions").toLocaleString("en-US")} impressions, ${(asNumber(row, "ctr") * 100).toFixed(2)}% CTR`,
      action: "Rewrite title/meta description and make the first screen match the search intent.",
    }));

  const marketSignals = ga4.byCountry
    .filter((row) => asNumber(row, "activeUsers") > 0)
    .slice(0, 12)
    .map((row) => {
      const country = String(row.country || "Unknown");
      const searchCountry = searchConsole.countries.find((item) => String(item.country || "").toLowerCase() === country.toLowerCase());
      return {
        title: country,
        metric: `${asNumber(row, "activeUsers").toLocaleString("en-US")} users${searchCountry ? `, ${asNumber(searchCountry, "impressions").toLocaleString("en-US")} search impressions` : ""}`,
        action: "Track signups/helpers by country before spending on paid traffic.",
      };
    });

  const contentIdeas = searchConsole.queries
    .filter((row) => asNumber(row, "impressions") >= 10)
    .slice(0, 16)
    .map((row) => ({
      title: String(row.query || "Unknown query"),
      metric: `${asNumber(row, "clicks").toLocaleString("en-US")} clicks / ${asNumber(row, "impressions").toLocaleString("en-US")} impressions`,
      action: "Use this phrase in a city/category page, FAQ, or app store keyword test.",
    }));

  const deviceMix = ga4.byDevice.map((row) => ({
    title: String(row.deviceCategory || "Unknown"),
    metric: `${asNumber(row, "activeUsers").toLocaleString("en-US")} users`,
    action: "Use this to prioritize mobile landing QA versus desktop SEO pages.",
  }));

  const languageSignals = ga4.byLanguage
    .filter((row) => asNumber(row, "activeUsers") > 0)
    .slice(0, 10)
    .map((row) => ({
      title: String(row.language || "Unknown"),
      metric: `${asNumber(row, "activeUsers").toLocaleString("en-US")} users`,
      action: "If this language repeats, add localized landing copy and app store metadata.",
    }));

  return {
    quickWins,
    lowCtrPages,
    marketSignals,
    contentIdeas,
    deviceMix,
    languageSignals,
    summary: [
      quickWins.length ? `${quickWins.length} query opportunities with position 5-20` : "No query quick wins above threshold yet",
      lowCtrPages.length ? `${lowCtrPages.length} pages with low CTR` : "No low-CTR pages above threshold yet",
      marketSignals.length ? `${marketSignals.length} country signals available` : "No country signal yet",
    ],
  };
}

export async function fetchSearchConsoleReport() {
  return runSearchConsoleReport({ dimensions: ["query"], rowLimit: 25 });
}

function shiftReportDate(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function fetchDailyGoogleReport({
  analyticsDate,
  searchStartDate,
  searchEndDate,
}: {
  analyticsDate: string;
  searchStartDate: string;
  searchEndDate: string;
}, signal?: AbortSignal) {
  const tokenTimeout = AbortSignal.timeout(7_000);
  const tokenSignal = signal ? AbortSignal.any([signal, tokenTimeout]) : tokenTimeout;
  const token = await getAccessToken(`${GA4_SCOPE} ${SEARCH_CONSOLE_SCOPE}`, tokenSignal);
  const warnings: string[] = [];
  async function readSection<T>(name: string, request: (querySignal: AbortSignal) => Promise<{ rows?: T[] }>) {
    const timeout = AbortSignal.timeout(18_000);
    try {
      return await request(signal ? AbortSignal.any([signal, timeout]) : timeout);
    } catch (error) {
      warnings.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
      return { rows: [] as T[] };
    }
  }
  const gaMetrics = ["activeUsers", "sessions", "screenPageViews", "engagedSessions"];
  const dateRanges = [{ startDate: analyticsDate, endDate: analyticsDate }];
  const previousAnalyticsDate = shiftReportDate(analyticsDate, -1);
  const previousDateRanges = [{ startDate: previousAnalyticsDate, endDate: previousAnalyticsDate }];
  const searchDates = { startDate: searchStartDate, endDate: searchEndDate };
  const searchWindowDays = Math.max(
    1,
    Math.round(
      (new Date(`${searchEndDate}T12:00:00Z`).getTime() - new Date(`${searchStartDate}T12:00:00Z`).getTime()) /
        (24 * 60 * 60 * 1000),
    ) + 1,
  );
  const previousSearchEndDate = shiftReportDate(searchStartDate, -1);
  const previousSearchStartDate = shiftReportDate(previousSearchEndDate, -(searchWindowDays - 1));
  const [gaSummary, gaBreakdowns, searchQueries, searchPages, searchCountries, searchByDate, searchPreviousByDate] = await Promise.all([
    readSection("GA4 totals", async (querySignal) => ({ rows: await runGa4Batch([
      ga4ReportRequest({ dimensions: [], metrics: gaMetrics, rowLimit: 1, dateRanges }),
      ga4ReportRequest({ dimensions: [], metrics: gaMetrics, rowLimit: 1, dateRanges: previousDateRanges }),
    ], token, querySignal) })),
    readSection("GA4 breakdowns", async (querySignal) => ({ rows: await runGa4Batch([
      ga4ReportRequest({ dimensions: ["country", "city"], metrics: gaMetrics, rowLimit: 50, orderByMetric: "activeUsers", dateRanges }),
      ga4ReportRequest({ dimensions: ["sessionSourceMedium"], metrics: gaMetrics, rowLimit: 25, orderByMetric: "sessions", dateRanges }),
      ga4ReportRequest({ dimensions: ["pagePath"], metrics: gaMetrics, rowLimit: 25, orderByMetric: "screenPageViews", dateRanges }),
      ga4ReportRequest({ dimensions: ["deviceCategory"], metrics: gaMetrics, rowLimit: 10, orderByMetric: "activeUsers", dateRanges }),
      ga4ReportRequest({ dimensions: ["language"], metrics: ["activeUsers", "sessions"], rowLimit: 15, orderByMetric: "activeUsers", dateRanges }),
    ], token, querySignal) })),
    readSection("Search Console queries", (querySignal) => runSearchConsoleReport({ dimensions: ["query"], rowLimit: 50, ...searchDates }, querySignal, token)),
    readSection("Search Console pages", (querySignal) => runSearchConsoleReport({ dimensions: ["page"], rowLimit: 50, ...searchDates }, querySignal, token)),
    readSection("Search Console countries", (querySignal) => runSearchConsoleReport({ dimensions: ["country"], rowLimit: 50, ...searchDates }, querySignal, token)),
    readSection("Search Console totals", (querySignal) => runSearchConsoleReport({ dimensions: ["date"], rowLimit: 30, ...searchDates }, querySignal, token)),
    readSection("Search Console previous totals", (querySignal) => runSearchConsoleReport({
      dimensions: ["date"],
      rowLimit: 30,
      startDate: previousSearchStartDate,
      endDate: previousSearchEndDate,
    }, querySignal, token)),
  ]);

  const [gaTotals = {}, gaPreviousTotals = {}] = gaSummary.rows ?? [];
  const [gaLocations = {}, gaSources = {}, gaPages = {}, gaDevices = {}, gaLanguages = {}] = gaBreakdowns.rows ?? [];
  return {
    analyticsDate,
    warnings: warnings.sort(),
    searchStartDate,
    searchEndDate,
    ga4: {
      totals: normalizeGa4Rows(gaTotals, [], gaMetrics)[0] || {},
      previousDate: previousAnalyticsDate,
      previousTotals: normalizeGa4Rows(gaPreviousTotals, [], gaMetrics)[0] || {},
      locations: normalizeGa4Rows(gaLocations, ["country", "city"], gaMetrics),
      sources: normalizeGa4Rows(gaSources, ["sessionSourceMedium"], gaMetrics),
      pages: normalizeGa4Rows(gaPages, ["pagePath"], gaMetrics),
      devices: normalizeGa4Rows(gaDevices, ["deviceCategory"], gaMetrics),
      languages: normalizeGa4Rows(gaLanguages, ["language"], ["activeUsers", "sessions"]),
    },
    searchConsole: {
      queries: normalizeSearchRows(searchQueries, ["query"]),
      pages: normalizeSearchRows(searchPages, ["page"]),
      countries: normalizeSearchRows(searchCountries, ["country"]),
      byDate: normalizeSearchRows(searchByDate, ["date"]),
      previousStartDate: previousSearchStartDate,
      previousEndDate: previousSearchEndDate,
      previousByDate: normalizeSearchRows(searchPreviousByDate, ["date"]),
    },
  };
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

  const ga4 = {
    totals: normalizeGa4Rows(gaTotals, [], gaMetrics)[0] || {},
    byDate: normalizeGa4Rows(gaByDate, ["date"], gaMetrics),
    byCountry: normalizeGa4Rows(gaByCountry, ["country"], gaMetrics),
    byCity: normalizeGa4Rows(gaByCity, ["city"], gaMetrics),
    bySource: normalizeGa4Rows(gaBySource, ["sessionSourceMedium"], gaMetrics),
    byPage: normalizeGa4Rows(gaByPage, ["pagePath"], gaMetrics),
    byDevice: normalizeGa4Rows(gaByDevice, ["deviceCategory"], gaMetrics),
    byLanguage: normalizeGa4Rows(gaByLanguage, ["language"], gaMetrics),
  };
  const searchConsole = {
    queries: normalizeSearchRows(searchQueries, ["query"]),
    pages: normalizeSearchRows(searchPages, ["page"]),
    countries: normalizeSearchRows(searchCountries, ["country"]),
    devices: normalizeSearchRows(searchDevices, ["device"]),
    byDate: normalizeSearchRows(searchDates, ["date"]),
  };

  return {
    range: {
      ga4: "last 30 days",
      searchConsole: "last 30 days, ending 2 days ago",
    },
    ga4,
    searchConsole,
    insights: buildSeoInsights({ ga4, searchConsole }),
  };
}
