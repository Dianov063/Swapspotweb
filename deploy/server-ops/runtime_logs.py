"""Bounded, count-only runtime observations. No raw logs enter history or mail."""
import datetime as dt
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor

TARGETS = {'towhub_web': 'towhub-web', 'ledgerhound': 'ledgerhound-web'}
COUNTERS = ('cache_write_errors', 'invalid_action_ids', 'missing_server_actions',
            'origin_rejections', 'other_error_lines')
ERROR_CODES = ('runtime_cache_write', 'runtime_exceptions')
LIMIT = 5000
WINDOW = '5m'
FIELDS = {'collection_ok', 'window', *COUNTERS, 'lines_examined', 'at_line_limit'}
PATTERNS = (
    r'Failed to update prerender cache|Failed to set Next\.js data cache|Failed to write image to cache',
    r'(?i)Invalid Server Reference ID|Server Reference ID did not match the expected format',
    r'Failed to find Server Action',
    r'Aborting the action|Invalid Server Actions request',
    r'^\s*(?:[⨯×]\s*)?(?:Error|TypeError|RangeError|SyntaxError|ReferenceError):|'
    r'uncaughtException|unhandledRejection|\b(?:EROFS|ENOENT|EACCES):',
)


class ObservationError(Exception):
    pass


def bounded_output(argv, deadline, maximum, merge_stderr=False, isolate=True):
    """Bound memory and wall time; kill/reap this process group, including docker CLI."""
    if deadline <= time.monotonic():
        raise ObservationError('deadline')
    try:
        child = subprocess.Popen(argv, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT if merge_stderr else subprocess.DEVNULL,
            start_new_session=os.name == 'posix' and isolate,
            creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
    except OSError:
        raise ObservationError('unavailable') from None
    result = []
    def read():
        try:
            result.append(child.stdout.read(maximum + 1))
        except OSError:
            pass
    reader = threading.Thread(target=read, daemon=True)
    reader.start()
    try:
        reader.join(max(0, deadline - time.monotonic()))
        if reader.is_alive():
            raise ObservationError('deadline')
        if not result:
            raise ObservationError('unavailable')
        if len(result[0]) > maximum:
            raise ObservationError('output_limit')
        try:
            code = child.wait(timeout=max(.001, deadline - time.monotonic()))
        except subprocess.TimeoutExpired:
            raise ObservationError('deadline') from None
        return code, result[0]
    finally:
        # A descendant may still hold the pipe after its immediate parent exited.
        if child.poll() is None or reader.is_alive():
            try:
                if os.name == 'posix' and isolate:
                    os.killpg(child.pid, signal.SIGKILL)
                else:
                    child.kill()
            except ProcessLookupError:
                pass
        child.wait()
        reader.join(1)
        child.stdout.close()


def no_duplicates(pairs):
    row = {}
    for key, value in pairs:
        if key in row:
            raise ValueError('duplicate')
        row[key] = value
    return row


def parse_summary(code, raw):
    try:
        if len(raw) > 2048 or code not in (0, 1):
            raise ValueError('failure')
        row = json.loads(raw, object_pairs_hook=no_duplicates)
        if not isinstance(row, dict) or set(row) != FIELDS or row['collection_ok'] is not True \
                or row['window'] != WINDOW or type(row['at_line_limit']) is not bool:
            raise ValueError('schema')
        if any(type(row[k]) is not int or not 0 <= row[k] <= LIMIT for k in (*COUNTERS, 'lines_examined')):
            raise ValueError('counter')
        if sum(row[k] for k in COUNTERS) > row['lines_examined'] \
                or row['at_line_limit'] != (row['lines_examined'] >= LIMIT):
            raise ValueError('coverage')
        if code != int(bool(row['cache_write_errors'] or row['other_error_lines'] or row['at_line_limit'])):
            raise ValueError('exit')
    except (ValueError, TypeError, UnicodeError):
        raise ObservationError('invalid_summary') from None
    if row['at_line_limit']:
        raise ObservationError('line_limit')
    return row


def identity(container, deadline):
    code, raw = bounded_output(['docker', 'inspect', '--format', '{{.Id}} {{.State.StartedAt}}', container],
                               deadline, 512)
    try:
        cid, started = raw.decode('ascii').strip().split()
        stamp = dt.datetime.fromisoformat(started.replace('Z', '+00:00'))
        if code or not re.fullmatch('[0-9a-f]{64}', cid) or stamp.tzinfo is None:
            raise ValueError('identity')
        return cid, started, stamp.timestamp()
    except (ValueError, UnicodeError):
        raise ObservationError('identity_unavailable') from None


def collect_one(project, deadline):
    container = TARGETS[project]
    out = {'ok': False, 'window': WINDOW, 'collected_at': int(time.time())}
    try:
        before = identity(container, min(deadline, time.monotonic() + 1.5))
        out.update(container_id=before[0], container_started_at=before[1])
        if project == 'towhub_web':
            argv = ['/usr/bin/python3', '/opt/towhub-web/current/deploy/appplatform/runtime_log_counts.py',
                    '--since', WINDOW]
        else:
            argv = [sys.executable, str(Path(__file__).resolve()), '--ledgerhound-worker', before[0]]
        # Reserve time to establish that the helper read the same current container.
        code, raw = bounded_output(argv, min(deadline - 1.5, time.monotonic() + 6), 2048)
        row = parse_summary(code, raw)
        after = identity(container, deadline)
        if before != after:
            raise ObservationError('container_changed')
        out['coverage_seconds'] = max(0, min(300, int(time.time() - before[2])))
        if out['coverage_seconds'] < 300:
            raise ObservationError('container_window_partial')
        out.update(ok=True, counts={k: row[k] for k in COUNTERS},
                   lines_examined=row['lines_examined'], at_line_limit=False)
    except ObservationError as exc:
        # Only internal fixed codes; never interpolate child output/exception messages.
        out['reason'] = exc.args[0]
    return out


def collect(now, budget=8):
    deadline = time.monotonic() + budget
    with ThreadPoolExecutor(max_workers=2) as pool:
        return dict(zip(TARGETS, pool.map(lambda p: collect_one(p, deadline), TARGETS)))


def assess(observations, now):
    findings = []
    for project in TARGETS:
        row = observations.get(project) if isinstance(observations, dict) else None
        counts = row.get('counts') if isinstance(row, dict) else None
        known = isinstance(row, dict) and row.get('ok') is True \
            and type(row.get('collected_at')) is int and -30 <= now - row['collected_at'] <= 120 \
            and row.get('window') == WINDOW and row.get('coverage_seconds') == 300 \
            and isinstance(counts, dict) and set(counts) == set(COUNTERS) \
            and all(type(n) is int and 0 <= n <= LIMIT for n in counts.values())
        def add(code, message, blocked=()):
            findings.append(dict(code=code, project=project, severity='warning', message=message,
                                 after=2, blocksRecovery=list(blocked)))
        if not known:
            add('runtime_collection_unknown', 'Runtime-счётчики недоступны или окно неполное; '
                'отсутствие данных не означает отсутствие ошибок.', ERROR_CODES)
            continue
        if counts['cache_write_errors']:
            add(ERROR_CODES[0], f"Ошибки записи runtime-кеша: {counts['cache_write_errors']} строк за последние 5 минут. "
                'HTTP 200/404 не исключает эту ошибку. Перекрывающиеся окна не суммируются.')
        if counts['other_error_lines']:
            add(ERROR_CODES[1], f"Распознаны runtime-исключения: {counts['other_error_lines']} строк за последние 5 минут. "
                'Это строки логов, не число запросов или уникальных сбоев.')
        # Invalid/missing Actions and origin rejections remain separate observations;
        # scanner-shaped inputs alone are not an application outage.
    return findings


def ledgerhound_worker(cid):
    if not re.fullmatch('[0-9a-f]{64}', cid):
        print('{"collection_ok":false}')
        return 2
    try:
        code, raw = bounded_output(['docker', 'logs', '--since', WINDOW, '--tail', str(LIMIT), cid],
                                   time.monotonic() + 4, 1024 * 1024, merge_stderr=True, isolate=False)
        if code:
            raise ObservationError('unavailable')
        lines = raw.decode('utf-8', errors='replace').splitlines()
        counts = dict.fromkeys(COUNTERS, 0)
        patterns = [re.compile(p) for p in PATTERNS]
        for line in lines:
            for key, pattern in zip(COUNTERS, patterns):
                if pattern.search(line):
                    counts[key] += 1
                    break
        row = dict(collection_ok=True, window=WINDOW, **counts,
                   lines_examined=len(lines), at_line_limit=len(lines) >= LIMIT)
        print(json.dumps(row))
        return int(bool(counts['cache_write_errors'] or counts['other_error_lines'] or row['at_line_limit']))
    except ObservationError:
        print('{"collection_ok":false}')
        return 2


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--ledgerhound-worker':
        raise SystemExit(ledgerhound_worker(sys.argv[2]))
    print(json.dumps(collect(time.time())))
