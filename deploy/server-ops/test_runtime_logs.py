import copy
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

from core import connect, transition, save_sample
from test_ops import healthy
import runtime_logs as runtime
from access_timing import observe
from upgrade_timing import candidate, ADDITIONS


def summary(**kw):
    return dict(collection_ok=True, window='5m', **dict.fromkeys(runtime.COUNTERS, 0),
                lines_examined=0, at_line_limit=False, **kw)


def observations(now, **counts):
    row = dict(ok=True, collected_at=now, window='5m', coverage_seconds=300,
               counts=dict.fromkeys(runtime.COUNTERS, 0))
    row['counts'].update(counts)
    return {p: copy.deepcopy(row) for p in runtime.TARGETS}


class RuntimeTest(unittest.TestCase):
    def test_contract_success_and_scanner_counts_are_separate(self):
        row = summary(); row.update(invalid_action_ids=3, lines_examined=3)
        self.assertEqual(runtime.parse_summary(0, json.dumps(row).encode()), row)
        self.assertEqual(runtime.assess(observations(100, invalid_action_ids=3), 100), [])

    def test_failed_invalid_truncated_and_inconsistent_outputs(self):
        variants = [(2, b'{"collection_ok":false}'), (9, b'{}'), (0, b'raw secret log'),
                    (0, b'{}'), (0, b' ' * 2049), (0, b'{"collection_ok":true,"collection_ok":true}')]
        for field, value in [('window', '1h'), ('cache_write_errors', True), ('other_error_lines', -1),
                             ('lines_examined', 5001), ('cache_write_errors', 1), ('extra', 'secret')]:
            row = summary(); row[field] = value
            variants.append((0, json.dumps(row).encode()))
        for code, raw in variants:
            with self.subTest(raw=raw[:30]), self.assertRaises(runtime.ObservationError):
                runtime.parse_summary(code, raw)
        row = summary(); row.update(lines_examined=5000, at_line_limit=True)
        with self.assertRaisesRegex(runtime.ObservationError, 'line_limit'):
            runtime.parse_summary(1, json.dumps(row).encode())

    def test_cache_error_exit_one_is_accepted(self):
        row = summary(); row.update(cache_write_errors=1, lines_examined=1)
        self.assertEqual(runtime.parse_summary(1, json.dumps(row).encode())['cache_write_errors'], 1)

    def test_real_deadline_and_output_cap(self):
        start = time.monotonic()
        with self.assertRaisesRegex(runtime.ObservationError, 'deadline'):
            runtime.bounded_output([sys.executable, '-c', 'import time;time.sleep(60)'], start + .25, 64)
        self.assertLess(time.monotonic() - start, 3)
        with self.assertRaisesRegex(runtime.ObservationError, 'output_limit'):
            runtime.bounded_output([sys.executable, '-c', "import sys;sys.stdout.write('X'*100000);sys.stdout.flush()"],
                                   time.monotonic() + 3, 64)

    @unittest.skipUnless(os.name == 'posix', 'process groups are Linux host behavior')
    def test_deadline_kills_descendant_holding_pipe(self):
        start = time.monotonic()
        program = "import subprocess,sys;subprocess.Popen([sys.executable,'-c','import time;time.sleep(60)'])"
        with self.assertRaisesRegex(runtime.ObservationError, 'deadline'):
            runtime.bounded_output([sys.executable, '-c', program], start + .3, 64)
        self.assertLess(time.monotonic() - start, 2)

    def test_error_messages_and_child_output_never_reach_observation(self):
        with patch.object(runtime, 'identity', side_effect=runtime.ObservationError('identity_unavailable')):
            row = runtime.collect_one('towhub_web', time.monotonic() + 3)
        self.assertFalse(row['ok']); self.assertNotIn('counts', row)
        self.assertEqual(row['reason'], 'identity_unavailable')

    def test_container_replacement_and_short_coverage_are_unknown(self):
        before = ('a'*64, '2020-01-01T00:00:00Z', 1)
        for after in [('b'*64, before[1], 1), before]:
            identities = [before, after]
            if after == before:
                identities = [(before[0], before[1], time.time())] * 2
            with patch.object(runtime, 'identity', side_effect=identities), \
                    patch.object(runtime, 'bounded_output', return_value=(0, json.dumps(summary()).encode())):
                row = runtime.collect_one('towhub_web', time.monotonic() + 8)
            self.assertFalse(row['ok']); self.assertNotIn('counts', row)
            self.assertIn(row['reason'], ('container_changed', 'container_window_partial'))

    def test_full_current_container_coverage_known(self):
        identity = ('a'*64, '2020-01-01T00:00:00Z', 1)
        with patch.object(runtime, 'identity', return_value=identity), \
                patch.object(runtime, 'bounded_output', return_value=(0, json.dumps(summary()).encode())):
            row = runtime.collect_one('towhub_web', time.monotonic() + 8)
        self.assertTrue(row['ok']); self.assertEqual(row['coverage_seconds'], 300)

    def test_unknown_stale_bool_negative_block_recovery(self):
        for value in [None, {}, observations(1), observations(100, cache_write_errors=True),
                      observations(100, cache_write_errors=-1)]:
            findings = runtime.assess(value, 1000 if value == observations(1) else 100)
            self.assertEqual({f['code'] for f in findings}, {'runtime_collection_unknown'})
            self.assertTrue(all(set(f['blocksRecovery']) == set(runtime.ERROR_CODES) for f in findings))

    def test_dedupe_unknown_block_and_three_complete_recoveries(self):
        with tempfile.TemporaryDirectory() as directory:
            db = connect(Path(directory)/'history.db')
            try:
                for now in range(100, 110):
                    transition(db, runtime.assess(observations(now, cache_write_errors=now), now), now)
                self.assertEqual(db.execute('SELECT COUNT(*) FROM incidents').fetchone()[0], 2)
                self.assertEqual(db.execute('SELECT COUNT(*) FROM outbox').fetchone()[0], 2)
                for now in range(110, 115):
                    transition(db, runtime.assess(None, now), now)
                self.assertEqual(db.execute('SELECT COUNT(*) FROM incidents WHERE code=? AND closed IS NULL',
                    ('runtime_cache_write',)).fetchone()[0], 2)
                # No transport or deliver call: synthetic fixtures remain local to this DB.
                for now in range(115, 118):
                    transition(db, runtime.assess(observations(now), now), now)
                self.assertEqual(db.execute('SELECT COUNT(*) FROM incidents WHERE closed IS NULL').fetchone()[0], 0)
                s = healthy(); s['runtime_logs'] = observations(s['ts'])
                save_sample(db, s)
                self.assertEqual(json.loads(db.execute('SELECT data FROM samples').fetchone()[0])['runtime_logs'], s['runtime_logs'])
            finally:
                db.close()

    def test_ledgerhound_patterns_only_counts_leave_worker(self):
        raw = b'Failed to update prerender cache secret-path\nError: ENOENT: secret\nInvalid Server Reference ID x\n'
        with patch.object(runtime, 'bounded_output', return_value=(0, raw)), patch('builtins.print') as output:
            self.assertEqual(runtime.ledgerhound_worker('a'*64), 1)
        row = json.loads(output.call_args.args[0])
        self.assertEqual(row['cache_write_errors'], 1); self.assertEqual(row['other_error_lines'], 1)
        self.assertEqual(row['invalid_action_ids'], 1); self.assertNotIn('secret', output.call_args.args[0])

    @unittest.skipUnless(os.name == 'posix', 'worker process groups run on Linux')
    def test_nested_worker_cannot_leave_its_docker_child_running(self):
        with tempfile.TemporaryDirectory() as directory:
            pidfile = Path(directory)/'child.pid'
            inner = "import os,time;open(" + repr(str(pidfile)) + ",'w').write(str(os.getpid()));time.sleep(60)"
            worker = ("import sys,time;sys.path.insert(0," + repr(str(Path(runtime.__file__).parent)) + ");"
                      "import runtime_logs as r;r.bounded_output([sys.executable,'-c'," + repr(inner) +
                      "],time.monotonic()+60,64,isolate=False)")
            with self.assertRaisesRegex(runtime.ObservationError, 'deadline'):
                runtime.bounded_output([sys.executable, '-c', worker], time.monotonic() + 1, 64)
            self.assertTrue(pidfile.exists())
            stat = Path('/proc')/pidfile.read_text()/'stat'
            self.assertTrue(not stat.exists() or stat.read_text().split()[2] == 'Z')

    def test_timing_missing_is_not_zero_and_no_raw_metadata(self):
        target = {}; observe(target, {'duration': 6, 'status': 0, 'uri': 'secret', 'upstream_headers_ms': ''})
        metric = target['timing']['upstream_headers_ms']
        self.assertEqual(metric, dict(observed=0, unavailable=1, sum=0, max=None))
        self.assertNotIn('secret', json.dumps(target)); self.assertNotIn('slow_after_headers', target['timing'])

    def test_timing_numeric_validation_and_units(self):
        target = {}; observe(target, {'duration': 6, 'upstream_headers_ms': '20.5', 'proxy_inclusive_ms': 5900})
        observe(target, {'upstream_headers_ms': True, 'proxy_inclusive_ms': 'NaN', 'duration': -1})
        self.assertEqual(target['timing']['upstream_headers_ms'], dict(observed=1, unavailable=1, sum=20.5, max=20.5))
        self.assertEqual(target['timing']['request_duration_ms']['max'], 6000)
        self.assertEqual(target['timing']['slow_after_headers'], 1)

    def test_ingress_only_two_additions_and_unknown_baseline_refused(self):
        snippet = Path(__file__).with_name('access-snippet.Caddyfile').read_text().replace(ADDITIONS, '')
        old = snippet + '\nexample.invalid {\n header X-Thing value\n reverse_proxy app:80\n}\n'
        self.assertEqual(candidate(old).replace(ADDITIONS, ''), old)
        for invalid in [candidate(old), old + old, 'example.invalid {}']:
            with self.assertRaises(ValueError): candidate(invalid)


if __name__ == '__main__': unittest.main()
