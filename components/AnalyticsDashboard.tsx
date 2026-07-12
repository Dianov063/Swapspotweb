"use client";

import { useMemo, useState } from "react";

type Row = Record<string, string | number>;
type InsightItem = {
  title: string;
  metric: string;
  action: string;
};
type Overview = {
  range: { ga4: string; searchConsole: string };
  ga4: {
    totals: Row;
    byDate: Row[];
    byCountry: Row[];
    byCity: Row[];
    bySource: Row[];
    byPage: Row[];
    byDevice: Row[];
    byLanguage: Row[];
  };
  searchConsole: {
    queries: Row[];
    pages: Row[];
    countries: Row[];
    devices: Row[];
    byDate: Row[];
  };
  insights: {
    summary: string[];
    quickWins: InsightItem[];
    lowCtrPages: InsightItem[];
    marketSignals: InsightItem[];
    contentIdeas: InsightItem[];
    deviceMix: InsightItem[];
    languageSignals: InsightItem[];
  };
};

const numberFormatter = new Intl.NumberFormat("en-US");
const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

function formatValue(key: string, value: string | number) {
  if (typeof value === "string") {
    if (key === "date" && /^\d{8}$/.test(value)) {
      return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}`;
    }
    return value || "-";
  }

  if (key === "ctr") return percentFormatter.format(value);
  if (key === "position") return value.toFixed(1);
  return numberFormatter.format(value);
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card-sm border border-line bg-surface p-5 shadow-card-sm">
      <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink-soft">
        {label}
      </div>
      <div className="mt-2 text-[30px] font-extrabold leading-none text-ink">
        {formatValue(label, value)}
      </div>
    </div>
  );
}

function DataTable({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: Row[];
  columns: { key: string; label: string }[];
}) {
  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-head text-[22px] font-bold text-ink">{title}</h2>
        <span className="rounded-full bg-green-soft px-3 py-1 text-[12px] font-bold text-green-deep">
          {rows.length} rows
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-line text-[12px] uppercase tracking-[0.08em] text-ink-soft">
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-3 font-extrabold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.slice(0, 30).map((row, index) => (
                <tr key={index} className="border-b border-line last:border-b-0">
                  {columns.map((column) => (
                    <td key={column.key} className="max-w-[360px] truncate px-3 py-3 text-ink">
                      {formatValue(column.key, row[column.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-6 text-ink-soft" colSpan={columns.length}>
                  No data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InsightList({ title, rows }: { title: string; rows: InsightItem[] }) {
  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-head text-[22px] font-bold text-ink">{title}</h2>
        <span className="rounded-full bg-green-soft px-3 py-1 text-[12px] font-bold text-green-deep">
          {rows.length} items
        </span>
      </div>
      <div className="space-y-3">
        {rows.length ? (
          rows.slice(0, 8).map((row, index) => (
            <div key={`${row.title}-${index}`} className="rounded-card-sm border border-line bg-cream p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-extrabold text-ink">{row.title}</div>
                  <div className="mt-1 text-[13px] font-bold text-green">{row.metric}</div>
                </div>
              </div>
              <div className="mt-3 text-[14px] leading-[1.45] text-ink-soft">{row.action}</div>
            </div>
          ))
        ) : (
          <div className="rounded-card-sm border border-line bg-cream p-4 text-[14px] font-semibold text-ink-soft">
            No signal yet.
          </div>
        )}
      </div>
    </section>
  );
}

export default function AnalyticsDashboard() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [normalizing, setNormalizing] = useState(false);
  const [normalizeResult, setNormalizeResult] = useState("");
  const [error, setError] = useState("");

  const totals = useMemo(() => data?.ga4.totals || {}, [data]);
  const searchTotals = useMemo(() => {
    const dates = data?.searchConsole.byDate || [];
    return dates.reduce(
      (acc: { clicks: number; impressions: number }, row) => ({
        clicks: acc.clicks + Number(row.clicks || 0),
        impressions: acc.impressions + Number(row.impressions || 0),
      }),
      { clicks: 0, impressions: 0 },
    );
  }, [data]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/analytics/overview", {
        headers: { "x-analytics-token": token },
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Analytics request failed");
      }
      setData(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function normalizeServices() {
    setNormalizing(true);
    setNormalizeResult("");
    setError("");
    try {
      const response = await fetch("/api/admin/services/normalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-analytics-token": token,
        },
        body: JSON.stringify({ limit: 25 }),
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Service normalization failed");
      }
      setNormalizeResult(
        `Scanned ${payload.scanned}, updated ${payload.updated}, failed ${payload.failed}.`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown error");
    } finally {
      setNormalizing(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand px-5 py-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-7 flex flex-col gap-4 rounded-card border border-line bg-surface p-6 shadow-card-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-green">
              SwapSpot internal
            </p>
            <h1 className="mt-2 font-head text-[clamp(32px,4vw,48px)] font-bold leading-tight text-ink">
              SEO and Analytics Dashboard
            </h1>
            <p className="mt-2 max-w-[760px] text-[16px] leading-[1.5] text-ink-soft">
              Google Analytics and Search Console data for traffic, countries, pages,
              search queries, devices, and growth strategy.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Analytics API secret"
              className="h-12 min-w-[280px] rounded-full border border-line bg-cream px-4 text-[15px] font-semibold text-ink outline-none focus:border-green"
            />
            <button
              type="button"
              onClick={loadData}
              disabled={loading || !token}
              className="h-12 rounded-full bg-green px-6 text-[15px] font-extrabold text-surface transition hover:bg-green-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "Load data"}
            </button>
            <button
              type="button"
              onClick={normalizeServices}
              disabled={normalizing || !token}
              className="h-12 rounded-full border border-green bg-surface px-6 text-[15px] font-extrabold text-green transition hover:bg-green-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {normalizing ? "Normalizing..." : "AI normalize services"}
            </button>
          </div>
        </div>

        {normalizeResult ? (
          <div className="mb-6 rounded-card-sm border border-[#B7DFC8] bg-green-soft p-4 font-semibold text-green-deep">
            {normalizeResult}
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-card-sm border border-[#F0B8B8] bg-[#FFF4F4] p-4 font-semibold text-[#9B1C1C]">
            {error}
          </div>
        ) : null}

        {data ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <StatCard label="activeUsers" value={totals.activeUsers || 0} />
              <StatCard label="sessions" value={totals.sessions || 0} />
              <StatCard label="screenPageViews" value={totals.screenPageViews || 0} />
              <StatCard label="engagedSessions" value={totals.engagedSessions || 0} />
              <StatCard label="clicks" value={searchTotals.clicks} />
              <StatCard label="impressions" value={searchTotals.impressions} />
            </div>

            <section className="rounded-card border border-line bg-surface p-5 shadow-card-sm">
              <div className="mb-4">
                <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-green">
                  Strategy signals
                </p>
                <h2 className="mt-1 font-head text-[28px] font-bold text-ink">
                  What to work on next
                </h2>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {data.insights.summary.map((item) => (
                  <div key={item} className="rounded-card-sm border border-line bg-cream p-4 text-[15px] font-bold text-ink">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
              <InsightList title="SEO Quick Wins" rows={data.insights.quickWins} />
              <InsightList title="Low CTR Pages" rows={data.insights.lowCtrPages} />
              <InsightList title="Market Signals" rows={data.insights.marketSignals} />
              <InsightList title="Content Ideas" rows={data.insights.contentIdeas} />
              <InsightList title="Language Signals" rows={data.insights.languageSignals} />
              <InsightList title="Device Mix" rows={data.insights.deviceMix} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <DataTable
                title="GA4 Countries"
                rows={data.ga4.byCountry}
                columns={[
                  { key: "country", label: "Country" },
                  { key: "activeUsers", label: "Users" },
                  { key: "sessions", label: "Sessions" },
                  { key: "screenPageViews", label: "Views" },
                ]}
              />
              <DataTable
                title="Search Countries"
                rows={data.searchConsole.countries}
                columns={[
                  { key: "country", label: "Country" },
                  { key: "clicks", label: "Clicks" },
                  { key: "impressions", label: "Impressions" },
                  { key: "ctr", label: "CTR" },
                  { key: "position", label: "Position" },
                ]}
              />
              <DataTable
                title="Search Queries"
                rows={data.searchConsole.queries}
                columns={[
                  { key: "query", label: "Query" },
                  { key: "clicks", label: "Clicks" },
                  { key: "impressions", label: "Impressions" },
                  { key: "ctr", label: "CTR" },
                  { key: "position", label: "Position" },
                ]}
              />
              <DataTable
                title="Search Pages"
                rows={data.searchConsole.pages}
                columns={[
                  { key: "page", label: "Page" },
                  { key: "clicks", label: "Clicks" },
                  { key: "impressions", label: "Impressions" },
                  { key: "ctr", label: "CTR" },
                  { key: "position", label: "Position" },
                ]}
              />
              <DataTable
                title="GA4 Pages"
                rows={data.ga4.byPage}
                columns={[
                  { key: "pagePath", label: "Page" },
                  { key: "activeUsers", label: "Users" },
                  { key: "sessions", label: "Sessions" },
                  { key: "screenPageViews", label: "Views" },
                ]}
              />
              <DataTable
                title="Traffic Sources"
                rows={data.ga4.bySource}
                columns={[
                  { key: "sessionSourceMedium", label: "Source / medium" },
                  { key: "activeUsers", label: "Users" },
                  { key: "sessions", label: "Sessions" },
                  { key: "screenPageViews", label: "Views" },
                ]}
              />
              <DataTable
                title="GA4 Cities"
                rows={data.ga4.byCity}
                columns={[
                  { key: "city", label: "City" },
                  { key: "activeUsers", label: "Users" },
                  { key: "sessions", label: "Sessions" },
                  { key: "screenPageViews", label: "Views" },
                ]}
              />
              <DataTable
                title="Devices"
                rows={data.ga4.byDevice}
                columns={[
                  { key: "deviceCategory", label: "Device" },
                  { key: "activeUsers", label: "Users" },
                  { key: "sessions", label: "Sessions" },
                  { key: "screenPageViews", label: "Views" },
                ]}
              />
              <DataTable
                title="Languages"
                rows={data.ga4.byLanguage}
                columns={[
                  { key: "language", label: "Language" },
                  { key: "activeUsers", label: "Users" },
                  { key: "sessions", label: "Sessions" },
                  { key: "screenPageViews", label: "Views" },
                ]}
              />
              <DataTable
                title="Search Devices"
                rows={data.searchConsole.devices}
                columns={[
                  { key: "device", label: "Device" },
                  { key: "clicks", label: "Clicks" },
                  { key: "impressions", label: "Impressions" },
                  { key: "ctr", label: "CTR" },
                  { key: "position", label: "Position" },
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-card border border-line bg-surface p-8 text-center text-[16px] font-semibold text-ink-soft shadow-card-sm">
            Enter the analytics secret and load the latest 30-day data.
          </div>
        )}
      </div>
    </main>
  );
}
