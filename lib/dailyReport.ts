import { fetchDailyGoogleReport } from "@/lib/googleServerApis";
import { supabaseAdminFetch } from "@/lib/supabaseAdmin";

const REPORT_TIME_ZONE = "America/New_York";

type RecordValue = string | number | null | undefined;
type GenericRow = Record<string, RecordValue>;

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string;
  role: string;
  created_at: string;
};

type ActivityRow = {
  user_id: string;
  last_country_code: string | null;
  last_state: string | null;
  last_city: string | null;
  last_platform: string | null;
};

type HelperRow = { id: string; user_id: string };
type AreaRow = { helper_id: string; country_code: string; city: string; region: string | null; is_primary: boolean };
type ServiceRow = {
  id: string;
  helper_id: string;
  name: string;
  price: number;
  price_type: string;
  currency_code: string | null;
  is_addon: boolean;
  created_at: string;
};

export type DailyReportWindow = {
  reportDate: string;
  start: Date;
  end: Date;
  analyticsDate: string;
  searchStartDate: string;
  searchEndDate: string;
};

function dateInNewYork(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function shiftIsoDate(isoDate: string, days: number) {
  const value = new Date(`${isoDate}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function getDailyReportWindow(now = new Date()): DailyReportWindow {
  const reportDate = dateInNewYork(now);
  const analyticsDate = shiftIsoDate(reportDate, -1);
  const searchEndDate = shiftIsoDate(reportDate, -2);
  return {
    reportDate,
    start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    end: now,
    analyticsDate,
    searchStartDate: shiftIsoDate(searchEndDate, -6),
    searchEndDate,
  };
}

export function isElevenInNewYork(now = new Date()) {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: REPORT_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(now);
  return Number(hour) === 11;
}

async function readJson<T>(path: string): Promise<T> {
  const response = await supabaseAdminFetch(path);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || data?.error || `Supabase request failed (${response.status})`);
  return data as T;
}

function idsFilter(ids: string[]) {
  return `in.(${ids.join(",")})`;
}

function isRealEmail(email: string | null | undefined) {
  return Boolean(email && !email.toLowerCase().endsWith("@example.com"));
}

function primaryArea(areas: AreaRow[], helperId: string) {
  return areas.find((area) => area.helper_id === helperId && area.is_primary)
    || areas.find((area) => area.helper_id === helperId)
    || null;
}

async function fetchProductActivity(window: DailyReportWindow) {
  const start = window.start.toISOString();
  const end = window.end.toISOString();
  const registrations = await readJson<ProfileRow[]>(
    `profiles?select=id,email,full_name,role,created_at&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&order=created_at.asc&limit=1000`,
  );
  const realRegistrations = registrations.filter((profile) => isRealEmail(profile.email));
  const registrationIds = realRegistrations.map((profile) => profile.id);

  const activities = registrationIds.length
    ? await readJson<ActivityRow[]>(`user_directory_activity?select=user_id,last_country_code,last_state,last_city,last_platform&user_id=${encodeURIComponent(idsFilter(registrationIds))}&limit=1000`)
    : [];

  const registrationHelpers = registrationIds.length
    ? await readJson<HelperRow[]>(`helpers?select=id,user_id&user_id=${encodeURIComponent(idsFilter(registrationIds))}&limit=1000`)
    : [];
  const registrationHelperIds = registrationHelpers.map((helper) => helper.id);
  const registrationAreas = registrationHelperIds.length
    ? await readJson<AreaRow[]>(`helper_service_areas?select=helper_id,country_code,city,region,is_primary&helper_id=${encodeURIComponent(idsFilter(registrationHelperIds))}&is_active=eq.true&limit=2000`)
    : [];

  const activityByUser = new Map(activities.map((activity) => [activity.user_id, activity]));
  const helperByUser = new Map(registrationHelpers.map((helper) => [helper.user_id, helper]));
  const registrationRows = realRegistrations.map((profile) => {
    const activity = activityByUser.get(profile.id);
    const helper = helperByUser.get(profile.id);
    const area = helper ? primaryArea(registrationAreas, helper.id) : null;
    return {
      ...profile,
      country: activity?.last_country_code || area?.country_code || "—",
      city: activity?.last_city || area?.city || "—",
      state: activity?.last_state || area?.region || "—",
      platform: activity?.last_platform || "unknown",
    };
  });

  const services = await readJson<ServiceRow[]>(
    `services?select=id,helper_id,name,price,price_type,currency_code,is_addon,created_at&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&order=created_at.asc&limit=2000`,
  );
  const helperIds = [...new Set(services.map((service) => service.helper_id))];
  const helpers = helperIds.length
    ? await readJson<HelperRow[]>(`helpers?select=id,user_id&id=${encodeURIComponent(idsFilter(helperIds))}&limit=2000`)
    : [];
  const helperUserIds = [...new Set(helpers.map((helper) => helper.user_id))];
  const profiles = helperUserIds.length
    ? await readJson<ProfileRow[]>(`profiles?select=id,email,full_name,role,created_at&id=${encodeURIComponent(idsFilter(helperUserIds))}&limit=2000`)
    : [];
  const areas = helperIds.length
    ? await readJson<AreaRow[]>(`helper_service_areas?select=helper_id,country_code,city,region,is_primary&helper_id=${encodeURIComponent(idsFilter(helperIds))}&is_active=eq.true&limit=4000`)
    : [];
  const helperById = new Map(helpers.map((helper) => [helper.id, helper]));
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const serviceRows = services.flatMap((service) => {
    const helper = helperById.get(service.helper_id);
    const profile = helper ? profileById.get(helper.user_id) : null;
    if (!profile || !isRealEmail(profile.email)) return [];
    const area = primaryArea(areas, service.helper_id);
    return [{
      ...service,
      helper_name: profile.full_name,
      helper_email: profile.email,
      country: area?.country_code || "—",
      city: area?.city || "—",
      state: area?.region || "—",
    }];
  });

  return { registrations: registrationRows, services: serviceRows };
}

type BingQueryStat = {
  Query?: string;
  Clicks?: number;
  Impressions?: number;
  AvgClickPosition?: number;
  AvgImpressionPosition?: number;
  Date?: string;
};

async function fetchBingReport() {
  const apiKey = process.env.BING_WEBMASTER_API_KEY;
  const siteUrl = process.env.BING_SITE_URL || "https://www.swapspot.org/";
  if (!apiKey) return { configured: false, siteUrl, queries: [] as BingQueryStat[] };
  const params = new URLSearchParams({ siteUrl, apikey: apiKey });
  const response = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/GetQueryStats?${params}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.Message || data?.message || `Bing Webmaster request failed (${response.status})`);
  const rows = Array.isArray(data?.d) ? data.d as BingQueryStat[] : [];
  const aggregated = new Map<string, BingQueryStat>();
  for (const row of rows) {
    const query = row.Query?.trim();
    if (!query) continue;
    const current = aggregated.get(query) || { Query: query, Clicks: 0, Impressions: 0 };
    current.Clicks = Number(current.Clicks || 0) + Number(row.Clicks || 0);
    current.Impressions = Number(current.Impressions || 0) + Number(row.Impressions || 0);
    current.AvgClickPosition = row.AvgClickPosition;
    current.AvgImpressionPosition = row.AvgImpressionPosition;
    aggregated.set(query, current);
  }
  return {
    configured: true,
    siteUrl,
    queries: [...aggregated.values()].sort((a, b) => Number(b.Impressions || 0) - Number(a.Impressions || 0)).slice(0, 15),
  };
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function number(value: RecordValue) {
  return Number(value || 0);
}

function aggregate<T>(rows: T[], key: (row: T) => string) {
  const counts = new Map<string, number>();
  rows.forEach((row) => counts.set(key(row) || "—", (counts.get(key(row) || "—") || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function renderTable(headers: string[], rows: (string | number)[][]) {
  if (!rows.length) return '<p style="color:#6b7280">Нет новых данных.</p>';
  return `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr>${headers.map((header) => `<th style="text-align:left;padding:8px;border-bottom:2px solid #d1d5db">${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td style="padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top">${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function textTable(title: string, headers: string[], rows: (string | number)[][]) {
  return [`\n${title}`, headers.join(" | "), ...rows.map((row) => row.join(" | "))].join("\n");
}

export async function buildDailyReport(window: DailyReportWindow) {
  const errors: string[] = [];
  const [googleResult, productResult, bingResult] = await Promise.allSettled([
    fetchDailyGoogleReport(window),
    fetchProductActivity(window),
    fetchBingReport(),
  ]);
  const google = googleResult.status === "fulfilled" ? googleResult.value : null;
  const product = productResult.status === "fulfilled" ? productResult.value : { registrations: [], services: [] };
  const bing = bingResult.status === "fulfilled" ? bingResult.value : { configured: false, siteUrl: "https://www.swapspot.org/", queries: [] };
  if (googleResult.status === "rejected") errors.push(`Google: ${String(googleResult.reason)}`);
  if (productResult.status === "rejected") errors.push(`SwapSpot: ${String(productResult.reason)}`);
  if (bingResult.status === "rejected") errors.push(`Bing: ${String(bingResult.reason)}`);

  const registrationCountries = aggregate(product.registrations, (row) => row.country);
  const registrationCities = aggregate(product.registrations, (row) => `${row.city}, ${row.country}`);
  const serviceCountries = aggregate(product.services, (row) => row.country);
  const serviceCities = aggregate(product.services, (row) => `${row.city}, ${row.country}`);
  const gaTotals = google?.ga4.totals || {};
  const searchTotals = (google?.searchConsole.byDate || []).reduce<{ clicks: number; impressions: number }>((totals, row) => ({
    clicks: totals.clicks + number(row.clicks),
    impressions: totals.impressions + number(row.impressions),
  }), { clicks: 0, impressions: 0 });

  const registrationRows = product.registrations.slice(0, 50).map((row) => [row.full_name, row.email || "—", row.role, row.country, row.city, row.platform]);
  const serviceRows = product.services.slice(0, 50).map((row) => [row.helper_name, row.name, `${row.price} ${row.currency_code || ""}`.trim(), row.price_type, row.country, row.city]);
  const locationRows = (google?.ga4.locations || []).slice(0, 15).map((row: GenericRow) => [String(row.country || "—"), String(row.city || "—"), number(row.activeUsers), number(row.sessions)]);
  const searchRows = (google?.searchConsole.queries || []).slice(0, 15).map((row: GenericRow) => [String(row.query || "—"), number(row.clicks), number(row.impressions), `${(number(row.ctr) * 100).toFixed(1)}%`, number(row.position).toFixed(1)]);
  const bingRows = bing.queries.slice(0, 15).map((row) => [row.Query || "—", Number(row.Clicks || 0), Number(row.Impressions || 0), Number(row.AvgImpressionPosition || 0).toFixed(1)]);

  const html = `<!doctype html><html><body style="margin:0;background:#f4f5f2;color:#1f2937;font-family:Arial,sans-serif"><div style="max-width:900px;margin:0 auto;padding:24px"><div style="background:#174d37;color:white;border-radius:16px;padding:24px"><div style="font-size:13px;opacity:.8">ЕЖЕДНЕВНЫЙ ОТЧЁТ</div><h1 style="margin:8px 0 0;font-size:28px">SwapSpot — ${escapeHtml(window.reportDate)}</h1><p style="margin:8px 0 0;opacity:.9">Регистрации и услуги: последние 24 часа · GA4: ${escapeHtml(window.analyticsDate)} · Search Console: ${escapeHtml(window.searchStartDate)}–${escapeHtml(window.searchEndDate)}</p></div>
  <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:16px 0"><div style="background:white;border-radius:12px;padding:18px"><b>Новые регистрации</b><div style="font-size:30px;margin-top:8px">${product.registrations.length}</div></div><div style="background:white;border-radius:12px;padding:18px"><b>Новые услуги</b><div style="font-size:30px;margin-top:8px">${product.services.length}</div></div><div style="background:white;border-radius:12px;padding:18px"><b>GA4 пользователи / сессии</b><div style="font-size:24px;margin-top:8px">${number(gaTotals.activeUsers)} / ${number(gaTotals.sessions)}</div></div><div style="background:white;border-radius:12px;padding:18px"><b>Google Search клики / показы</b><div style="font-size:24px;margin-top:8px">${searchTotals.clicks} / ${searchTotals.impressions}</div></div></div>
  <section style="background:white;border-radius:12px;padding:20px;margin-top:12px"><h2>Регистрации: кто и откуда</h2>${renderTable(["Имя", "Email", "Роль", "Страна", "Город", "Платформа"], registrationRows)}<h3>По странам</h3>${renderTable(["Страна", "Регистрации"], registrationCountries)}<h3>По городам</h3>${renderTable(["Город", "Регистрации"], registrationCities)}</section>
  <section style="background:white;border-radius:12px;padding:20px;margin-top:12px"><h2>Новые услуги в профилях</h2>${renderTable(["Исполнитель", "Услуга", "Цена", "Тип цены", "Страна", "Город"], serviceRows)}<h3>По странам</h3>${renderTable(["Страна", "Услуги"], serviceCountries)}<h3>По городам</h3>${renderTable(["Город", "Услуги"], serviceCities)}</section>
  <section style="background:white;border-radius:12px;padding:20px;margin-top:12px"><h2>Google Analytics: страны и города</h2>${renderTable(["Страна", "Город", "Пользователи", "Сессии"], locationRows)}</section>
  <section style="background:white;border-radius:12px;padding:20px;margin-top:12px"><h2>Google Search Console: запросы</h2>${renderTable(["Запрос", "Клики", "Показы", "CTR", "Позиция"], searchRows)}</section>
  <section style="background:white;border-radius:12px;padding:20px;margin-top:12px"><h2>Bing Webmaster</h2>${bing.configured ? renderTable(["Запрос", "Клики", "Показы", "Позиция"], bingRows) : '<p style="color:#6b7280">Bing API пока не подключён. Добавьте BING_WEBMASTER_API_KEY, и блок заполнится автоматически.</p>'}</section>
  ${errors.length ? `<section style="background:#fff7ed;border:1px solid #fdba74;border-radius:12px;padding:20px;margin-top:12px"><h2>Частичные ошибки</h2><ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul></section>` : ""}
  <p style="color:#6b7280;font-size:12px;margin-top:18px">Автоматический внутренний отчёт SwapSpot. Тестовые аккаунты @example.com исключены.</p></div></body></html>`;

  const text = [
    `SwapSpot — ежедневный отчёт ${window.reportDate}`,
    `Новые регистрации: ${product.registrations.length}`,
    `Новые услуги: ${product.services.length}`,
    `GA4 пользователи / сессии: ${number(gaTotals.activeUsers)} / ${number(gaTotals.sessions)}`,
    `Google Search клики / показы: ${searchTotals.clicks} / ${searchTotals.impressions}`,
    textTable("Регистрации", ["Имя", "Email", "Роль", "Страна", "Город", "Платформа"], registrationRows),
    textTable("Новые услуги", ["Исполнитель", "Услуга", "Цена", "Тип", "Страна", "Город"], serviceRows),
    textTable("GA4: страны и города", ["Страна", "Город", "Пользователи", "Сессии"], locationRows),
    textTable("Google Search Console", ["Запрос", "Клики", "Показы", "CTR", "Позиция"], searchRows),
    bing.configured ? textTable("Bing Webmaster", ["Запрос", "Клики", "Показы", "Позиция"], bingRows) : "\nBing API пока не подключён.",
    errors.length ? `\nЧастичные ошибки:\n${errors.join("\n")}` : "",
  ].join("\n");

  return {
    subject: `SwapSpot: отчёт за ${window.reportDate} — ${product.registrations.length} регистраций, ${product.services.length} услуг`,
    html,
    text,
    summary: {
      reportDate: window.reportDate,
      registrations: product.registrations.length,
      services: product.services.length,
      ga4Users: number(gaTotals.activeUsers),
      ga4Sessions: number(gaTotals.sessions),
      searchClicks: searchTotals.clicks,
      searchImpressions: searchTotals.impressions,
      bingConfigured: bing.configured,
      errors,
    },
  };
}

export async function sendDailyReport(report: Awaited<ReturnType<typeof buildDailyReport>>, reportDate: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.DAILY_REPORT_RECIPIENT;
  const from = process.env.DAILY_REPORT_FROM || "SwapSpot Reports <hello@swapspot.org>";
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  if (!recipient) throw new Error("DAILY_REPORT_RECIPIENT is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `swapspot-daily-report-${reportDate}`,
    },
    body: JSON.stringify({ from, to: [recipient], subject: report.subject, html: report.html, text: report.text }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || `Resend rejected report (${response.status})`);
  return { id: String(data?.id || "") };
}
