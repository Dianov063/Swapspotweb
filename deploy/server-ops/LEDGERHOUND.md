# LedgerHound F10 operator monitoring

Source belongs to `Dianov063/Swapspotweb`, `deploy/server-ops`, because this is
the shared host collector. LedgerHound application source is independently owned
by `Dianov063/LedgerHound`. It runs on the VPS; Vercel is not a build or release
dependency for either this extension or LedgerHound's normal releases.

## Read-only collection

`ledgerhound.py` reads the existing public `/api/health/orders` and runs
`ledgerhound-read.cjs` through `docker exec -i ledgerhound-web node -`. The
existing application's SDK/key perform exactly two GETs: the OFAC list and this
UTC month's Chainabuse counter. No storage writes, customer IDs, report bodies,
addresses, provider API calls, emails or repair actions are part of collection.
Each S3 operation has a six-second deadline, no SDK retry, and a 2 MiB body cap.
HTTP JSON is capped at 16 KiB. Exceptions are represented as unknown states;
exception text/credentials are not persisted.

Enable in the existing root-protected `monitor.json`, preserving other fields:

```json
{
  "ledgerhound_monitor": {"enabled": true},
  "project_recipients": {"ledgerhound": "owner@example.invalid"}
}
```

Use the owner's actual private address only in server configuration. The sensor
refuses activation without an explicit project recipient. The existing global
recipient remains the destination for other projects and the server digest.

## Conditions

| Condition | Severity | Consecutive bad samples |
|---|---|---|
| Failed paid order, manual review, pending order older than 1 hour | critical | 2 |
| Queue cannot be read completely; missing/stale/inconsistent response | critical | 3 |
| OFAC older than 9 days | warning | 2 |
| OFAC older than the app's configured maximum age (default 16 days) | critical | escalation of the existing stale incident |
| OFAC missing, unreadable, empty, undated or future-dated | critical | 3 |
| Chainabuse monthly counter unreadable/invalid/wrong month | critical | 3 |
| At least 8 Chainabuse slots used this month | warning | 2 |

An absent monthly counter is normal. Configured OFAC age overrides are respected.
The nine-day warning is reduced to the app maximum if that is lower. No live
Chainabuse/GoPlus request is made to assess source availability. An upstream OFAC
mirror returning old content with a new modification date remains outside this
check and is a separate source-provenance task.

The collector runs every minute. One stable incident code produces one initial
mail, optional warning-to-critical escalation, then one recovery after three
confirmed healthy checks. Changing counts do not create more mails. Unknown
orders or source observations block recovery of associated incidents. Removing
or disabling a previously enabled sensor is also unknown, not recovery.

## Durable notification contract

Each notification batch has a 20-second budget with per-request timeout capped
by the remaining time. Later messages stay pending for the next cycle. Combined
with the bounded read checks, this leaves room inside the existing 55-second
collector service limit to save its snapshot/heartbeat.

The outbox gets additive nullable `recipient`, `payload`, `receipt` columns;
existing rows are retained. Project recipient is pinned at queueing. Before the
first send, the exact payload (including date and fallback recipient for legacy
rows) is committed to SQLite. A timeout/restart retries those same bytes with
the same `server-ops:<outbox-key>` idempotency key. MailHub must return a resolved
event with an emailId before the outbox is marked accepted; the emailId is kept.
Suppressed/unsupported/ambiguous responses remain pending. No token or response
body is saved in an error. Existing independent backlog monitoring can detect
stalled admission. API acceptance does not prove MX delivery or Inbox placement.

No web image rebuild is required: the existing dashboard reads the same generic
incident/outbox schema and ignores the added nullable columns. Core's optional
host collector import is lazy, so its existing container import remains valid.

## Operator actions

- Orders: inspect authenticated `/api/admin/orders` and the associated queue
  reason/snapshot. Use the existing manual recovery API after correcting the
  cause. Do not restart a healthy web container or generate replacement facts.
- OFAC: inspect `refresh-ofac` cron results and actual list contents/provenance.
  Do not merely rewrite dates to make old data look current.
- Chainabuse: distinguish legitimate monthly exhaustion from unreadable data or
  IAM/KMS/network failure. Do not reset/delete the counter to bypass the budget.
- Unknown: restore the ability to observe first. It must not close an existing
  failed-order/stale-source incident.
- Notification retry: check the persisted receipt in MailHub by emailId; never
  generate a new idempotency key to get around a lost response.

## Preparation and activation

Run `python -m unittest discover -p 'test_*.py'` and
`node --test test_ledgerhound_read.mjs`. Run the full Python suite on Linux/WSL to
exercise the actual collector lock. `python ledgerhound.py` is a read-only
collection/assessment command and never calls the notification dispatcher.

Install a complete immutable collector source release, compare the live base
and candidate hashes, acquire the existing `state/collector.lock`, preserve the
root-only config and DB with SQLite's backup API, and merge only the two opt-in
settings above. Keep shared cron, proxy, web image and every other project intact.
Switch the collector source atomically and verify its real scheduled samples,
unchanged other probes, recipient routing and any MailHub receipt.

The first rollback step is to set `ledgerhound_monitor.enabled` to false while
retaining the new delivery-compatible dispatcher and per-project recipient.
This stops the added HTTP/S3 collection. Missing sensor observations intentionally
hold old incidents open and can emit one monitoring-unknown incident; they do
not send a false recovery. Preserve the migrated outbox and frozen payloads.
Do not switch to the old dispatcher over new pending notifications: it ignores
pinned recipients/payloads. A full code downgrade requires a reviewed compatible
queue adapter or confirmed drained outbox, not a blind old-source symlink swap.

The owner's LedgerHound complaint digest at 09:00 America/New_York is separate
and unchanged. The existing shared server report remains at 11:05 New York.
