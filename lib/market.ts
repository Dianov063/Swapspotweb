export type PricingMarket = "US" | "IN";

export interface MarketPricing {
  market: PricingMarket;
  dayPass: string;
  monthlyPass: string;
}

export function pricingForCountry(countryCode?: string | null): MarketPricing {
  const country = String(countryCode ?? "US").trim().toUpperCase();
  if (country === "IN") {
    return {
      market: "IN",
      dayPass: "₹99/day",
      monthlyPass: "₹399/month",
    };
  }

  return {
    market: "US",
    dayPass: "$5/day",
    monthlyPass: "$25/month",
  };
}
