# OVH Server Ops

LedgerHound F10 extension: see [LEDGERHOUND.md](LEDGERHOUND.md). It is opt-in;
configuration/activation is separate from preparing this source. Existing public
probes and other projects' notifications continue to use their current settings.

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
  Repeated volume-only traffic episodes are all recorded, with at most one new
  warning email per project per 30 minutes. Errors and resource alerts retain
  their immediate independent notification rules. Recovery mail names the closed
  code instead of repeating the original warning as if it were still happening.
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
- Docker Compose `oneoff=True` tasks keep their resource measurements but are
  excluded from permanent service expectations. Their identity is remembered
  after `run --rm` removes the container. A normal daemon with the same identity
  restores the permanent expectation. `one_shot_services` in monitor.json may
  migrate only jobs independently confirmed from their scheduler/configuration;
  do not exclude all services with restart=no or names containing backup.
- On-demand Buildx workers are identified by both a `buildx_buildkit_` name and
  the official `moby/buildkit` image, without Compose project ownership. Stopped
  containers are inventoried for classification and migration of old expectations;
  CPU/RAM measurements still include only running/paused containers. Stopped
  ordinary daemons remain missing; historical stopped containers are not learned
  as new requirements. Build success must be checked through the build/deploy job,
  not inferred from the worker exiting or a healthy public site.
- The two AppPlatform backup jobs are checked through their existing sanitized
  status files, with a seven-hour maximum age for the six-hour schedule. A failed,
  missing, invalid, future-dated or stale status raises `scheduled_job:<name>`.
  Container completion is not backup failure; status=ok does not constitute a
  restore drill. Original backup schedules, scripts and stored backups are untouched.

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
