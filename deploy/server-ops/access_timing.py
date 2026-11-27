"""Privacy-safe aggregate timings; unavailable is not a zero latency."""
import math


def number(value):
    if type(value) not in (int, float, str) or value == '':
        return None
    try:
        n = float(value)
        return n if math.isfinite(n) and n >= 0 else None
    except ValueError:
        return None


def observe(target, row):
    stats = target.setdefault('timing', {})
    values = {'upstream_headers_ms': number(row.get('upstream_headers_ms')),
              'proxy_inclusive_ms': number(row.get('proxy_inclusive_ms')),
              'request_duration_ms': number(row.get('duration'))}
    if values['request_duration_ms'] is not None:
        values['request_duration_ms'] *= 1000
    for key, value in values.items():
        metric = stats.setdefault(key, {'observed': 0, 'unavailable': 0, 'sum': 0, 'max': None})
        if value is None:
            metric['unavailable'] += 1
        else:
            metric['observed'] += 1
            metric['sum'] += value
            metric['max'] = value if metric['max'] is None else max(metric['max'], value)
    headers, total = values['upstream_headers_ms'], values['request_duration_ms']
    # Slow completion after fast headers can be upstream-body or downstream work.
    if headers is not None and total is not None and total > 3000 and headers <= 3000:
        stats['slow_after_headers'] = stats.get('slow_after_headers', 0) + 1
