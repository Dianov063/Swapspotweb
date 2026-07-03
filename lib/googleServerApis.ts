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

export async function fetchSearchConsoleReport() {
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
        dimensions: ["query"],
        rowLimit: 25,
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
