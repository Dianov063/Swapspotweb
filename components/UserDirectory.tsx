"use client";

import { useState } from "react";

type UserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  role: string;
  created_at: string;
  last_platform: "ios" | "android" | "web" | "unknown";
  country_code: string | null;
  state: string | null;
  city: string | null;
  last_seen_at: string | null;
};

const PAGE_SIZE = 100;

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function sourceLabel(source: UserRow["last_platform"]) {
  if (source === "ios") return "iOS";
  if (source === "android") return "Android";
  if (source === "web") return "Website";
  return "Unknown";
}

export default function UserDirectory() {
  const [token, setToken] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [includeTest, setIncludeTest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadUsers(nextPage = 1) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        platform,
        state,
        city,
        search,
        sort,
        includeTest: String(includeTest),
      });
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: { "x-analytics-token": token },
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Could not load users");
      setUsers(payload.users);
      setTotal(payload.total);
      setPage(payload.page);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const firstResult = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(page * PAGE_SIZE, total);

  return (
    <main className="min-h-screen bg-sand px-5 py-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="rounded-card border border-line bg-surface p-6 shadow-card-sm">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-green">SwapSpot internal</p>
          <div className="mt-2 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="font-head text-[clamp(32px,4vw,48px)] font-bold leading-tight text-ink">User directory</h1>
              <p className="mt-2 max-w-[760px] text-[16px] leading-[1.5] text-ink-soft">
                Registered users, sorted and filtered by signup date, location, and latest platform.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Admin API secret"
                className="h-12 min-w-[280px] rounded-full border border-line bg-cream px-4 text-[15px] font-semibold text-ink outline-none focus:border-green"
              />
              <button
                type="button"
                onClick={() => loadUsers(1)}
                disabled={!token || loading}
                className="h-12 rounded-full bg-green px-6 text-[15px] font-extrabold text-surface transition hover:bg-green-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading..." : "Load users"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, phone" className="h-11 rounded-card-sm border border-line bg-cream px-3 text-[14px] font-semibold text-ink outline-none focus:border-green" />
            <select value={platform} onChange={(event) => setPlatform(event.target.value)} className="h-11 rounded-card-sm border border-line bg-cream px-3 text-[14px] font-semibold text-ink outline-none focus:border-green">
              <option value="">All platforms</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
              <option value="web">Website</option>
              <option value="unknown">Unknown</option>
            </select>
            <input value={state} onChange={(event) => setState(event.target.value)} placeholder="State / region" className="h-11 rounded-card-sm border border-line bg-cream px-3 text-[14px] font-semibold text-ink outline-none focus:border-green" />
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="h-11 rounded-card-sm border border-line bg-cream px-3 text-[14px] font-semibold text-ink outline-none focus:border-green" />
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 rounded-card-sm border border-line bg-cream px-3 text-[14px] font-semibold text-ink outline-none focus:border-green">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="state">State A–Z</option>
              <option value="city">City A–Z</option>
              <option value="platform">Platform A–Z</option>
            </select>
            <label className="flex h-11 items-center gap-2 rounded-card-sm border border-line bg-cream px-3 text-[13px] font-bold text-ink-soft">
              <input type="checkbox" checked={includeTest} onChange={(event) => setIncludeTest(event.target.checked)} />
              Include seeded/test
            </label>
          </div>
          <button type="button" onClick={() => loadUsers(1)} disabled={!token || loading} className="mt-3 text-[14px] font-extrabold text-green disabled:opacity-50">
            Apply filters
          </button>
        </section>

        {error ? <div className="mt-6 rounded-card-sm border border-[#F0B8B8] bg-[#FFF4F4] p-4 font-semibold text-[#9B1C1C]">{error}</div> : null}

        <section className="mt-6 overflow-hidden rounded-card border border-line bg-surface shadow-card-sm">
          <div className="flex flex-col gap-2 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-head text-[24px] font-bold text-ink">Users</h2>
            <span className="text-[13px] font-bold text-ink-soft">
              {total ? `${firstResult}–${lastResult} of ${total}` : "Load the directory to view users"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-[14px]">
              <thead><tr className="border-b border-line bg-cream text-[12px] uppercase tracking-[0.08em] text-ink-soft">
                <th className="px-5 py-3 font-extrabold">User</th><th className="px-4 py-3 font-extrabold">Role</th><th className="px-4 py-3 font-extrabold">City</th><th className="px-4 py-3 font-extrabold">State</th><th className="px-4 py-3 font-extrabold">Source</th><th className="px-4 py-3 font-extrabold">Joined</th><th className="px-5 py-3 font-extrabold">Last seen</th>
              </tr></thead>
              <tbody>{users.length ? users.map((user) => (
                <tr key={user.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-4"><div className="font-extrabold text-ink">{user.full_name || "Unnamed user"}</div><div className="mt-1 text-[13px] font-semibold text-ink-soft">{user.email || user.phone || user.id}</div></td>
                  <td className="px-4 py-4 font-semibold text-ink">{user.role}</td><td className="px-4 py-4 text-ink">{user.city || "—"}</td><td className="px-4 py-4 text-ink">{user.state || "—"}</td>
                  <td className="px-4 py-4"><span className="rounded-full bg-green-soft px-3 py-1 text-[12px] font-extrabold text-green-deep">{sourceLabel(user.last_platform)}</span></td>
                  <td className="px-4 py-4 text-ink-soft">{formatDate(user.created_at)}</td><td className="px-5 py-4 text-ink-soft">{formatDate(user.last_seen_at)}</td>
                </tr>
              )) : <tr><td colSpan={7} className="px-5 py-10 text-center font-semibold text-ink-soft">{loading ? "Loading users..." : "No users match these filters."}</td></tr>}</tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-line p-4">
            <button type="button" onClick={() => loadUsers(page - 1)} disabled={!token || loading || page <= 1} className="rounded-full border border-green px-5 py-2 text-[14px] font-extrabold text-green disabled:cursor-not-allowed disabled:opacity-45">Previous</button>
            <span className="text-[13px] font-bold text-ink-soft">Page {page}</span>
            <button type="button" onClick={() => loadUsers(page + 1)} disabled={!token || loading || lastResult >= total} className="rounded-full border border-green px-5 py-2 text-[14px] font-extrabold text-green disabled:cursor-not-allowed disabled:opacity-45">Next</button>
          </div>
        </section>
      </div>
    </main>
  );
}
