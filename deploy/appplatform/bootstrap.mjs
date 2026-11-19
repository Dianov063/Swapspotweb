import fs from "node:fs";

const allowed = JSON.parse(fs.readFileSync(new URL("./runtime-keys.json", import.meta.url)));
const values = JSON.parse(fs.readFileSync(process.env.SWAPSPOT_RUNTIME_CONFIG || "/run/secrets/swapspot-web.json", "utf8"));
for (const key of allowed) {
  if (typeof values[key] === "string") process.env[key] = values[key];
}
for (const key of ["APP_PLATFORM_SERVICE_TOKEN", "ANALYTICS_API_SECRET", "CRON_SECRET"]) {
  if (!process.env[key] || process.env[key] === "[REDACTED]") throw new Error(`Missing runtime configuration: ${key}`);
}
if (process.env.SWAPSPOT_BACKEND !== "appplatform") throw new Error("This production host requires the App Platform backend");
await import("./server.js");
