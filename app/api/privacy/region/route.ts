import { NextRequest, NextResponse } from "next/server";

const consentCountries = new Set([
  "AT",
  "BE",
  "BG",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GB",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
]);

export function GET(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase() ?? null;

  return NextResponse.json(
    {
      country,
      // When location is unavailable, use the privacy-first behavior.
      requiresConsent: country ? consentCountries.has(country) : true,
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
