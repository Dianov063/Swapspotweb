"""LedgerHound business checks. No mail, storage writes or provider quota use.

Unknown observations block recovery of the related incident. Stable reason codes
deduplicate alerts even when counts/ages change. Values persisted in the shared
snapshot are strictly allowlisted; paid case IDs and customer data never leave S3.
"""
import datetime as dt
import json
import math
from pathlib import Path
import subprocess
import urllib.request
import time

ORDER_CODES = ('ledgerhound_order_failed', 'ledgerhound_order_manual', 'ledgerhound_order_late')
OFAC_CODES = ('ledgerhound_ofac_stale', 'ledgerhound_ofac_unavailable')
COUNTER_CODES = ('ledgerhound_chainabuse_blocked', 'ledgerhound_chainabuse_exhausted')
ALL_CODES = (*ORDER_CODES, *OFAC_CODES, *COUNTER_CODES, 'ledgerhound_orders_unknown', 'ledgerhound_sources_unknown')
ORIGIN = 'https://www.ledgerhound.vip'


def integer(value):
    return type(value) is int and value >= 0


def number(value):
    return type(value) in (float, int) and math.isfinite(value) and value >= 0


def epoch(value):
    try:
        parsed = dt.datetime.fromisoformat(value.replace('Z', '+00:00'))
        return parsed.timestamp() if parsed.tzinfo is not None else None
    except (ValueError, TypeError, AttributeError, OverflowError):
        return None


def recent(value, now):
    stamp = epoch(value)
    return stamp is not None and -60 <= now - stamp <= 180


def http_orders():
    request = urllib.request.Request(ORIGIN + '/api/health/orders', headers={'Accept': 'application/json'})
    with urllib.request.urlopen(request, timeout=5) as response:
        # Refuse redirects to a provider mirror or login page.
        if response.status != 200 or response.geturl() != request.full_url:
            raise ValueError('orders endpoint unavailable')
        body = response.read(16385)
        if len(body) > 16384:
            raise ValueError('orders response too large')
        return json.loads(body)


def storage_read():
    script = Path(__file__).with_name('ledgerhound-read.cjs').read_text(encoding='utf-8')
    result = subprocess.run(['docker', 'exec', '-i', 'ledgerhound-web', 'node', '-'],
                            input=script, capture_output=True, text=True, timeout=12, check=True)
    if len(result.stdout) > 16384:
        raise ValueError('source response too large')
    return json.loads(result.stdout)


def collect(now, orders_reader=http_orders, source_reader=storage_read):
    out = {'checkedAt': dt.datetime.fromtimestamp(now, dt.timezone.utc).isoformat(), 'orders': None, 'sources': None}
    try:
        row = orders_reader()
        if not isinstance(row, dict):
            raise ValueError('invalid orders')
        out['orders'] = {k: row.get(k) if integer(row.get(k)) else None for k in ('pending', 'failed', 'manualReview')}
        out['orders']['oldestPendingAgeSeconds'] = row.get('oldestPendingAgeSeconds') if number(row.get('oldestPendingAgeSeconds')) else None
        out['orders']['status'] = row.get('status') if row.get('status') in ('ok', 'attention', 'unknown') else None
        stamp = epoch(row.get('checkedAt'))
        out['orders']['checkedAt'] = dt.datetime.fromtimestamp(stamp, dt.timezone.utc).isoformat() if stamp is not None else None
    except Exception:
        pass  # An unavailable observation is unknown, never a healthy zero.
    try:
        row = source_reader()
        if not isinstance(row, dict):
            raise ValueError('invalid sources')
        stamp = epoch(row.get('checkedAt'))
        month = row.get('month')
        out['sources'] = {'checkedAt': dt.datetime.fromtimestamp(stamp, dt.timezone.utc).isoformat() if stamp is not None else None,
                          'month': month if isinstance(month, str) and len(month) == 7 and month[:4].isdigit() and month[4] == '-' and month[5:].isdigit() else None,
                          'maxAgeDays': row.get('maxAgeDays') if number(row.get('maxAgeDays')) else None}
        for name in ('ofac', 'counter'):
            sub = row.get(name)
            if not isinstance(sub, dict):
                out['sources'][name] = None
                continue
            safe = {'state': sub.get('state') if sub.get('state') in ('list', 'counter', 'absent', 'error', 'unreadable') else None}
            for field in ('entries', 'callsUsed'):
                if field in sub:
                    safe[field] = sub[field] if integer(sub[field]) else None
            if name == 'ofac':
                stamp = epoch(sub.get('asOf'))
                safe['asOf'] = dt.datetime.fromtimestamp(stamp, dt.timezone.utc).isoformat() if stamp is not None else None
            out['sources'][name] = safe
    except Exception:
        pass
    return out


def assess(sample, now):
    """Return (findings, recovery-blocked codes); run on each independently collected sample."""
    findings, blocked = [], set()
    def add(code, severity, message, after=2):
        findings.append(dict(code=code, project='ledgerhound', severity=severity, message=message, after=after))

    if not isinstance(sample, dict) or not recent(sample.get('checkedAt'), now):
        add('ledgerhound_monitor_unknown', 'critical', 'Не удалось проверить заказы и источники LedgerHound.', 3)
        return findings, set(ALL_CODES)
    orders = sample.get('orders')
    order_fields = ('pending', 'failed', 'manualReview')
    known = isinstance(orders, dict) and recent(orders.get('checkedAt'), now) \
        and all(integer(orders.get(k)) for k in order_fields) and number(orders.get('oldestPendingAgeSeconds'))
    if known:
        late = orders['pending'] > 0 and orders['oldestPendingAgeSeconds'] > 3600
        attention = orders['failed'] > 0 or orders['manualReview'] > 0 or late
        known = orders.get('status') == ('attention' if attention else 'ok') \
            and (orders['pending'] > 0 or orders['oldestPendingAgeSeconds'] == 0)
    if not known:
        add('ledgerhound_orders_unknown', 'critical', 'Состояние очереди оплаченных заказов не прочитано полностью.', 3)
        blocked.update(ORDER_CODES)
    else:
        if orders['failed']:
            add(ORDER_CODES[0], 'critical', f"Не выданы оплаченные заказы: failed={orders['failed']}. Нужен разбор очереди, не перезапуск web.")
        if orders['manualReview']:
            add(ORDER_CODES[1], 'critical', f"Оплаченные заказы требуют ручного разбора: {orders['manualReview']}.")
        if late:
            add(ORDER_CODES[2], 'critical', f"Заказ ждёт более часа: pending={orders['pending']}, возраст {round(orders['oldestPendingAgeSeconds'] / 60)} мин.")
    sources = sample.get('sources')
    if not isinstance(sources, dict) or not recent(sources.get('checkedAt'), now):
        add('ledgerhound_sources_unknown', 'critical', 'Состояние OFAC и счётчика Chainabuse недоступно.', 3)
        blocked.update((*OFAC_CODES, *COUNTER_CODES))
        return findings, blocked
    ofac = sources.get('ofac')
    as_of = epoch(ofac.get('asOf')) if isinstance(ofac, dict) else None
    maximum = sources.get('maxAgeDays')
    if not isinstance(ofac, dict) or ofac.get('state') != 'list' or not integer(ofac.get('entries')) \
            or ofac['entries'] == 0 or as_of is None or as_of > now + 60 or not number(maximum) or maximum <= 0:
        add(OFAC_CODES[1], 'critical', 'OFAC не читается как непустой список с известной датой.', 3)
        blocked.add(OFAC_CODES[0])
    else:
        age = max(0, (now - as_of) / 86400)
        if age > min(9, maximum):
            add(OFAC_CODES[0], 'critical' if age > maximum else 'warning',
                f'OFAC обновлялся {age:.1f} дней назад; предел приложения {maximum:g} дней. Проверить refresh-ofac.')
    counter = sources.get('counter')
    month = dt.datetime.fromtimestamp(now, dt.timezone.utc).strftime('%Y-%m')
    known = sources.get('month') == month and isinstance(counter, dict) and (
        counter.get('state') == 'absent' or counter.get('state') == 'counter' and integer(counter.get('callsUsed')))
    if not known:
        add(COUNTER_CODES[0], 'critical', 'Счётчик Chainabuse недоступен или некорректен; приложение не вызывает источник.', 3)
        blocked.add(COUNTER_CODES[1])
    elif counter['state'] == 'counter' and counter['callsUsed'] >= 8:
        add(COUNTER_CODES[1], 'warning', f'Лимит Chainabuse за {month} исчерпан (8 доступных вызовов). Источник пропускается до нового месяца.')
    return findings, blocked


if __name__ == '__main__':
    now = time.time()
    sample = collect(now)
    findings, blocked = assess(sample, time.time())
    print(json.dumps({'sample': sample, 'findings': findings, 'blockedRecoveryCodes': sorted(blocked),
                      'readOnly': True, 'emailSent': False}))
