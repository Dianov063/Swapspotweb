import assert from "node:assert/strict";
import test from "node:test";
import { buildDailyReport, getDailyReportWindow } from "../lib/dailyReport.ts";

test("the owner report uses signup time and build, independently of later device activity", async (t) => {
  const env = { SWAPSPOT_BACKEND: "appplatform", APP_PLATFORM_URL: "https://platform.test",
    APP_PLATFORM_APP_SLUG: "swapspot", APP_PLATFORM_SERVICE_TOKEN: "fixture" };
  const previous = Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]]));
  Object.assign(process.env, env);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  const window = getDailyReportWindow(new Date("2026-11-10T16:00:00Z"));
  let available = true;
  t.mock.method(globalThis, "fetch", async (input, options) => {
    const url = new URL(input);
    if (url.hostname !== "platform.test") throw new Error("Offline test");
    if (url.pathname.endsWith("/admin/registrations")) {
      assert.equal(options.headers.Authorization, "Service fixture");
      assert.equal(url.searchParams.get("start"), window.start.toISOString());
      assert.equal(url.searchParams.get("end"), window.end.toISOString());
      return available ? Response.json([
        { id: "new", created_at: "2026-11-09T21:52:44Z", platform: "android", version: "1.0.31", build: "61" },
      ]) : new Response(null, { status: 503 });
    }
    if (url.pathname.endsWith("/profiles")) return Response.json([
      { id: "new", email: "new@mail.test", full_name: "New", role: "client", created_at: "2026-11-09T22:05:00Z" },
      { id: "legacy", email: "legacy@mail.test", full_name: "Legacy", role: "client", created_at: "2026-11-09T21:10:00Z" },
    ]);
    if (url.pathname.endsWith("/user_directory_activity")) return Response.json([
      { user_id: "new", last_platform: "ios", last_country_code: "US", last_city: "Miami" },
    ]);
    return Response.json([]);
  });
  const report = await buildDailyReport(window);
  assert.match(report.text, /2026-11-09 16:52 \| New \| new@mail\.test \| client \| US \| Miami \| android \| 1\.0\.31 \(61\)/);
  assert.match(report.text, /2026-11-09 16:10 \| Legacy \| legacy@mail\.test \| client \| — \| — \| unknown \| —/);
  assert.match(report.html, /Версия \(сборка\).*1\.0\.31 \(61\)/);
  available = false;
  const fallback = await buildDailyReport(window);
  assert.equal(fallback.summary.registrations, 2);
  assert.match(fallback.text, /не удалось получить данные о сборках при регистрации/);
});
