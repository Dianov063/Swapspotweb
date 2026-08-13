"use client";

import { FormEvent, useEffect, useState } from "react";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import SupportInbox from "@/components/SupportInbox";
import UserDirectory from "@/components/UserDirectory";

export type AdminTab = "users" | "support" | "analytics";

const tabs: { id: AdminTab; label: string; description: string }[] = [
  { id: "users", label: "Users", description: "Directory, platform, city, and state" },
  { id: "support", label: "Support", description: "Read and reply to app questions" },
  { id: "analytics", label: "Analytics", description: "Traffic, SEO, and service cleanup" },
];

export default function AdminConsole({ initialTab = "users" }: { initialTab?: AdminTab }) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => setAuthenticated(Boolean(payload.authenticated)))
      .catch(() => setAuthenticated(false))
      .finally(() => setCheckingSession(false));
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not sign in");
      setPassword("");
      setAuthenticated(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST", cache: "no-store" });
    setAuthenticated(false);
    setPassword("");
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sand px-5 py-10">
        <form onSubmit={signIn} className="w-full max-w-[420px] rounded-card border border-line bg-surface p-7 shadow-card-sm">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-green">SwapSpot internal</p>
          <h1 className="mt-2 font-head text-[30px] font-bold text-ink">Admin sign in</h1>
          <p className="mt-2 text-[15px] leading-6 text-ink-soft">Enter the admin password to open users, Support, and analytics.</p>
          <label className="mt-6 block text-[14px] font-extrabold text-ink" htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={checkingSession || submitting}
            className="mt-2 h-12 w-full rounded-full border border-line bg-cream px-4 text-[16px] font-semibold text-ink outline-none focus:border-green"
          />
          {error ? <p className="mt-3 text-[14px] font-semibold text-red-700">{error}</p> : null}
          <button type="submit" disabled={checkingSession || submitting || !password} className="mt-6 h-12 w-full rounded-full bg-green px-6 text-[15px] font-extrabold text-surface transition hover:bg-green-deep disabled:cursor-not-allowed disabled:opacity-60">
            {checkingSession ? "Checking access..." : submitting ? "Signing in..." : "Open admin panel"}
          </button>
        </form>
      </main>
    );
  }

  const sessionToken = "authenticated-session";

  return (
    <main className="min-h-screen bg-sand">
      <header className="border-b border-line bg-surface px-5 py-5 shadow-card-sm">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-green">SwapSpot internal</p>
            <h1 className="mt-1 font-head text-[30px] font-bold text-ink">Admin panel</h1>
          </div>
          <button type="button" onClick={signOut} className="h-11 rounded-full border border-green bg-surface px-5 text-[14px] font-extrabold text-green transition hover:bg-green-soft">Sign out</button>
        </div>
        <nav className="mx-auto mt-5 flex max-w-[1500px] gap-2 overflow-x-auto" aria-label="Admin sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-[190px] rounded-card-sm border px-4 py-3 text-left transition ${
                activeTab === tab.id ? "border-green bg-green text-white" : "border-line bg-cream text-ink hover:border-green"
              }`}
            >
              <div className="text-[15px] font-extrabold">{tab.label}</div>
              <div className={`mt-1 text-[12px] font-semibold ${activeTab === tab.id ? "text-white/75" : "text-ink-soft"}`}>{tab.description}</div>
            </button>
          ))}
        </nav>
      </header>

      {activeTab === "users" ? <UserDirectory embedded token={sessionToken} /> : null}
      {activeTab === "support" ? <SupportInbox embedded token={sessionToken} /> : null}
      {activeTab === "analytics" ? <AnalyticsDashboard embedded token={sessionToken} /> : null}
    </main>
  );
}
