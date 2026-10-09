/** @type {import('next').NextConfig} */

// Password-reset links carry a one-time token in the URL fragment: the page gets
// no analytics, no third-party scripts or beacons, no caching, no referrer.
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
