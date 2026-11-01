// Client pass prices the website may show as a reference (contract §4.2/§4.3).
//
// Only regions whose price is confirmed AND identical in both stores are listed. Confirmed on
// 2026-10-19 from the Google Play Developer API and the App Store Connect API (read-only).
// Other regions differ between the stores (e.g. TH: Google Play 175/900 THB vs App Store
// 199/999 THB), so they are intentionally not listed and the site shows "See the current price
// in the App Store or Google Play" there. The old site showed "$5"/"$25" for the US, which was not
// the exact store price.
//
// To add a region: confirm the same price in both stores first, then add it here (key = ISO
// country code, the visitor's market must also be `active` in the registry).

export type StorePrice = { amount: number; currency: string };

export type ConfirmedPassPrices = { dayPass?: StorePrice; monthlyPass?: StorePrice };

export const CONFIRMED_PASS_PRICES: Record<string, ConfirmedPassPrices> = {
  US: {
    dayPass: { amount: 4.99, currency: "USD" },
    monthlyPass: { amount: 24.99, currency: "USD" },
  },
  IN: {
    dayPass: { amount: 99, currency: "INR" },
    monthlyPass: { amount: 399, currency: "INR" },
  },
};

/**
 * Reference pass prices for a visitor's country: only when the country is an `active` market and
 * its price is confirmed in both stores; otherwise null (the site shows the neutral store text).
 */
export function referencePassPrices(
  countryCode: string | null | undefined,
  marketIsActive: boolean,
  confirmed: Record<string, ConfirmedPassPrices> = CONFIRMED_PASS_PRICES,
): ConfirmedPassPrices | null {
  const code = String(countryCode ?? "").trim().toUpperCase();
  if (!marketIsActive || !/^[A-Z]{2}$/.test(code)) return null;
  const prices = confirmed[code];
  return prices && (prices.dayPass || prices.monthlyPass) ? prices : null;
}
