import { sign } from "node:crypto";
import { parse } from "csv-parse/sync";
import { unzipSync } from "fflate";

const PACKAGE = "com.swapspotnyc.app";
const PRODUCTS = new Map([
  ["client_day_pass_1dd", "Client Day Pass"],
  ["client_pro_monthly", "Client Pro Monthly"],
]);
const OAUTH_URL = "https://oauth2.googleapis.com/token";
const MAX_ZIP = 10 * 1024 * 1024;
const MAX_CSV = 20 * 1024 * 1024;

type PlaySale = { date: string; product: string; country: string; city: string; amount: string; operation: string };
type MonthResult =
  | { month: string; status: "available"; sales: PlaySale[] }
  | { month: string; status: "missing" | "forbidden" | "unavailable" };
type GoogleSales = { status: "not-configured" | "checked" | "forbidden" | "unavailable"; months: MonthResult[] };

export function parsePlaySalesCsv(data: string, start: string, end: string): PlaySale[] {
  const required = ["Package ID", "SKU ID", "Order Charged Date", "Financial Status",
    "Currency of Sale", "Charged Amount", "Country of Buyer"];
  let headerSeen = false;
  const records: Record<string, string>[] = parse(data, {
    bom: true,
    skip_empty_lines: true,
    max_record_size: 32 * 1024,
    columns: (headers: string[]) => {
      headerSeen = true;
      const columns = headers.map((value) => value.trim());
      if (required.some((field) => !columns.includes(field))) throw new Error("Unexpected Play report headers");
      return columns;
    },
  });
  if (!headerSeen) throw new Error("Empty Play report");
  const sales: PlaySale[] = [];
  for (const row of records) {
    if (row["Package ID"] !== PACKAGE) continue;
    const product = PRODUCTS.get(row["SKU ID"]);
    if (!product) continue;
    const date = row["Order Charged Date"];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Unexpected Play order date");
    if (date < start || date > end) continue;
    const state = row["Financial Status"].trim().toLowerCase();
    const operation = state === "charged" ? "Покупка" :
      ["refund", "refunded"].includes(state) ? "Возврат" :
      ["partial refund", "partially refunded"].includes(state) ? "Частичный возврат" : null;
    if (!operation) continue;
    const rawAmount = row["Charged Amount"].trim();
    const currency = row["Currency of Sale"].trim();
    if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(rawAmount) || !/^[A-Z]{3}$/.test(currency)) {
      throw new Error("Unexpected Play amount");
    }
    const amount = rawAmount.replace(/,/g, "").replace(/^-/, "");
    if (Number(amount) === 0) continue;
    const country = row["Country of Buyer"].trim();
    sales.push({
      date, product, operation, amount: amount + " " + currency,
      country: /^[A-Z]{2}$/.test(country) ? country : "—",
      city: row["City of Buyer"]?.trim().replace(/\s+/g, " ").slice(0, 80) || "—",
    });
  }
  return sales.sort((a, b) => b.date.localeCompare(a.date));
}

async function downloadZip(response: Response) {
  if (!response.body) throw new Error("Empty Play response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > MAX_ZIP) throw new Error("Play report too large");
      chunks.push(part.value);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  const zip = Buffer.concat(chunks, size);
  let extracted = 0;
  const files = unzipSync(zip, {
    filter: (entry) => {
      if (!entry.name.toLowerCase().endsWith(".csv")) return false;
      extracted += entry.originalSize;
      if (extracted > MAX_CSV) throw new Error("Play CSV exceeds size limit");
      return true;
    },
  });
  const csvs = Object.values(files);
  if (!csvs.length) throw new Error("No CSV in Play archive");
  return csvs.map((bytes) => {
    const encoding = bytes[0] === 0xff && bytes[1] === 0xfe ? "utf-16le" :
      bytes[0] === 0xfe && bytes[1] === 0xff ? "utf-16be" : "utf-8";
    return new TextDecoder(encoding, { fatal: true }).decode(bytes);
  });
}

async function storageAccessToken(credentials: string) {
  const account = JSON.parse(credentials) as { client_email?: string; private_key?: string };
  if (!account.client_email || !account.private_key) throw new Error("Invalid Play sales credentials");
  const enc = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const input = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({
    iss: account.client_email, aud: OAUTH_URL, iat: now, exp: now + 300,
    scope: "https://www.googleapis.com/auth/devstorage.read_only",
  });
  const assertion = input + "." + sign("RSA-SHA256", Buffer.from(input), account.private_key).toString("base64url");
  const res = await fetch(OAUTH_URL, {
    method: "POST",
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(7000),
  });
  if (!res.ok) {
    void res.body?.cancel().catch(() => undefined);
    return { status: res.status === 401 || res.status === 403 ? "forbidden" as const : "unavailable" as const };
  }
  const data = await res.json() as { access_token?: string };
  if (!data.access_token) throw new Error("Missing Play access token");
  return { status: "available" as const, token: data.access_token };
}

async function fetchMonth(bucket: string, month: string, start: string, end: string, token: string): Promise<MonthResult> {
  try {
    const object = encodeURIComponent("sales/salesreport_" + month.replace("-", "") + ".zip");
    const response = await fetch("https://storage.googleapis.com/storage/v1/b/" + bucket + "/o/" + object + "?alt=media", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      void response.body?.cancel().catch(() => undefined);
      return { month, status: response.status === 404 ? "missing" :
        response.status === 401 || response.status === 403 ? "forbidden" : "unavailable" };
    }
    return { month, status: "available", sales: (await downloadZip(response)).flatMap((csv) => parsePlaySalesCsv(csv, start, end)) };
  } catch {
    return { month, status: "unavailable" };
  }
}

export async function fetchGooglePlaySales(start: string, end: string): Promise<GoogleSales> {
  const { SWAPSPOT_PLAY_SALES_BUCKET: bucket, SWAPSPOT_PLAY_SALES_CREDENTIALS: credentials } = process.env;
  if (!bucket || !credentials) return { status: "not-configured", months: [] };
  if (!/^pubsite_prod_(?:rev_)?\d+$/.test(bucket)) return { status: "unavailable", months: [] };
  try {
    const auth = await storageAccessToken(credentials);
    if (auth.status !== "available") return { status: auth.status, months: [] };
    const months = [...new Set([end.slice(0, 7), start.slice(0, 7)])];
    return { status: "checked", months: await Promise.all(months.map((month) => fetchMonth(bucket, month, start, end, auth.token))) };
  } catch {
    return { status: "unavailable", months: [] };
  }
}
