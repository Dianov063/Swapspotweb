import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { zipSync } from "fflate";
import { parsePlaySalesCsv, fetchGooglePlaySales } from "../lib/googlePlaySalesReport.ts";
import { buildDailyReport, getDailyReportWindow } from "../lib/dailyReport.ts";

const heading = "Package ID,SKU ID,Order Charged Date,Financial Status,Currency of Sale,Charged Amount,Country of Buyer,City of Buyer,Order Number";
const records = [
  "com.swapspotnyc.app,client_day_pass_1dd,2026-11-05,charged,USD,4.99,US,,GPA.123",
  'com.swapspotnyc.app,client_pro_monthly,2026-11-04,charged,JMD,"1,299.00",JM,"Kingston, JA",GPA.456',
  "com.swapspotnyc.app,client_day_pass_1dd,2026-11-04,partial refund,USD,-1.99,US,,GPA.123",
  "com.swapspotnyc.app,client_day_pass_1dd,2026-11-04,pending,USD,4.99,US,,GPA.789",
  "com.other.app,client_day_pass_1dd,2026-11-05,charged,USD,4.99,US,,GPA.000",
  "com.swapspotnyc.app,client_day_pass_1dd,2026-10-25,charged,USD,4.99,US,,GPA.111",
];
const csv = [heading, ...records].join("\r\n");
const zipped = zipSync({ "sales.csv": Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(csv, "utf16le")]) });

test("only displays SwapSpot purchases and refunds, with optional city and no order IDs", () => {
  const sales = parsePlaySalesCsv(csv, "2026-10-30", "2026-11-06");
  assert.deepEqual(sales, [
    { date: "2026-11-05", product: "Client Day Pass", operation: "Покупка", amount: "4.99 USD", country: "US", city: "—" },
    { date: "2026-11-04", product: "Client Pro Monthly", operation: "Покупка", amount: "1299.00 JMD", country: "JM", city: "Kingston, JA" },
    { date: "2026-11-04", product: "Client Day Pass", operation: "Частичный возврат", amount: "1.99 USD", country: "US", city: "—" },
  ]);
  assert.throws(() => parsePlaySalesCsv("not,a,sales,report", "2026-10-30", "2026-11-06"), /headers/);
});

test("daily owner report reads both months and never treats a missing Google file as zero", async (t) => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const credentials = JSON.stringify({client_email:"fixture@example.com",private_key:privateKey.export({format:"pem",type:"pkcs8"})});
  const keys = { SWAPSPOT_PLAY_SALES_BUCKET: "pubsite_prod_123", SWAPSPOT_PLAY_SALES_CREDENTIALS: credentials };
  const original = Object.fromEntries(Object.keys(keys).map(key => [key, process.env[key]]));
  Object.assign(process.env, keys);
  t.after(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  const mock = t.mock.method(globalThis, "fetch", async (input, opts) => {
    const url = new URL(input);
    if (url.hostname === "oauth2.googleapis.com") {
      const encoded = opts.body.get("assertion").split(".")[1];
      const claim = JSON.parse(Buffer.from(encoded, "base64url"));
      assert.equal(claim.scope, "https://www.googleapis.com/auth/devstorage.read_only");
      return Response.json({ access_token: "fixture" });
    }
    if (url.hostname === "storage.googleapis.com") {
      assert.equal(opts.headers.Authorization, "Bearer fixture");
      assert.equal(opts.redirect, "error");
      return url.pathname.includes("202611") ? new Response(zipped) : new Response("", { status: 404 });
    }
    throw new Error("Other sources unavailable in this offline fixture");
  });
  const report = await buildDailyReport(getDailyReportWindow(new Date("2026-11-07T16:00:00Z")));
  assert.deepEqual(report.summary.googlePlaySales, {
    status: "checked", months: [{month: "2026-11", status: "available"}, {month: "2026-10", status: "missing"}], rows: 3,
  });
  for (const format of [report.html, report.text]) {
    assert.match(format, /Продажи Google Play/);
    assert.match(format, /1299\.00 JMD/);
    assert.match(format, /Kingston, JA/);
    assert.match(format, /2026-10: Google Play пока не сформировал файл продаж/);
    assert.doesNotMatch(format, /GPA\./);
  }
  mock.mock.mockImplementation(async (input) => new URL(input).hostname === "oauth2.googleapis.com"
    ? Response.json({access_token:"fixture"}) : new Response("",{status:403}));
  assert.deepEqual(await fetchGooglePlaySales("2026-11-01","2026-11-06"),
    {status:"checked",months:[{month:"2026-11",status:"forbidden"}]});
});
