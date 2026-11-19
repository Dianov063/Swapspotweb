# SwapSpot Website

This repository is Dianov063/Swapspotweb (main), the source for swapspot.org.
Mobile applications are in C:/Users/diano/SwapSpot (Dianov063/SwapSpot-mobile).
Keep website routes, SEO, public profiles, legal pages and translations here.
Verify the exact Git remote before editing or deploying.

## Production hosting changed on 2026-11-19

www.swapspot.org and swapspot.org are served by the owned OVH server
deploy@40.160.88.230, /opt/swapspot-web. Vercel Git deployment and Cron Jobs
are disconnected/disabled. A push to main does NOT deploy the public website.

Use appplatform-production-cutover and deploy/appplatform/README.md. Build and
test an immutable Docker image, deploy only the swapspot_web Compose project,
then verify the public route and X-SwapSpot-Origin: ovh. The shared Caddy belongs
to App Platform: validate a complete candidate and preserve unrelated routes.
Do not restart the shared stack or restore Vercel merely because an old note
still names it as the website host.

The daily report is a systemd timer at 11:00 America/New_York. Check the active
timer before touching schedules; the Vercel jobs must remain disabled.
Never print or commit shared/runtime.json or credential values. Use the runtime
allowlist; keep server secrets out of the image and browser build arguments.

## Server monitoring

Owner dashboard: https://www.swapspot.org/admin/server/ (existing admin login).
Source and operating notes: deploy/server-ops/README.md. On OVH, the root
server-ops-collect.timer records all Compose projects every minute; the isolated
server-ops-web container serves history. Netcup has server-ops-external.timer
for independent outage detection. Alert and recovery mail goes only to
dianov063@gmail.com; the server digest is at 11:05 America/New_York.
Keep the existing SwapSpot product report at 11:00. No automatic remediation.
Before retiring a service, update monitor.json ignore_services for its exact
project/service key; do not disable the whole monitor to silence one incident.
Never mount Docker's socket or complete application secrets into the dashboard.

Log confirmed engineering incidents and recurrence checks in
C:/Users/diano/.codex/state/engineering-incidents.md. Follow github-actions-budget
before pushes; run checks locally and batch changes.
