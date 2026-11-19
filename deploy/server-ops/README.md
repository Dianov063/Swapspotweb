# OVH Server Ops

Read-only dashboard: https://www.swapspot.org/admin/server/ . Uses the existing
SwapSpot owner admin password/session; creates no public access to metrics.
It is a separate small service, not a new Next.js build or a database migration.

- OVH /opt/server-ops; immutable code releases/current symlink; root collector
  server-ops-collect.timer every 60 seconds. No remediation, deletion or restarts.
- Web container server-ops-web (Compose server_ops), non-root/read-only, 0.25 CPU,
  96 MiB, no public port; private server_ops_edge network shared with Caddy.
- state/history.db: 7 days minute samples; 365 days daily statistics and incident
  history. Pending notifications are durable; sent outbox receipts retained 30 days.
- Logs: /data/server-ops/<project>.log in existing Caddy data volume; 5 MiB plus
  two rolled copies per ingress project. No request object, headers, IP, query,
  cookies, message bodies or response headers. Only coarse route groups retained.
- CPU uses measured Docker counter deltas, not latency as a proxy. 100% means one
  CPU core. Memory is working set. Shared APIs/DBs remain in AppPlatform; no false
  per-tenant CPU allocation. Volume sizes are staggered and may initially be partial.
- Root disk warn 85% or <10 GiB; critical 92% or <5 GiB. Memory warn <1 GiB,
  critical <512 MiB. CPU near configured limits sustained 5 samples; memory 3.
  HTTP/API failure 2 samples; 5xx/slow warnings require meaningful traffic.
  Disk growth >1 GiB/hour and Next cache growth >256 MiB/hour require a real
  baseline. Stable reason codes suppress repeated mail; 3 good checks recover.
- Emails to dianov063@gmail.com through the existing scoped MailHub integration
  and admin.daily_report mapping. No API key rotation or provider policy changes.
  Notification retries reuse an incident-scoped Idempotency-Key. API acceptance
  is recorded separately from recipient MX delivery/inbox placement.
- Server digest: 11:05 America/New_York, prior calendar day when available. The
  first day is explicitly partial. It is separate from the SwapSpot product report.
- Netcup /opt/server-ops-external checks the public site/API and protected collector
  heartbeat each minute. Three failures notify from its already configured local
  DKIM-signed Kumo relay, so total OVH/MailHub outage cannot suppress that warning.
  It posts sanitized status back to the dashboard; no SMTP listener/DNS/routing
  policies are changed. Ambiguous injection timeouts are not blindly retried.
- Each public project address is also probed; an HTTP failure is detected even
  when its containers stay running. OVH alerts if the independent monitor stops
  posting for five minutes. Daily history has 30/90/365-day views and CSV export.

Secrets: shared/auth.json has only admin_key and watch_token (UID 1000, 0600);
shared/monitor.json has only scoped MailHub key/base, recipient and nonsecret
paths/flags (root, 0600). External shared/config.json has a health-read token and
the fixed owner recipient. Never commit, print, export to the browser or mount
the original complete SwapSpot runtime credentials into this dashboard.

Validate: python -m unittest discover -s deploy/server-ops -p test_ops.py;
node --check deploy/server-ops/app.js; validate full Caddy config before reload.
Synthetic tests use .invalid addresses and mocked transports. Do not manufacture
a production outage to test email; an extra real test message needs its own send
authorization. The server records submission acceptance, not mailbox placement.

Retirement: disable only server-ops-collect.timer / server-ops-external.timer and
stop only server-ops-web; remove only this dashboard's Caddy handlers/imports.
Do not turn off existing AppPlatform monitor or unrelated service timers.
