/** @type {import('next').NextConfig} */

// Password-reset links carry a one-time token in the URL fragment: the page gets
// no analytics, no third-party scripts or beacons, no caching, no referrer.
// The reset form reads the public Supabase anon key in the browser (inlined at build
// time). Without it every Supabase recovery link shows "unavailable", so a production
// build must not go out without it (server-only SUPABASE_* variables are not enough).
if (process.env.VERCEL_ENV === "production" && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required for the /auth/reset-password page in production builds.");
}
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hoohhuqgyaifjglfzanx.supabase.co").replace(/\/$/, "");
const platformUrl = (process.env.NEXT_PUBLIC_APP_PLATFORM_URL || "").replace(/\/$/, "");
const resetPageCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseUrl}${platformUrl ? ` ${platformUrl}` : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/auth/:path*",
        headers: [
          { key: "Content-Security-Policy", value: resetPageCsp },
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
