"use client";

import { useState } from "react";
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
  const [token, setToken] = useState("");

  return (
    <main className="min-h-screen bg-sand">
      <header className="border-b border-line bg-surface px-5 py-5 shadow-card-sm">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-green">SwapSpot internal</p>
            <h1 className="mt-1 font-head text-[30px] font-bold text-ink">Admin panel</h1>
          </div>
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Admin API secret"
            className="h-11 w-full rounded-full border border-line bg-cream px-4 text-[15px] font-semibold text-ink outline-none focus:border-green xl:w-[320px]"
          />
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

      {activeTab === "users" ? <UserDirectory embedded token={token} onTokenChange={setToken} /> : null}
      {activeTab === "support" ? <SupportInbox embedded token={token} onTokenChange={setToken} /> : null}
      {activeTab === "analytics" ? <AnalyticsDashboard embedded token={token} onTokenChange={setToken} /> : null}
    </main>
  );
}
