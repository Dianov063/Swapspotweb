import fs from "node:fs";

// Run inside the web container. The request stays on loopback; no credentials
// appear in the process arguments or journal. The backend deduplicates by date.
const config = JSON.parse(fs.readFileSync("/run/secrets/swapspot-web.json", "utf8"));
const mode = process.argv.includes("--dry-run") ? "&dryRun=1" : "";
const response = await fetch(`http://127.0.0.1:3000/api/cron/daily-report?force=1${mode}`, {
  headers: { Authorization: `Bearer ${config.CRON_SECRET}` },
  signal: AbortSignal.timeout(120_000),
});
const result = await response.json();
console.log(JSON.stringify({ status: response.status, ok: result.ok, dryRun: result.dryRun, reportDate: result.summary?.reportDate, errors: result.summary?.errors, delivery: result.delivery }));
if (!response.ok || !result.ok) process.exitCode = 1;
