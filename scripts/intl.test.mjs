// International support: market registry, prices, hreflang (docs/swapspot-international.md).
// Run with `npm run test:intl` (Node type stripping loads the pure lib/*.ts modules directly).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  findMarket,
  isActiveMarket,
  loadMarkets,
  marketDisplayName,
  parseMarketsPayload,
} from "../lib/marketsCore.ts";
import {
  formatLowestPrices,
  formatMoney,
  formatPassPrice,
  formatRadius,
  formatServicePrice,
  lowestPricesByCurrency,
  PRICE_WORDS,
  schemaOffer,
} from "../lib/priceFormat.ts";
import { CONFIRMED_PASS_PRICES, referencePassPrices } from "../lib/storePrices.ts";
import { categoryName, categorySlugs } from "../lib/categoryNames.ts";
import {
  hasLocalizedVersion,
  hreflangAlternates,
  locales,
  splitLocalePath,
  switchLocalePath,
} from "../lib/locales.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const snapshot = JSON.parse(readFileSync(join(root, "lib/marketsSnapshot.json"), "utf8"));
// Intl output uses narrow/no-break spaces in some locales; compare with plain spaces.
const plain = (value) => value.replace(/[  ]/g, " ");

const market = (overrides = {}) => ({
  code: "US",
  status: "active",
  sort_order: 10,
  currency: { code: "USD", minor_units: 2 },
  distance_unit: "mi",
  names: { en: "United States", "zh-Hans": "美国", es: "Estados Unidos" },
  ...overrides,
});

// ---------------------------------------------------------------- registry

const ACTIVE = ["US", "PR", "PH", "IN", "SG", "MY", "TH", "ID", "VN", "DO", "HT", "JM", "TT"];
const AFRICA = ["ZA", "EG", "NG", "DZ", "MA", "AO", "KE", "GH", "ET", "CD"];

test("the bundled snapshot is format 1: 13 active markets, then the 10 African markets preparing", () => {
  const parsed = parseMarketsPayload(snapshot);
  assert.ok(parsed);
  assert.deepEqual(parsed.markets.map((item) => item.code), [...ACTIVE, ...AFRICA]);
  for (const item of parsed.markets) {
    assert.equal(item.status, ACTIVE.includes(item.code) ? "active" : "preparing", item.code);
  }
  assert.equal(findMarket(parsed.markets, "CD").currency.code, "USD");
  assert.deepEqual(findMarket(parsed.markets, "CD").timezones, ["Africa/Kinshasa", "Africa/Lubumbashi"]);
  assert.equal(findMarket(parsed.markets, "EG").regionKind, "governorate");
  assert.equal(findMarket(parsed.markets, "KE").regionKind, "county");
  assert.equal(findMarket(parsed.markets, "AO").postal.kind, "none");
  assert.equal(findMarket(parsed.markets, "VN").currency.minorUnits, 0);
});

test("parsing ignores unknown fields, skips invalid markets and drops disabled ones", () => {
  const parsed = parseMarketsPayload({
    format: 1,
    updated_at: "2026-10-19T00:00:00Z",
    future_field: { anything: true },
    markets: [
      market({ code: "TH", sort_order: 70, currency: { code: "THB", minor_units: 2 }, new_column: 1 }),
      market(),
      market({ code: "usa" }),
      market({ code: "XX", currency: { code: "US", minor_units: 2 } }),
      market({ code: "ZZ", status: "unknown" }),
      market({ code: "DE", status: "disabled" }),
      market({ code: "BR", status: "preparing", sort_order: 200, currency: { code: "BRL", minor_units: 2 } }),
      "garbage",
    ],
  });
  assert.deepEqual(parsed.markets.map((item) => item.code), ["US", "TH", "BR"]);
  assert.equal(parsed.updatedAt, "2026-10-19T00:00:00Z");
  assert.equal("new_column" in parsed.markets[1], false);
  assert.equal(isActiveMarket(findMarket(parsed.markets, "BR")), false);
});

test("preparing and verified markets are listed but never launched (no reference pass price)", () => {
  const parsed = parseMarketsPayload({
    format: 1,
    markets: [
      market(),
      market({ code: "IN", status: "verified", sort_order: 40, currency: { code: "INR", minor_units: 2 } }),
      market({ code: "ZA", status: "preparing", sort_order: 140, currency: { code: "ZAR", minor_units: 2 } }),
    ],
  });
  assert.deepEqual(parsed.markets.map((item) => [item.code, item.status]), [["US", "active"], ["IN", "verified"], ["ZA", "preparing"]]);
  for (const code of ["IN", "ZA"]) {
    const item = findMarket(parsed.markets, code);
    assert.equal(isActiveMarket(item), false, code);
    // IN has a confirmed store price, but a market that is not active never shows it.
    assert.equal(referencePassPrices(code, isActiveMarket(item)), null, code);
  }
  const { markets } = parseMarketsPayload(snapshot);
  for (const code of AFRICA) assert.equal(referencePassPrices(code, isActiveMarket(findMarket(markets, code))), null, code);
});

test("country names for registry languages use the BCP 47 key, then the language, then English", () => {
  const { markets } = parseMarketsPayload(snapshot);
  assert.equal(marketDisplayName(markets, "EG", "ar-eg"), "مصر");
  assert.equal(marketDisplayName(markets, "KE", "sw-ke"), "Kenya");
  assert.equal(marketDisplayName(markets, "MA", "zgh"), findMarket(markets, "MA").names.zgh);
  assert.equal(marketDisplayName(markets, "MA", "ary"), findMarket(markets, "MA").names.ar);
});

test("format guard: another or missing format is refused", () => {
  assert.equal(parseMarketsPayload({ format: 2, markets: [market()] }), null);
  assert.equal(parseMarketsPayload({ markets: [market()] }), null);
  assert.equal(parseMarketsPayload({ format: 1, markets: [] }), null);
  assert.equal(parseMarketsPayload(null), null);
});

const response = (body, ok = true) => async () => ({ ok, json: async () => body });

test("registry response wins; every failure falls back to the bundled snapshot", async () => {
  const remote = { format: 1, markets: [market({ code: "BR", currency: { code: "BRL", minor_units: 2 } })] };
  const ok = await loadMarkets({ url: "https://platform.test/markets", snapshot, fetchImpl: response(remote) });
  assert.equal(ok.source, "registry");
  assert.deepEqual(ok.markets.map((item) => item.code), ["BR"]);

  const errors = [];
  const onError = (reason) => errors.push(reason);
  const cases = [
    ["not configured", { url: null, fetchImpl: response(remote) }],
    ["HTTP error", { url: "u", fetchImpl: response(remote, false) }],
    ["network error", { url: "u", fetchImpl: async () => { throw new Error("ECONNREFUSED"); } }],
    ["higher format", { url: "u", fetchImpl: response({ format: 2, markets: [market()] }) }],
    ["invalid JSON body", { url: "u", fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError("bad"); } }) }],
    [
      "timeout",
      {
        url: "u",
        timeoutMs: 20,
        fetchImpl: (_url, init) =>
          new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => reject(init.signal.reason))),
      },
    ],
  ];
  for (const [name, options] of cases) {
    const result = await loadMarkets({ snapshot, onError, ...options });
    assert.equal(result.source, "snapshot", name);
    assert.equal(result.markets.length, 23, name);
  }
  assert.equal(errors.length, cases.length - 1);
});

test("the fetch carries the Next cache hint and a timeout signal", async () => {
  let seen;
  await loadMarkets({
    url: "https://platform.test/v1/apps/swapspot/swapspot/markets",
    snapshot,
    init: { next: { revalidate: 3600 } },
    fetchImpl: async (url, init) => {
      seen = { url, init };
      return { ok: true, json: async () => snapshot };
    },
  });
  assert.equal(seen.url, "https://platform.test/v1/apps/swapspot/swapspot/markets");
  assert.deepEqual(seen.init.next, { revalidate: 3600 });
  assert.ok(seen.init.signal instanceof AbortSignal);
});

test("unknown country: no market and no US fallback", () => {
  const { markets } = parseMarketsPayload(snapshot);
  assert.equal(findMarket(markets, "us").code, "US");
  for (const code of ["FR", "XX", "", null, undefined, "USA", "1"]) {
    assert.equal(findMarket(markets, code), null, String(code));
  }
});

test("country names come from the registry in the page language with English fallback", () => {
  const { markets } = parseMarketsPayload(snapshot);
  assert.equal(marketDisplayName(markets, "US", "zh"), "美国");
  assert.equal(marketDisplayName(markets, "DO", "es"), "República Dominicana");
  assert.equal(marketDisplayName(markets, "DO", "xx"), "Dominican Republic");
  const custom = [parseMarketsPayload({ format: 1, markets: [market({ names: { en: "United States" } })] }).markets[0]];
  assert.equal(marketDisplayName(custom, "US", "th"), "United States");
  assert.equal(marketDisplayName(markets, "FR", "en"), "FR");
});

test("the snapshot generator converts the seed to the endpoint shape", () => {
  const dir = mkdtempSync(join(tmpdir(), "swapspot-markets-"));
  try {
    const seed = {
      format: 1,
      source: "test",
      markets: [
        {
          code: "VN", status: "active", sort_order: 90, currency_code: "VND", currency_minor_units: 0,
          distance_unit: "km", default_timezone: "Asia/Ho_Chi_Minh", timezones: ["Asia/Ho_Chi_Minh"],
          postal_kind: "postal", postal_required: false, postal_pattern: null, postal_example: "700000",
          region_kind: "province", map_center: { lat: 10.8, lng: 106.7, zoom: 11 }, default_language: "vi",
          languages: ["vi", "en"], unsupported_local_languages: [], names: { en: "Vietnam", vi: "Việt Nam" },
        },
        { code: "DE", status: "disabled", names: { en: "Germany" } },
      ],
    };
    writeFileSync(join(dir, "seed.json"), JSON.stringify(seed));
    execFileSync(process.execPath, [join(root, "scripts/sync-markets-snapshot.mjs"), join(dir, "seed.json"), join(dir, "out.json")]);
    const out = JSON.parse(readFileSync(join(dir, "out.json"), "utf8"));
    assert.equal(out.format, 1);
    assert.deepEqual(out.markets.map((item) => item.code), ["VN"]);
    assert.deepEqual(out.markets[0].currency, { code: "VND", minor_units: 0 });
    assert.deepEqual(out.markets[0].languages, { default: "vi", recommended: ["vi", "en"] });
    assert.equal(parseMarketsPayload(out).markets[0].postal.kind, "postal");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- prices

const listing = (price, currency_code, price_type = "fixed") => ({ price, currency_code, price_type });

test("prices use the page locale and the listing currency; whole amounts have no decimals", () => {
  assert.equal(formatServicePrice(listing(50, "USD"), "en"), "$50");
  assert.equal(formatServicePrice(listing("49.5", "USD"), "en"), "$49.50");

  const thb = plain(formatServicePrice(listing(1500, "THB"), "th"));
  assert.match(thb, /฿\s?1,500$/);

  const dop = plain(formatServicePrice(listing(1500, "DOP"), "es"));
  assert.match(dop, /1\.?500/);
  assert.match(dop, /DOP|RD\$/);
  assert.doesNotMatch(dop, /,00/);

  assert.equal(plain(formatServicePrice(listing(150000, "VND"), "vi")), "150.000 ₫");
  // VND has no minor unit: a fractional amount is rounded, never shown with decimals.
  assert.equal(plain(formatMoney(150000.4, "VND", "vi")), "150.000 ₫");

  assert.equal(plain(formatServicePrice(listing(150000, "INR"), "hi")), "₹1,50,000");
});

test("translated price words: from, per hour, price on request", () => {
  assert.equal(formatServicePrice(listing(40, "USD", "hourly"), "en"), "$40 per hour");
  assert.equal(formatServicePrice(listing(40, "USD", "starting_at"), "en"), "From $40");
  assert.equal(plain(formatServicePrice(listing(800, "THB", "starting_at"), "th")), "เริ่มต้น ฿800");
  assert.match(plain(formatServicePrice(listing(500, "DOP", "hourly"), "es")), / por hora$/);
  assert.equal(formatServicePrice(listing(null, "USD", "quote_only"), "ru"), "Цена по запросу");
  assert.equal(formatServicePrice(listing(25, "USD", "quote_only"), "en"), "Price on request");
  assert.equal(formatServicePrice(listing(0, "USD"), "de"), "Preis auf Anfrage");
  for (const locale of locales) {
    assert.ok(PRICE_WORDS[locale], `price words for ${locale}`);
    for (const key of ["from", "perHour", "perDay", "perMonth"]) {
      assert.match(PRICE_WORDS[locale][key], /\{price\}/, `${locale}.${key}`);
    }
  }
});

test("a missing or invalid currency is never shown as USD", () => {
  for (const currency of [null, "", "dollars", "XXQ1"]) {
    const value = formatServicePrice(listing(30, currency), "en");
    assert.equal(value, "30", String(currency));
  }
  assert.equal(schemaOffer(listing(30, null)), undefined);
  assert.equal(schemaOffer(listing(null, "USD", "quote_only")), undefined);
  assert.deepEqual(schemaOffer(listing("1500", "thb")), { "@type": "Offer", price: 1500, priceCurrency: "THB" });
});

test("lowest price is computed per currency; different currencies are never compared", () => {
  const listings = [
    listing(10, "USD"),
    listing(5, "USD", "hourly"),
    listing(300, "THB"),
    listing(1, null),
    listing(null, "THB", "quote_only"),
    listing(450, "THB"),
  ];
  const lowest = lowestPricesByCurrency(listings);
  assert.deepEqual(lowest.map((item) => [item.currency_code, item.price]), [["THB", 300], ["USD", 5]]);
  assert.equal(plain(formatLowestPrices(listings, "en")), "From THB 300 · From $5");
  assert.equal(formatLowestPrices([listing(null, "USD", "quote_only")], "fr"), "Prix sur demande");
});

test("service radius is shown in the market unit (stored in miles)", () => {
  assert.equal(plain(formatRadius(5, "mi", "en")), "5 mi");
  assert.equal(plain(formatRadius(5, "km", "en")), "8 km");
});

test("category names exist in every locale and backend slugs map to them", () => {
  for (const locale of locales) {
    for (const slug of categorySlugs) assert.ok(categoryName(slug, locale), `${locale} ${slug}`);
  }
  assert.equal(categoryName("home-repair-and-maintenance", "es"), "Reparación y mantenimiento del hogar");
  assert.equal(categoryName("lawn-and-outdoor", "de"), "Garten & Außenbereich");
  assert.equal(categoryName("unknown-category", "fr"), null);
});

// ---------------------------------------------------------------- passes

test("pass reference prices only for active markets with prices confirmed in both stores", () => {
  assert.deepEqual(Object.keys(CONFIRMED_PASS_PRICES).sort(), ["IN", "US"]);
  assert.equal(referencePassPrices("us", true).dayPass.amount, 4.99);
  assert.equal(referencePassPrices("US", false), null);
  assert.equal(referencePassPrices("TH", true), null);
  assert.equal(referencePassPrices(null, true), null);
  assert.equal(referencePassPrices("", true), null);
  assert.equal(formatPassPrice(4.99, "USD", "en", "day"), "$4.99 / day");
  assert.equal(formatPassPrice(24.99, "USD", "es", "month").includes("24,99"), true);
  assert.equal(plain(formatPassPrice(399, "INR", "hi", "month")), "₹399 / महीना");
});

// ---------------------------------------------------------------- hreflang

test("hreflang alternates: every locale plus x-default, canonical of the current locale", () => {
  const alternates = hreflangAlternates("/services", "es");
  assert.equal(alternates.canonical, "/es/services");
  assert.equal(Object.keys(alternates.languages).length, locales.length + 1);
  assert.equal(alternates.languages.en, "/services");
  assert.equal(alternates.languages["zh-Hans"], "/zh/services");
  assert.equal(alternates.languages.ar, "/ar/services");
  assert.equal(alternates.languages["x-default"], "/services");
  assert.equal(hreflangAlternates("/services").canonical, "/services");

  const home = hreflangAlternates("/", "th");
  assert.equal(home.canonical, "/th");
  assert.equal(home.languages.en, "/");
  assert.equal(home.languages["x-default"], "/");
});

test("language switcher keeps the page when a localized version exists", () => {
  assert.deepEqual(splitLocalePath("/es"), { locale: "es", path: "/" });
  assert.deepEqual(splitLocalePath("/ar/helpers/maria-ab12"), { locale: "ar", path: "/helpers/maria-ab12" });
  assert.deepEqual(splitLocalePath("/services"), { locale: "en", path: "/services" });
  assert.equal(switchLocalePath("/es/services/cleaning/brooklyn", "fr"), "/fr/services/cleaning/brooklyn");
  assert.equal(switchLocalePath("/services", "ar"), "/ar/services");
  assert.equal(switchLocalePath("/de/helpers", "en"), "/helpers");
  assert.equal(switchLocalePath("/categories/cleaning", "vi"), "/vi/categories/cleaning");
  assert.equal(switchLocalePath("/blog", "de"), "/de");
  assert.equal(switchLocalePath("/auth/reset-password", "es"), "/es");
  assert.equal(hasLocalizedVersion("/admin"), false);
  assert.equal(hasLocalizedVersion("/cities/miami"), true);
});
