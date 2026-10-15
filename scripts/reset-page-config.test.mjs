import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";

// Loads next.config.js in a fresh process with the given environment.
function loadConfig(env) {
  const script = "const c = require('./next.config.js'); c.headers().then((h) => console.log(JSON.stringify(h)))";
  return JSON.parse(execFileSync(process.execPath, ["-e", script], {
    env: { PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  }).toString());
}

test("a production build without the public Supabase anon key fails", () => {
  assert.throws(() => loadConfig({ VERCEL_ENV: "production" }), /NEXT_PUBLIC_SUPABASE_ANON_KEY is required/);
});

test("preview and local builds do not need it; production with it builds", () => {
  assert.ok(loadConfig({ VERCEL_ENV: "preview" }));
  assert.ok(loadConfig({}));
  assert.ok(loadConfig({ VERCEL_ENV: "production", NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-test" }));
});

test("/auth pages get the CSP and privacy headers; connect-src follows the configured APIs", () => {
  const [rule] = loadConfig({ NEXT_PUBLIC_APP_PLATFORM_URL: "https://platform.example/" });
  assert.equal(rule.source, "/auth/:path*");
  const h = Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
  assert.match(h["Content-Security-Policy"], /connect-src 'self' https:\/\/hoohhuqgyaifjglfzanx\.supabase\.co https:\/\/platform\.example;/);
  assert.match(h["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.doesNotMatch(h["Content-Security-Policy"], /googletagmanager|google-analytics/);
  assert.equal(h["Cache-Control"], "no-store, max-age=0");
  assert.equal(h["Referrer-Policy"], "no-referrer");
  assert.equal(h["X-Frame-Options"], "DENY");
  assert.equal(h["X-Robots-Tag"], "noindex, nofollow");
});
