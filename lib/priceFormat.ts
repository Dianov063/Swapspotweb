// Locale-aware prices and distances (contract §4.1): Intl.NumberFormat in the page language with
// the currency stored on the record, no decimals for whole amounts, translated "from",
// "per hour" and "Price on request". Amounts in different currencies are never compared or
// summed. Pure module without imports so `node --test` can load it.

export type PriceWords = {
  from: string;
  perHour: string;
  onRequest: string;
  perDay: string;
  perMonth: string;
};

// `{price}` is replaced by the formatted amount.
export const PRICE_WORDS: Record<string, PriceWords> = {
  en: { from: "From {price}", perHour: "{price} per hour", onRequest: "Price on request", perDay: "{price} / day", perMonth: "{price} / month" },
  es: { from: "Desde {price}", perHour: "{price} por hora", onRequest: "Precio a consultar", perDay: "{price} / día", perMonth: "{price} / mes" },
  zh: { from: "{price} 起", perHour: "每小时 {price}", onRequest: "价格面议", perDay: "{price} / 天", perMonth: "{price} / 月" },
  fr: { from: "À partir de {price}", perHour: "{price} de l'heure", onRequest: "Prix sur demande", perDay: "{price} / jour", perMonth: "{price} / mois" },
  ru: { from: "от {price}", perHour: "{price} в час", onRequest: "Цена по запросу", perDay: "{price} / день", perMonth: "{price} / месяц" },
  ar: { from: "ابتداءً من {price}", perHour: "{price} في الساعة", onRequest: "السعر عند الطلب", perDay: "{price} / يوم", perMonth: "{price} / شهر" },
  pt: { from: "A partir de {price}", perHour: "{price} por hora", onRequest: "Preço sob consulta", perDay: "{price} / dia", perMonth: "{price} / mês" },
  ht: { from: "Apati {price}", perHour: "{price} pa èdtan", onRequest: "Pri sou demann", perDay: "{price} / jou", perMonth: "{price} / mwa" },
  de: { from: "Ab {price}", perHour: "{price} pro Stunde", onRequest: "Preis auf Anfrage", perDay: "{price} / Tag", perMonth: "{price} / Monat" },
  fil: { from: "Mula {price}", perHour: "{price} kada oras", onRequest: "Presyo kapag hiniling", perDay: "{price} / araw", perMonth: "{price} / buwan" },
  hi: { from: "{price} से शुरू", perHour: "{price} प्रति घंटा", onRequest: "कीमत अनुरोध पर", perDay: "{price} / दिन", perMonth: "{price} / महीना" },
  bn: { from: "{price} থেকে শুরু", perHour: "প্রতি ঘণ্টা {price}", onRequest: "অনুরোধে মূল্য", perDay: "{price} / দিন", perMonth: "{price} / মাস" },
  te: { from: "{price} నుండి", perHour: "గంటకు {price}", onRequest: "అభ్యర్థనపై ధర", perDay: "{price} / రోజు", perMonth: "{price} / నెల" },
  ta: { from: "{price} முதல்", perHour: "மணிக்கு {price}", onRequest: "கோரிக்கையின் பேரில் விலை", perDay: "{price} / நாள்", perMonth: "{price} / மாதம்" },
  vi: { from: "Từ {price}", perHour: "{price} mỗi giờ", onRequest: "Giá theo yêu cầu", perDay: "{price} / ngày", perMonth: "{price} / tháng" },
  th: { from: "เริ่มต้น {price}", perHour: "{price} ต่อชั่วโมง", onRequest: "สอบถามราคา", perDay: "{price} / วัน", perMonth: "{price} / เดือน" },
};

export function priceWords(locale: string): PriceWords {
  return PRICE_WORDS[locale] ?? PRICE_WORDS.en;
}

function fill(template: string, price: string) {
  return template.replace("{price}", price);
}

/** Locale list for Intl: the page language, a close fallback where ICU may lack data, then English. */
export function intlLocales(locale: string): string[] {
  if (locale === "zh") return ["zh-Hans", "en"];
  if (locale === "ht") return ["ht", "fr", "en"];
  return [locale, "en"];
}

function defaultFractionDigits(currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

export function normalizeCurrency(code: string | null | undefined) {
  const value = String(code ?? "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(value)) return null;
  try {
    new Intl.NumberFormat("en", { style: "currency", currency: value });
    return value;
  } catch {
    return null;
  }
}

/**
 * `amount` in `currency` for `locale`. Whole amounts have no decimals; other amounts use the
 * currency's minor units (from the registry when given, else ISO 4217 via Intl).
 * Without a valid currency the amount is shown as a plain number (never as USD).
 */
export function formatMoney(amount: number, currency: string | null | undefined, locale: string, minorUnits?: number) {
  const code = normalizeCurrency(currency);
  const digits = code ? (minorUnits ?? defaultFractionDigits(code)) : 2;
  const rounded = Number(amount.toFixed(digits));
  const fractionDigits = Number.isInteger(rounded) ? 0 : digits;
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  };
  if (code) Object.assign(options, { style: "currency", currency: code });
  return new Intl.NumberFormat(intlLocales(locale), options).format(rounded);
}

export type PricedListing = {
  price: string | number | null;
  price_type: string | null;
  currency_code: string | null;
};

export function listingAmount(listing: PricedListing) {
  if (listing.price_type === "quote_only") return 0;
  const amount = Number(listing.price ?? 0);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

/** Price label of a service in the page locale. */
export function formatServicePrice(listing: PricedListing, locale: string) {
  const words = priceWords(locale);
  const amount = listingAmount(listing);
  if (!amount) return words.onRequest;

  const formatted = formatMoney(amount, listing.currency_code, locale);
  if (listing.price_type === "hourly") return fill(words.perHour, formatted);
  if (listing.price_type === "starting_at") return fill(words.from, formatted);
  return formatted;
}

/** "From <price>" for a lowest price (used by the per-currency minima of a list). */
export function formatFromPrice(listing: PricedListing, locale: string) {
  const amount = listingAmount(listing);
  if (!amount) return priceWords(locale).onRequest;
  return fill(priceWords(locale).from, formatMoney(amount, listing.currency_code, locale));
}

/**
 * The cheapest priced listing per currency, ordered by currency code. Listings without a price or
 * without a valid currency are skipped: different currencies are never compared with each other.
 */
export function lowestPricesByCurrency<T extends PricedListing>(listings: readonly T[]): T[] {
  const lowest = new Map<string, T>();
  for (const listing of listings) {
    const amount = listingAmount(listing);
    const currency = normalizeCurrency(listing.currency_code);
    if (!amount || !currency) continue;
    const current = lowest.get(currency);
    if (!current || amount < listingAmount(current)) lowest.set(currency, listing);
  }
  return [...lowest.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, listing]) => listing);
}

/** "From X" per currency (at most `limit`), or "Price on request" when nothing is priced. */
export function formatLowestPrices(listings: readonly PricedListing[], locale: string, limit = 2) {
  const lowest = lowestPricesByCurrency(listings).slice(0, limit);
  if (!lowest.length) return priceWords(locale).onRequest;
  return lowest.map((listing) => formatFromPrice(listing, locale)).join(" · ");
}

export function formatPassPrice(amount: number, currency: string, locale: string, period: "day" | "month") {
  const words = priceWords(locale);
  return fill(period === "day" ? words.perDay : words.perMonth, formatMoney(amount, currency, locale));
}

const KM_PER_MILE = 1.609344;

/** Service radius (stored in miles) in the market unit, e.g. "5 mi" / "8 км". */
export function formatRadius(radiusMiles: number, unit: string | null | undefined, locale: string) {
  const kilometers = unit === "km";
  const value = kilometers ? Math.round(radiusMiles * KM_PER_MILE) : Math.round(radiusMiles * 10) / 10;
  return new Intl.NumberFormat(intlLocales(locale), {
    style: "unit",
    unit: kilometers ? "kilometer" : "mile",
    unitDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}

/** schema.org Offer with the listing's own currency; undefined when unpriced or the currency is unknown (never USD by default). */
export function schemaOffer(listing: PricedListing) {
  const amount = listingAmount(listing);
  const currency = normalizeCurrency(listing.currency_code);
  return amount && currency ? { "@type": "Offer", price: amount, priceCurrency: currency } : undefined;
}
