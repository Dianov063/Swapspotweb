"""Small, bounded operational history. No request bodies, IPs or credentials in history."""
import datetime as dt
import hashlib
import hmac
import html
import json
import math
import sqlite3
import time
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo

NY = ZoneInfo("America/New_York")
GIB = 1024 ** 3


def connect(path):
    db = sqlite3.connect(path, timeout=5)
    db.row_factory = sqlite3.Row
    db.executescript("""
    CREATE TABLE IF NOT EXISTS samples(ts INTEGER PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS incidents(id INTEGER PRIMARY KEY, code TEXT, project TEXT,
      opened INTEGER, closed INTEGER, severity TEXT, message TEXT, UNIQUE(code,project,opened));
    CREATE TABLE IF NOT EXISTS counters(key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS outbox(key TEXT PRIMARY KEY, created INTEGER, subject TEXT,
      text TEXT, sent INTEGER, attempts INTEGER DEFAULT 0, last_try INTEGER DEFAULT 0, error TEXT);
    CREATE TABLE IF NOT EXISTS daily(day TEXT, project TEXT, cpu_seconds REAL DEFAULT 0,
      memory_sum REAL DEFAULT 0, memory_peak REAL DEFAULT 0, samples INTEGER DEFAULT 0,
      requests INTEGER DEFAULT 0, errors INTEGER DEFAULT 0, traffic_bytes REAL DEFAULT 0,
      PRIMARY KEY(day,project));
    CREATE TABLE IF NOT EXISTS host_daily(day TEXT PRIMARY KEY, cpu_sum REAL, memory_sum REAL,
      disk_free_min REAL, samples INTEGER);
    """)
    columns = {row[1] for row in db.execute('PRAGMA table_info(outbox)')}
    for name in ('recipient', 'payload', 'receipt'):
        if name not in columns:
            db.execute('ALTER TABLE outbox ADD COLUMN ' + name + ' TEXT')
    return db


def get_value(db, key, default=None):
    row = db.execute("SELECT value FROM counters WHERE key=?", (key,)).fetchone()
    return json.loads(row[0]) if row else default


def put_value(db, key, value):
    db.execute("INSERT OR REPLACE INTO counters VALUES (?,?)", (key, json.dumps(value)))


def queue(db, key, subject, text, now, recipient=None):
    db.execute("INSERT OR IGNORE INTO outbox(key,created,subject,text,recipient) VALUES (?,?,?,?,?)",
               (key, now, subject[:180], text[:45000], recipient))


def service_expectations(containers, previous=None, one_shot=(), ignored=()):
    """Remember daemons; inventory stopped jobs too so old expectations can migrate."""
    expected = dict((previous or {}).get('expected_services', (previous or {}).get('services', {})))
    transient = set((previous or {}).get('one_shot_services', ())) | set(one_shot)
    persistent = {}
    for container in containers:
        labels = container.get('Labels') or {}
        project = labels.get('com.docker.compose.project', 'standalone')
        service = labels.get('com.docker.compose.service', container['Names'][0].lstrip('/'))
        name = project + '/' + service
        image = container.get('Image', '').split('@', 1)[0].split(':', 1)[0]
        buildx = (not labels.get('com.docker.compose.project') and image == 'moby/buildkit'
                  and any(n.lstrip('/').startswith('buildx_buildkit_') for n in container['Names']))
        if str(labels.get('com.docker.compose.oneoff', '')).lower() == 'true' or buildx:
            transient.add(name)
        elif container.get('State', 'running') in ('running', 'paused'):
            persistent[name] = project
    transient.difference_update(persistent)
    expected.update(persistent)
    return {k: v for k, v in expected.items() if k not in transient and k not in ignored}, sorted(transient)


def scheduled_job_status(path, now, max_age_seconds):
    """Store only a sanitized result and age, never backup object names or errors."""
    try:
        status = json.loads(Path(path).read_text())
        stamp = dt.datetime.fromisoformat(status['timestamp'].replace('Z', '+00:00'))
        if stamp.tzinfo is None:
            raise ValueError('timezone required')
        age = now - stamp.timestamp()
        reason = ('failed' if status.get('status') != 'ok' else
                  'invalid_timestamp' if age < -300 else
                  'stale' if age > max_age_seconds else None)
        return {'ok': reason is None, 'reason': reason, 'age_seconds': round(age)}
    except (OSError, ValueError, KeyError, TypeError, AttributeError):
        return {'ok': False, 'reason': 'status_unavailable'}


def evaluate(s, previous, history):
    """Return stable reason codes, without comparing changing byte counts for dedupe."""
    found = []

    def add(code, project, severity, message, after=3):
        found.append(dict(code=code, project=project, severity=severity, message=message, after=after))

    host = s["host"]
    if host["disk_pct"] >= 92 or host["disk_free"] < 5 * GIB:
        add("disk_critical", "host", "critical", "На системном диске менее 5 ГиБ или занято 92%", 1)
    elif host["disk_pct"] >= 85 or host["disk_free"] < 10 * GIB:
        add("disk_low", "host", "warning", "На системном диске менее 10 ГиБ или занято 85%")
    if host["mem_available"] < 512 * 1024 ** 2:
        add("memory_critical", "host", "critical", "Доступно менее 512 МиБ памяти", 2)
    elif host["mem_available"] < GIB:
        add("memory_low", "host", "warning", "Доступно менее 1 ГиБ памяти")
    if host["load"] > host["cores"] * 1.5:
        add("host_load", "host", "warning", "Нагрузка CPU устойчиво превышает число ядер", 5)
    if not s["probes"]["site"]["ok"]:
        add("site_unavailable", "swapspot_web", "critical", "Публичная проверка SwapSpot не проходит", 2)
    if not s["probes"]["platform"]["ok"]:
        add("api_unavailable", "appplatform_prod", "critical", "Проверка готовности общего API не проходит", 2)
    for project, result in s.get('project_probes', {}).items():
        if not result['ok']:
            add('public_unavailable', project, 'critical', 'Публичный адрес проекта не отвечает успешно', 2)
    if s.get("tls_days") is not None and s["tls_days"] < 14:
        add("tls_expiring", "swapspot_web", "critical" if s["tls_days"] < 3 else "warning",
            "Сертификат истекает менее чем через 14 дней", 1)
    old_services = s.get('expected_services',
        previous.get("expected_services", previous.get("services", {})) if previous else {})
    for name, project in old_services.items():
        if name not in s["services"]:
            add("service_missing:" + name, project, "critical", "Исчез ранее работавший сервис " + name, 2)
    for name, job in s.get('scheduled_jobs', {}).items():
        if not job['ok']:
            add('scheduled_job:' + name, job['project'], 'critical',
                'Проблема резервного копирования ' + name + ': ' + job['reason'], 2)
    for p, item in s["projects"].items():
        old_points = [h for h in history if h['ts'] >= s['ts']-900 and p in h['projects']]
        if old_points and item.get('restarts', 0)-old_points[0]['projects'][p].get('restarts',0) >= 3:
            add('restart_loop',p,'critical','Три или более автоматических перезапуска за 15 минут',1)
        if item.get("cpu_limit_pct", 0) > 90:
            add("cpu_near_limit", p, "warning", "CPU проекта устойчиво выше 90% его лимита", 5)
        if item.get("memory_limit_pct", 0) > 90:
            add("memory_near_limit", p, "warning", "Память проекта устойчиво выше 90% лимита")
        if item.get("oom"):
            add("oom", p, "critical", "Контейнер завершён из-за нехватки памяти", 1)
        if item.get("unhealthy"):
            add("container_unhealthy", p, "critical", "Docker сообщает unhealthy", 2)
        if item.get("cache_bytes", 0) > GIB:
            add("cache_large", p, "warning", "Кеш Next.js превысил 1 ГиБ")
        if item.get("data_cache_bytes", 0) > 110 * 1024 ** 2:
            add("data_cache_full", p, "warning", "Кеш данных приближается к лимиту tmpfs")
        recent = [h for h in history if h["ts"] > s["ts"] - 300] + [s]
        req = sum(h["projects"].get(p, {}).get("requests", 0) for h in recent)
        err = sum(h["projects"].get(p, {}).get("errors", 0) for h in recent)
        slow = sum(h["projects"].get(p, {}).get("slow", 0) for h in recent)
        if req >= 20 and err >= 5 and err / req >= .05:
            add("http_5xx", p, "critical" if err / req >= .2 else "warning", "Рост HTTP 5xx за пять минут", 2)
        if req >= 20 and slow / req >= .2:
            add("http_slow", p, "warning", "Более 20% ответов дольше трёх секунд", 3)
        baseline = [h for h in history if s["ts"] - 3600 <= h["ts"] <= s["ts"] - 300]
        if len(baseline) >= 30:
            baseline_rpm = sum(h["projects"].get(p, {}).get("requests", 0) for h in baseline) / len(baseline)
            if req >= 500 and req / 5 > max(100, baseline_rpm * 5):
                redirects = sum(h['projects'].get(p, {}).get('redirects', 0) for h in recent)
                client_errors = sum(h['projects'].get(p, {}).get('client_errors', 0) for h in recent)
                classified = sum(h['projects'].get(p, {}).get('classified_statuses', 0) for h in recent)
                cpu = item.get('cpu_pct')
                cpu_text = f"{cpu:.1f}% одного ядра" if cpu is not None else 'нет замера'
                status_text = (f"HTTP 3xx: {redirects}; 4xx: {client_errors} (статусы учтены для {classified}/{req} запросов).\n"
                               if classified else "Подробная разбивка HTTP-статусов за это окно ещё не накоплена.\n")
                message = (f"Всплеск трафика: {req} запросов за окно около 5 минут; обычный уровень — около {baseline_rpm:.1f} в минуту.\n"
                    f"Последний интервал сбора: {item.get('requests', 0)} запросов. HTTP 5xx за окно: {err}; ответов дольше 3 с: {slow}.\n"
                    + status_text + f"Последний CPU проекта: {cpu_text}.\n"
                    "Это предупреждение об объёме HTTP-трафика. Само по себе оно не подтверждает перегрузку или атаку.")
                add("traffic_spike", p, "warning", message, 3)
    older = [h for h in history if 1800 <= s["ts"] - h["ts"] <= 3900]
    if older:
        base = older[0]
        growth = (base["host"]["disk_free"] - host["disk_free"]) * 3600 / (s["ts"] - base["ts"])
        if growth > GIB:
            add("disk_growth", "host", "warning", "Диск растёт быстрее 1 ГиБ в час")
        for p, item in s["projects"].items():
            old = base["projects"].get(p, {}).get("cache_bytes")
            if old is not None and (item.get("cache_bytes", old) - old) * 3600 / (s["ts"] - base["ts"]) > 256 * 1024 ** 2:
                add("cache_growth", p, "warning", "Кеш растёт быстрее 256 МиБ в час")
    if s.get("report_timer") != "active":
        add("report_timer_disabled", "swapspot_web", "critical", "Отключено расписание ежедневного отчёта", 2)
    if s.get("report_failed"):
        add("report_failed", "swapspot_web", "critical", "Последний запуск ежедневного отчёта завершился ошибкой", 1)
    if s.get("report_late"):
        add("report_late", "swapspot_web", "critical", "После 11:30 нет успешного отчёта за сегодня", 2)
    if s.get("collector_errors"):
        add("collection_incomplete", "monitor", "warning", "Часть показателей недоступна: " + ", ".join(s["collector_errors"]), 2)
    if s.get("log_gap"):
        add("log_collection_gap", "monitor", "warning", "Объём новых access-логов превысил лимит чтения", 1)
    if s.get('external_stale'):
        add('external_watchdog_stale','monitor','critical','Внешний монитор не подтверждал работу более пяти минут',2)
    if 'ledgerhound' in s:
        # web.py imports session helpers from core; the existing dashboard image
        # does not need the optional host-only collector module.
        from ledgerhound import assess as ledgerhound_assess
        business, blocked = ledgerhound_assess(s['ledgerhound'], s['ts'])
        for finding in business:
            finding['blocksRecovery'] = sorted(blocked)
        found.extend(business)
    return found


def transition(db, findings, now, project_recipients=None):
    project_recipients = project_recipients or {}
    blocked = {code + '|' + f['project'] for f in findings for code in f.get('blocksRecovery', [])}
    counters = get_value(db, "streaks", {})
    present = {f['code'] + "|" + f['project']: f for f in findings}
    active = {r['code'] + "|" + r['project']: r for r in db.execute("SELECT * FROM incidents WHERE closed IS NULL")}
    for key, f in present.items():
        count = counters.get(key, {}).get("bad", 0) + 1
        counters[key] = {"bad": count, "good": 0}
        if key not in active and count >= f["after"]:
            cur = db.execute("INSERT INTO incidents(code,project,opened,severity,message) VALUES (?,?,?,?,?)",
                             (f['code'], f['project'], now, f['severity'], f['message']))
            traffic_repeat = f['code']=='traffic_spike' and db.execute(
                "SELECT 1 FROM incidents i JOIN outbox o ON o.key='incident:'||i.id "
                "WHERE i.code='traffic_spike' AND i.project=? AND o.created>? LIMIT 1",
                (f['project'],now-1800)).fetchone()
            if traffic_repeat:
                db.execute("UPDATE incidents SET message=message||? WHERE id=?",
                  ('\nПовторное письмо о скачке трафика ограничено: по этому проекту уже было предупреждение за последние 30 минут.',cur.lastrowid))
            else:
                queue(db, "incident:" + str(cur.lastrowid), "[OVH] " + f['severity'].upper() + ": " + f['project'],
                      "Проект: " + f['project'] + "\nВремя: " + dt.datetime.fromtimestamp(now,NY).strftime('%Y-%m-%d %H:%M %Z') +
                      "\n" + f['message'] + "\nКод: " + f['code'] + "\nДашборд: https://www.swapspot.org/admin/server/", now,
                      project_recipients.get(f['project']))
        elif key in active and f['severity'] == 'critical' and active[key]['severity'] != 'critical':
            db.execute("UPDATE incidents SET severity='critical' WHERE id=?", (active[key]['id'],))
            queue(db, "escalation:" + str(active[key]['id']), "[OVH] CRITICAL: " + f['project'], f['message'], now,
                  project_recipients.get(f['project']))
    for key, row in active.items():
        if key not in present:
            if key in blocked:
                counters[key] = {"bad": 0, "good": 0}
                continue
            good = counters.get(key, {}).get("good", 0) + 1
            counters[key] = {"bad": 0, "good": good}
            if good >= 3:
                db.execute("UPDATE incidents SET closed=? WHERE id=?", (now, row['id']))
                if db.execute('SELECT 1 FROM outbox WHERE key=?',('incident:'+str(row['id']),)).fetchone():
                    queue(db, "recovery:" + str(row['id']), "[OVH] Восстановлено: " + row['project'],
                          'Проект: '+row['project']+'\nПредупреждение закрыто: '+row['code']+
                          '\nПоказатели нормальны три проверки подряд.\nВремя: '+dt.datetime.fromtimestamp(now,NY).strftime('%Y-%m-%d %H:%M %Z')+
                          '\nДашборд: https://www.swapspot.org/admin/server/',now,
                          project_recipients.get(row['project']))
    put_value(db, "streaks", {k: v for k, v in counters.items() if k in present or k in active})


def save_sample(db, sample):
    now = sample['ts']
    db.execute("INSERT OR REPLACE INTO samples VALUES (?,?)", (now, json.dumps(sample)))
    day = dt.datetime.fromtimestamp(now, NY).date().isoformat()
    host = sample['host']
    db.execute("""INSERT INTO host_daily VALUES (?,?,?,?,1) ON CONFLICT(day) DO UPDATE SET
      cpu_sum=cpu_sum+excluded.cpu_sum,memory_sum=memory_sum+excluded.memory_sum,
      disk_free_min=MIN(disk_free_min,excluded.disk_free_min),samples=samples+1""",
      (day,host.get('cpu_pct') or 0,host['mem_total']-host['mem_available'],host['disk_free']))
    for project, p in sample['projects'].items():
        db.execute("""INSERT INTO daily VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(day,project) DO UPDATE SET
          cpu_seconds=cpu_seconds+excluded.cpu_seconds,memory_sum=memory_sum+excluded.memory_sum,
          memory_peak=MAX(memory_peak,excluded.memory_peak),samples=samples+1,
          requests=requests+excluded.requests,errors=errors+excluded.errors,traffic_bytes=traffic_bytes+excluded.traffic_bytes""",
          (day, project, p.get('cpu_seconds', 0), p.get('memory', 0), p.get('memory', 0), 1,
           p.get('requests', 0), p.get('errors', 0), p.get('response_bytes', 0)))
    db.execute("DELETE FROM samples WHERE ts<?", (now - 7 * 86400,))
    db.execute("DELETE FROM daily WHERE day<?", ((dt.datetime.fromtimestamp(now, NY).date() - dt.timedelta(days=365)).isoformat(),))
    db.execute("DELETE FROM host_daily WHERE day<?", ((dt.datetime.fromtimestamp(now, NY).date() - dt.timedelta(days=365)).isoformat(),))
    db.execute("DELETE FROM incidents WHERE closed IS NOT NULL AND closed<?", (now-365*86400,))
    db.execute("DELETE FROM outbox WHERE sent IS NOT NULL AND created<?", (now - 30 * 86400,))


def mail_payload(subject, text, recipient, day):
    return {"event": "admin.daily_report", "recipient": {"email": recipient},
            "messageCategory": "admin_report", "data": {"recipientName": "Dmitry", "reportSubject": subject,
            "reportHtml": "<pre style='white-space:pre-wrap'>" + html.escape(text) + "</pre>",
            "reportText": text, "reportDate": day}}


def deliver(db, config, now, transport=None, budget_seconds=20):
    if not config.get('notifications_enabled'):
        return
    deadline = time.monotonic() + budget_seconds
    pending = list(db.execute("SELECT * FROM outbox WHERE sent IS NULL AND (last_try=0 OR last_try<?) ORDER BY created LIMIT 5", (now - 300,)))
    for row in pending:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            break  # Keep later messages pending; leave time for the collector's snapshot/heartbeat.
        payload = row['payload']
        if payload is None:
            payload = json.dumps(mail_payload(row['subject'], row['text'], row['recipient'] or config['recipient'],
                                 dt.datetime.fromtimestamp(row['created'], NY).date().isoformat()))
            db.execute('UPDATE outbox SET payload=? WHERE key=? AND payload IS NULL', (payload, row['key']))
            # Durable before the first possible external acceptance, including a lost response.
            db.commit()
        body = payload.encode()
        request = urllib.request.Request(config['mailhub_url'].rstrip('/') + '/api/v1/events', data=body,
          headers={'Authorization': 'Bearer ' + config['mailhub_key'], 'Content-Type': 'application/json',
                   'Idempotency-Key': 'server-ops:' + row['key']}, method='POST')
        try:
            if transport:
                receipt = transport(request)
            else:
                with urllib.request.urlopen(request, timeout=min(8, remaining)) as response:
                    if response.status not in (200, 201, 202):
                        raise RuntimeError('MailHub response ' + str(response.status))
                    raw = response.read(16385)
                    if len(raw) > 16384:
                        raise ValueError('MailHub receipt too large')
                    receipt = json.loads(raw)
            if not isinstance(receipt, dict) or receipt.get('status') != 'resolved' \
                    or not isinstance(receipt.get('emailId'), str) or not receipt['emailId'].strip():
                raise ValueError('MailHub admission not confirmed')
            db.execute("UPDATE outbox SET sent=?,attempts=attempts+1,last_try=?,error=NULL,receipt=? WHERE key=?",
                       (now, now, receipt['emailId'], row['key']))
        except Exception as exc:
            # Never persist response bodies or request headers containing a credential.
            db.execute("UPDATE outbox SET attempts=attempts+1,last_try=?,error=? WHERE key=?", (now, type(exc).__name__, row['key']))


def digest(db, now):
    date = dt.datetime.fromtimestamp(now, NY)
    if (date.hour, date.minute) < (11, 5):
        return
    day = (date.date() - dt.timedelta(days=1)).isoformat()
    rows = list(db.execute('SELECT * FROM daily WHERE day=? ORDER BY cpu_seconds DESC', (day,)))
    if not rows:
        day=date.date().isoformat()
        rows=list(db.execute('SELECT * FROM daily WHERE day=? ORDER BY cpu_seconds DESC',(day,)))
        if not rows:return  # never claim an unobserved day had zero use
    lines = ['Сервер OVH: история за ' + day + ' (America/New_York).',
             'CPU — измеренные секунды контейнеров; память — средняя/пик. Общий API нельзя честно разделить по тенантам.', '']
    for r in rows:
        lines.append(f"{r['project']}: CPU {r['cpu_seconds']/60:.1f} мин; RAM {r['memory_sum']/r['samples']/1024**2:.0f}/{r['memory_peak']/1024**2:.0f} МиБ; запросов {r['requests']}; 5xx {r['errors']}; измерений {r['samples']}.")
    incidents = list(db.execute('SELECT code,project FROM incidents WHERE closed IS NULL'))
    lines += ['', 'Активных предупреждений: ' + str(len(incidents))]
    lines += [r['project'] + ': ' + r['code'] for r in incidents]
    lines += ['', 'Первый и неполные дни содержат только фактически собранные измерения.',
              'https://www.swapspot.org/admin/server/']
    queue(db, 'digest:' + date.date().isoformat(), '[OVH] Статистика всех проектов за ' + day, '\n'.join(lines), now)


def signed_session(secret, expiry):
    payload = 'admin:' + str(expiry)
    import base64
    sig = base64.urlsafe_b64encode(hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()).decode().rstrip('=')
    return str(expiry) + '.' + sig


def valid_session(value, secret, now=None):
    try:
        exp, sig = value.split('.')
        expiry = int(exp)
        return expiry > (time.time() if now is None else now) and hmac.compare_digest(value, signed_session(secret, expiry))
    except (ValueError, TypeError):
        return False
