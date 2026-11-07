import { sign } from "node:crypto";
import { gunzipSync } from "node:zlib";

const APP_SKU = "swapspot-ios-001";
const PRODUCTS = new Map([
  ["client_day_pass_1dd", "Client Day Pass"],
  ["client_pro_monthly", "Client Pro Monthly"],
]);
const MAX_REPORT_BYTES = 10 * 1024 * 1024;

type Sale = {
  product: string;
  country: string;
  units: number;
  price: string;
  proceeds: string;
  refund: boolean;
};
export type AppleDailySales =
  | { date: string; status: "available"; sales: Sale[] }
  | { date: string; status: "not-configured" | "missing" | "forbidden" | "unavailable" };

export function parseAppleDailySales(tsv: string, date: string): Sale[] {
  const [heading, ...lines] = tsv.replace(/^\uFEFF/, "").split(/\r?\n/);
  const fields = heading.split("\t");
  const required = [
    "SKU", "Parent Identifier", "Units", "Country Code", "Customer Price",
    "Customer Currency", "Developer Proceeds", "Currency of Proceeds", "Begin Date", "End Date",
  ];
  const index = new Map(fields.map((field, position) => [field, position]));
  if (!index.has("Developer Proceeds") && index.has("Developer Proceeds (per unit)")) {
    index.set("Developer Proceeds", index.get("Developer Proceeds (per unit)")!);
  }
  if (required.some((field) => !index.has(field))) throw new Error("Unexpected Apple report headers");
  const money = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/;
  const currency = /^[A-Z]{3}$/;
  const [year, month, day] = date.split("-");
  const expectedDate = [month, day, year].join("/");
  const totals = new Map<string, Sale>();

  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = line.split("\t");
    if (cells.length !== fields.length) throw new Error("Unexpected Apple report row");
    const get = (field: string) => cells[index.get(field)!].trim();
    if (get("Begin Date") !== expectedDate || get("End Date") !== expectedDate) {
      throw new Error("Apple report date mismatch");
    }
    const product = PRODUCTS.get(get("SKU"));
    if (!product || get("Parent Identifier") !== APP_SKU) continue;
    const rawUnits = get("Units");
    const units = Number(rawUnits);
    const price = get("Customer Price");
    const proceeds = get("Developer Proceeds");
    const customerCurrency = get("Customer Currency");
    const proceedsCurrency = get("Currency of Proceeds");
    const country = get("Country Code");
    if (!/^-?\d+(?:\.0+)?$/.test(rawUnits) || !Number.isSafeInteger(units) || !money.test(price)) {
      throw new Error("Unexpected Apple units or price");
    }
    if (Number(price) === 0 || (!units && Number(price) > 0)) continue;
    if (!money.test(proceeds) || !currency.test(customerCurrency) || !currency.test(proceedsCurrency)) {
      throw new Error("Unexpected Apple currency or proceeds");
    }
    const refund = units < 0 || Number(price) < 0;
    const sale = {
      product,
      country: /^[A-Z]{2}$/.test(country) ? country : "—",
      units: Math.abs(units),
      price: price.replace(/^-/, "") + " " + customerCurrency,
      proceeds: proceeds.replace(/^-/, "") + " " + proceedsCurrency,
      refund,
    };
    const key = JSON.stringify([sale.product, sale.country, sale.price, sale.proceeds, sale.refund]);
    const groupKey = units ? key : key + ":" + totals.size;
    const current = totals.get(groupKey);
    if (current) {
      if (!Number.isSafeInteger(current.units + sale.units)) throw new Error("Apple units overflow");
      current.units += sale.units;
    } else {
      totals.set(groupKey, sale);
    }
  }
  return Array.from(totals.values()).sort((a, b) =>
    a.product.localeCompare(b.product) || a.country.localeCompare(b.country) || Number(a.refund) - Number(b.refund),
  );
}

async function readBoundedReport(response: Response) {
  if (!response.body) throw new Error("Empty Apple report response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.byteLength;
      if (length > MAX_REPORT_BYTES) throw new Error("Apple report too large");
      chunks.push(part.value);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  const data = Buffer.concat(chunks, length);
  return (data[0] === 0x1f && data[1] === 0x8b
    ? gunzipSync(data, { maxOutputLength: MAX_REPORT_BYTES })
    : data).toString("utf8");
}

function token(keyId: string, issuer: string, pem: string, scope: string) {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const body = encode({ alg: "ES256", kid: keyId, typ: "JWT" }) + "." +
    encode({ iss: issuer, iat: now, exp: now + 300, aud: "appstoreconnect-v1", scope: [scope] });
  return body + "." + sign("sha256", Buffer.from(body), {
    key: pem.replace(/\\n/g, "\n"),
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");
}

export async function fetchAppleDailySales(date: string): Promise<AppleDailySales> {
  const { SWAPSPOT_ASC_SALES_KEY_ID: keyId, SWAPSPOT_ASC_SALES_ISSUER_ID: issuer,
    SWAPSPOT_ASC_SALES_PRIVATE_KEY: pem, SWAPSPOT_ASC_SALES_VENDOR_NUMBER: vendor } = process.env;
  if (!keyId || !issuer || !pem || !vendor) return { date, status: "not-configured" };
  try {
    const url = new URL("https://api.appstoreconnect.apple.com/v1/salesReports");
    url.search = new URLSearchParams({
      "filter[frequency]": "DAILY", "filter[reportType]": "SALES", "filter[reportSubType]": "SUMMARY",
      "filter[reportDate]": date, "filter[vendorNumber]": vendor, "filter[version]": "1_0",
    }).toString();
    const scope = "GET " + url.pathname + decodeURIComponent(url.search);
    const response = await fetch(url, {
      headers: { Authorization: "Bearer " + token(keyId, issuer, pem, scope), Accept: "application/a-gzip" },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      void response.body?.cancel().catch(() => undefined);
      const status = response.status === 404 ? "missing" :
        response.status === 401 || response.status === 403 ? "forbidden" : "unavailable";
      return { date, status };
    }
    return { date, status: "available", sales: parseAppleDailySales(await readBoundedReport(response), date) };
  } catch {
    return { date, status: "unavailable" };
  }
}
