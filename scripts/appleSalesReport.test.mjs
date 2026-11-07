import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { gzipSync } from "node:zlib";
import { fetchAppleDailySales, parseAppleDailySales } from "../lib/appleSalesReport.ts";

const date = "2026-09-13";
const header = "SKU\tParent Identifier\tUnits\tCountry Code\tCustomer Price\tCustomer Currency\tDeveloper Proceeds\tCurrency of Proceeds\tBegin Date\tEnd Date";
const row = (sku, parent, units, country, price, proceeds, day = "09/13/2026", local = "USD") =>
  [sku, parent, units, country, price, local, proceeds, "USD", day, day].join("\t");
const dayPass = (units = 1, price = "4.99", proceeds = "3.50", parent = "swapspot-ios-001") =>
  row("client_day_pass_1dd", parent, units, "US", price, proceeds);
const tsv = (...rows) => [header, ...rows, ""].join("\r\n");

test("keeps paid sales and refunds separate, with only SwapSpot in-app purchases", () => {
  const parsed = parseAppleDailySales(tsv(
    dayPass(), dayPass(2), dayPass(-1, "-4.99"), dayPass(0, "-1.99", "1.40"),
    dayPass(9, "4.99", "3.50", "other-app"), dayPass(2, "0", "0"),
    row("client_pro_monthly", "swapspot-ios-001", "1.00", "JM", "299", ".99", "09/13/2026", "JMD"),
  ), date);
  assert.deepEqual(parsed, [
    { product: "Client Day Pass", country: "US", units: 3, price: "4.99 USD", proceeds: "3.50 USD", refund: false },
    { product: "Client Day Pass", country: "US", units: 1, price: "4.99 USD", proceeds: "3.50 USD", refund: true },
    { product: "Client Day Pass", country: "US", units: 0, price: "1.99 USD", proceeds: "1.40 USD", refund: true },
    { product: "Client Pro Monthly", country: "JM", units: 1, price: "299 JMD", proceeds: ".99 USD", refund: false },
  ]);
});
test("a malformed or misdated report cannot silently turn into zero sales", () => {
  assert.deepEqual(parseAppleDailySales(tsv(dayPass(1, "4.99", "3.50", "other-app")), date), []);
  assert.throws(() => parseAppleDailySales("not a sales report", date), /headers/);
  assert.throws(() => parseAppleDailySales(tsv(row("client_day_pass_1dd", "swapspot-ios-001", 1, "US", "4.99", "3.50", "09/12/2026")), date), /date mismatch/);
});
test("reads an authenticated gzip report and distinguishes missing data from zero sales", async (t) => {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const env = {
    SWAPSPOT_ASC_SALES_KEY_ID: "fixture",
    SWAPSPOT_ASC_SALES_ISSUER_ID: "fixture",
    SWAPSPOT_ASC_SALES_PRIVATE_KEY: privateKey.export({ format: "pem", type: "pkcs8" }),
    SWAPSPOT_ASC_SALES_VENDOR_NUMBER: "12345678",
  };
  const previous = Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]]));
  Object.assign(process.env, env);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  const mock = t.mock.method(globalThis, "fetch", async () => new Response(gzipSync(tsv(dayPass()))));
  const fetched = await fetchAppleDailySales(date);
  assert.equal(fetched.status, "available");
  assert.equal(fetched.sales[0].units, 1);
  const [url, options] = mock.mock.calls[0].arguments;
  assert.equal(url.origin, "https://api.appstoreconnect.apple.com");
  assert.equal(url.searchParams.get("filter[reportDate]"), date);
  assert.equal(url.searchParams.get("filter[frequency]"), "DAILY");
  assert.equal(options.redirect, "error");
  assert.match(options.headers.Authorization, /^Bearer [\w.-]+$/);
  const payload = JSON.parse(Buffer.from(options.headers.Authorization.split(".")[1], "base64url"));
  assert.deepEqual(payload.scope, ["GET /v1/salesReports" + decodeURIComponent(url.search)]);
  mock.mock.mockImplementation(async () => new Response("", { status: 404 }));
  assert.deepEqual(await fetchAppleDailySales(date), { date, status: "missing" });
  mock.mock.mockImplementation(async () => new Response("", { status: 403 }));
  assert.deepEqual(await fetchAppleDailySales(date), { date, status: "forbidden" });
  mock.mock.mockImplementation(async () => new Response(tsv()));
  assert.deepEqual(await fetchAppleDailySales(date), { date, status: "available", sales: [] });
  delete process.env.SWAPSPOT_ASC_SALES_PRIVATE_KEY;
  assert.deepEqual(await fetchAppleDailySales(date), { date, status: "not-configured" });
});
