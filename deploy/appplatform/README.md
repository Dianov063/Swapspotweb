# SwapSpot website on the owned OVH host

Repository: Dianov063/Swapspotweb, main. This moves the website only; mobile API,
databases, storage and mail remain on their existing production services.

## Runtime

- Host: deploy@40.160.88.230; root: /opt/swapspot-web.
- Canonical URL: https://www.swapspot.org; apex redirects with 308.
- One Node 24 standalone container, non-root, 1 CPU, 768 MiB memory, 128 PIDs.
- Shared Caddy joins only the dedicated swapspot_web_edge network. The app has
  no host-published port. Health: /api/health; also verify a live catalog route.
- Protected configuration: shared/runtime.json (mode 0600, owner UID 1000).
  Only runtime-keys.json is loaded. Never commit or print the configuration.
- App Platform backend and credentials, Google Analytics/Search Console/Bing,
  Apple and Play sales credentials remain the same. Public browser configuration
  is compiled into the image. Supabase remains an external legacy reset fallback.
- Vercel CDN response directives do not provide a CDN on OVH. Dynamic detail
  pages keep their shared data cache, while Next's other ISR entries use local
  disk. Data cache tmpfs is capped at 128 MiB; logs at 30 MiB. Check disk growth
  and CPU under real traffic. A second instance requires coordinated caching.
- Caddy strips client-supplied Vercel geographic headers. Until a trusted local
  GeoIP source is configured, the site uses neutral country pricing and asks
  for analytics consent. Country landing pages and mobile registration location
  remain unaffected. Never trust country headers supplied by arbitrary clients.

## Daily report

Install the supplied systemd service and timer only after the app dry-run passes.
The timer runs at 11:00 America/New_York (DST follows the host timezone database),
with Persistent=true. The force flag allows a missed timer to run on recovery;
the service has one active instance and the backend deduplicates by report date.
Preserve the production report recipient. Test with report.mjs --dry-run; never
send an extra real report as a migration probe. Disable the two Vercel crons when
enabling this timer. Inspect: systemctl list-timers swapspot-daily-report.timer.

## Deployment and rollback

Build the Dockerfile locally using only the three public build arguments. Tag
the image with its source commit, export it, hash-check the transfer, then load
it on OVH. Put compose.yml and its nonsecret image setting in releases/<commit>.
Start with docker compose -p swapspot_web --env-file image.env up -d.
Validate health, dynamic pages, assets, noindex/404, admin auth, reports and the
shared proxy before changing DNS. Keep every unrelated DNS and proxy record.

Before the first ingress change, retain shared/Caddyfile.before-cutover and the
complete shared/dns-before.json. Production ingress source is
/opt/app-platform-prod/shared/caddy/Caddyfile. Validate the complete candidate
with the existing Caddy image, then signal only that Caddy process to reload.
Do not restart the shared stack.

Rollback: restore the previous DNS website values (apex A 216.198.79.1 and www
CNAME cname.vercel-dns.com, TTL 300), restore only the SwapSpot proxy block, and
switch the report scheduler back only after stopping the OVH timer. Vercel's
known-good deployment is retained; exhausted free-tier quota may limit its
availability. Do not delete the Vercel project or stateful resources.
