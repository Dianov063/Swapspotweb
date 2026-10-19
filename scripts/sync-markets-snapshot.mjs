// Generates lib/marketsSnapshot.json (the website's fallback copy of the market registry) from the
// server seed `services/api/platform_app/swapspot_markets_seed.json` of the App Platform repo.
// The output has the shape of `GET /v1/apps/{slug}/swapspot/markets` (format 1, contract §2.1).
//
//   node scripts/sync-markets-snapshot.mjs <path/to/swapspot_markets_seed.json> [output.json]
import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [seedPath, outputArg] = process.argv.slice(2);
if (!seedPath) {
  console.error("Usage: node scripts/sync-markets-snapshot.mjs <swapspot_markets_seed.json> [output.json]");
  process.exit(2);
}
const output = resolve(outputArg || fileURLToPath(new URL("../lib/marketsSnapshot.json", import.meta.url)));
const seed = JSON.parse(readFileSync(seedPath, "utf8"));
if (seed.format !== 1 || !Array.isArray(seed.markets)) {
  throw new Error(`Unsupported seed: expected format 1 with a markets array, got format ${seed.format}`);
}

const fail = (code, message) => {
  throw new Error(`Market ${code}: ${message}`);
};

const markets = seed.markets
  .filter((market) => market.status !== "disabled")
  .map((market) => {
    const { code } = market;
    if (!/^[A-Z]{2}$/.test(code ?? "")) fail(code, "code must be ISO 3166-1 alpha-2");
    if (!["active", "preparing"].includes(market.status)) fail(code, `unknown status ${market.status}`);
    if (!/^[A-Z]{3}$/.test(market.currency_code ?? "")) fail(code, "currency_code must be ISO 4217");
    if (![0, 1, 2, 3].includes(market.currency_minor_units)) fail(code, "currency_minor_units must be 0-3");
    if (!market.names?.en) fail(code, "names.en is required");
    if (!market.timezones?.includes(market.default_timezone)) fail(code, "default_timezone must be in timezones");
    return {
      code,
      status: market.status,
      sort_order: market.sort_order,
      currency: { code: market.currency_code, minor_units: market.currency_minor_units },
      distance_unit: market.distance_unit,
      default_timezone: market.default_timezone,
      timezones: market.timezones,
      postal: {
        kind: market.postal_kind,
        required: market.postal_required,
        pattern: market.postal_pattern,
        example: market.postal_example,
      },
      region_kind: market.region_kind,
      map_center: market.map_center,
      languages: { default: market.default_language, recommended: market.languages },
      names: market.names,
    };
  })
  .sort((left, right) => left.sort_order - right.sort_order || left.code.localeCompare(right.code));

const snapshot = {
  format: 1,
  updated_at: null,
  generated_from: basename(seedPath),
  seed_source: seed.source ?? null,
  markets,
};
writeFileSync(output, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify({ output, markets: markets.length, codes: markets.map((market) => market.code) }));
