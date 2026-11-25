import copy
from contextlib import closing
import datetime as dt
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
import subprocess
import sys
from unittest.mock import patch

from core import connect, deliver, evaluate, transition
import ledgerhound as lh
from test_ops import healthy
import monitor

NOW = int(dt.datetime(2026, 11, 19, 23, tzinfo=dt.timezone.utc).timestamp())
RECIPIENTS = {'ledgerhound': 'owner-ledger@example.invalid'}


def iso(now):
    return dt.datetime.fromtimestamp(now, dt.timezone.utc).isoformat()


def fixture(now=NOW):
    return {'checkedAt': iso(now), 'orders': {'status': 'ok', 'pending': 0, 'failed': 0, 'manualReview': 0,
        'oldestPendingAgeSeconds': 0, 'checkedAt': iso(now)}, 'sources': {'checkedAt': iso(now),
        'month': dt.datetime.fromtimestamp(now, dt.timezone.utc).strftime('%Y-%m'), 'maxAgeDays': 16,
        'ofac': {'state': 'list', 'entries': 1027, 'asOf': iso(now - 3 * 86400)}, 'counter': {'state': 'absent'}}}


class AssessmentTests(unittest.TestCase):
    def codes(self, row):
        return {f['code']: f for f in lh.assess(row, NOW)[0]}

    def test_healthy_empty_database_and_absent_month_counter_are_normal(self):
        self.assertEqual(lh.assess(fixture(), NOW), ([], set()))

    def test_failed_manual_and_late_paid_orders_each_have_a_stable_code(self):
        row = fixture()
        row['orders'].update(status='attention', pending=2, failed=1, manualReview=1, oldestPendingAgeSeconds=3601)
        self.assertEqual(set(self.codes(row)), set(lh.ORDER_CODES))
        self.assertTrue(all(f['severity'] == 'critical' for f in self.codes(row).values()))

    def test_one_hour_is_inclusive_and_recent_pending_is_not_an_incident(self):
        row = fixture()
        row['orders'].update(pending=1, oldestPendingAgeSeconds=3600)
        self.assertEqual(self.codes(row), {})

    def test_null_bool_negative_and_missing_counts_never_mean_zero(self):
        for value in [None, True, -1, '0', {}, []]:
            for field in ['pending', 'failed', 'manualReview', 'oldestPendingAgeSeconds']:
                row = fixture(); row['orders'][field] = value
                with self.subTest(field=field, value=value):
                    self.assertIn('ledgerhound_orders_unknown', self.codes(row))
                    self.assertTrue(set(lh.ORDER_CODES) <= lh.assess(row, NOW)[1])

    def test_unknown_inconsistent_status_and_impossible_age_are_unknown(self):
        for change in [{'status': 'unknown'}, {'status': 'attention'}, {'failed': 1}, {'oldestPendingAgeSeconds': 1}]:
            row = fixture(); row['orders'].update(change)
            self.assertIn('ledgerhound_orders_unknown', self.codes(row))

    def test_stale_future_and_naive_timestamps_are_not_valid_observations(self):
        for stamp in [iso(NOW - 181), iso(NOW + 61), '2026-11-19T23:00:00', None]:
            row = fixture(); row['orders']['checkedAt'] = stamp
            self.assertIn('ledgerhound_orders_unknown', self.codes(row))

    def test_whole_sensor_loss_holds_every_related_incident(self):
        findings, blocked = lh.assess(None, NOW)
        self.assertEqual(findings[0]['code'], 'ledgerhound_monitor_unknown')
        self.assertEqual(blocked, set(lh.ALL_CODES))

    def test_stale_ofac_warns_at_nine_days_and_escalates_after_app_limit(self):
        row = fixture()
        for days, expected in [(9, None), (9.01, 'warning'), (16, 'warning'), (16.01, 'critical')]:
            row['sources']['ofac']['asOf'] = iso(NOW - days * 86400)
            found = self.codes(row)
            self.assertEqual(found.get('ledgerhound_ofac_stale', {}).get('severity'), expected)

    def test_ofac_max_age_override_is_respected(self):
        row = fixture(); row['sources']['maxAgeDays'] = 2
        self.assertEqual(self.codes(row)['ledgerhound_ofac_stale']['severity'], 'critical')

    def test_unreadable_empty_or_future_dated_ofac_holds_stale_incident(self):
        for ofac in [None, {'state': 'error'}, {'state': 'list', 'entries': 0, 'asOf': iso(NOW)},
                     {'state': 'list', 'entries': 1, 'asOf': iso(NOW + 61)}]:
            row = fixture(); row['sources']['ofac'] = ofac
            self.assertIn('ledgerhound_ofac_unavailable', self.codes(row))
            self.assertIn('ledgerhound_ofac_stale', lh.assess(row, NOW)[1])

    def test_bad_counter_and_wrong_month_hold_exhausted_incident(self):
        cases = [{'state': 'error'}, {'state': 'unreadable'}, {'state': 'counter', 'callsUsed': True},
                 {'state': 'counter', 'callsUsed': -1}, {'state': 'counter', 'callsUsed': None}]
        for counter in cases:
            row = fixture(); row['sources']['counter'] = counter
            self.assertIn('ledgerhound_chainabuse_blocked', self.codes(row))
            self.assertIn('ledgerhound_chainabuse_exhausted', lh.assess(row, NOW)[1])
        row = fixture(); row['sources']['month'] = '2026-10'
        self.assertIn('ledgerhound_chainabuse_blocked', self.codes(row))

    def test_monthly_quota_is_warning_and_next_month_absence_recovers(self):
        row = fixture(); row['sources']['counter'] = {'state': 'counter', 'callsUsed': 7}
        self.assertEqual(self.codes(row), {})
        row['sources']['counter']['callsUsed'] = 8
        self.assertIn('ledgerhound_chainabuse_exhausted', self.codes(row))
        self.assertEqual(self.codes(row)['ledgerhound_chainabuse_exhausted']['severity'], 'warning')
        december = int(dt.datetime(2026, 12, 1, tzinfo=dt.timezone.utc).timestamp())
        self.assertEqual(lh.assess(fixture(december), december), ([], set()))

    def test_old_source_snapshot_does_not_clear_source_incidents(self):
        row = fixture(); row['sources']['checkedAt'] = iso(NOW - 181)
        self.assertIn('ledgerhound_sources_unknown', self.codes(row))
        self.assertTrue(set((*lh.OFAC_CODES, *lh.COUNTER_CODES)) <= lh.assess(row, NOW)[1])

    def test_collect_sanitizes_ids_emails_bodies_and_exception_messages(self):
        raw = fixture(); raw['orders']['email'] = 'secret@example.invalid'
        raw['orders']['failed'] = 'secret@example.invalid'; raw['orders']['status'] = {'token': 'secret'}
        raw['sources']['ofac']['address'] = 'secret'; raw['sources']['counter']['callsUsed'] = {'token': 'secret'}
        result = lh.collect(NOW, lambda: raw['orders'], lambda: raw['sources'])
        self.assertNotIn('secret', json.dumps(result))
        self.assertIsNone(result['orders']['failed'])
        def fail(): raise RuntimeError('secret-token')
        self.assertEqual(lh.collect(NOW, fail, fail), {'checkedAt': iso(NOW), 'orders': None, 'sources': None})

    def test_storage_helper_runs_only_fixed_get_script_in_existing_container(self):
        with patch.object(lh.subprocess, 'run') as run:
            run.return_value.stdout = json.dumps(fixture()['sources'])
            self.assertEqual(lh.storage_read()['month'], '2026-11')
            self.assertEqual(run.call_args.args[0], ['docker', 'exec', '-i', 'ledgerhound-web', 'node', '-'])
            self.assertLessEqual(run.call_args.kwargs['timeout'], 12)
            self.assertNotIn('PutObject', run.call_args.kwargs['input'])


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / 'state.db'
        self.db = connect(self.path); self.addCleanup(self.db.close)

    def step(self, row, offset=0):
        sample = healthy(NOW + offset); sample['ledgerhound'] = copy.deepcopy(row)
        if row is not None:
            sample['ledgerhound']['checkedAt'] = iso(NOW + offset)
            if isinstance(row.get('orders'), dict): sample['ledgerhound']['orders']['checkedAt'] = iso(NOW + offset)
            if isinstance(row.get('sources'), dict): sample['ledgerhound']['sources']['checkedAt'] = iso(NOW + offset)
        transition(self.db, evaluate(sample, None, []), NOW + offset, RECIPIENTS)

    def outbox(self):
        return list(self.db.execute('SELECT * FROM outbox ORDER BY created'))

    def test_full_pipeline_deduplicates_changing_counts_and_restores_after_three_goods(self):
        row = fixture(); row['orders'].update(status='attention', failed=1)
        self.step(row, 0); self.assertEqual(self.outbox(), [])
        for n in range(1, 10):
            row['orders']['failed'] += 1; self.step(row, n)
        self.assertEqual(len(self.outbox()), 1)
        self.assertEqual(self.outbox()[0]['recipient'], RECIPIENTS['ledgerhound'])
        for n in [10, 11]: self.step(fixture(), n)
        self.assertEqual(len(self.outbox()), 1)
        self.step(fixture(), 12)
        self.assertEqual(len(self.outbox()), 2)
        self.assertTrue(self.outbox()[1]['key'].startswith('recovery:'))
        self.assertEqual(self.outbox()[1]['recipient'], RECIPIENTS['ledgerhound'])

    def test_unknown_orders_do_not_resolve_failed_paid_orders(self):
        row = fixture(); row['orders'].update(status='attention', failed=1)
        self.step(row); self.step(row, 1)
        row['orders'] = None
        for n in range(2, 8): self.step(row, n)
        incident = self.db.execute("SELECT * FROM incidents WHERE code='ledgerhound_order_failed'").fetchone()
        self.assertIsNone(incident['closed'])
        self.assertFalse(any(r['key'].startswith('recovery:') for r in self.outbox()))

    def test_loss_of_whole_sensor_does_not_resolve_other_unknown_alerts(self):
        row = fixture(); row['orders'] = None
        for n in range(3): self.step(row, n)
        for n in range(3, 10): self.step(None, n)
        self.assertIsNone(self.db.execute("SELECT closed FROM incidents WHERE code='ledgerhound_orders_unknown'").fetchone()[0])

    def test_source_read_failure_does_not_resolve_stale_ofac_or_exhausted_quota(self):
        row = fixture(); row['sources']['ofac']['asOf'] = iso(NOW - 10 * 86400)
        row['sources']['counter'] = {'state': 'counter', 'callsUsed': 8}
        self.step(row); self.step(row, 1)
        row['sources'] = None
        for n in range(2, 8): self.step(row, n)
        for code in ['ledgerhound_ofac_stale', 'ledgerhound_chainabuse_exhausted']:
            self.assertIsNone(self.db.execute('SELECT closed FROM incidents WHERE code=?', (code,)).fetchone()[0])

    def test_warning_to_critical_sends_one_escalation(self):
        row = fixture(); row['sources']['ofac']['asOf'] = iso(NOW - 10 * 86400)
        self.step(row); self.step(row, 1)
        row['sources']['ofac']['asOf'] = iso(NOW - 17 * 86400)
        for n in range(2, 6): self.step(row, n)
        self.assertEqual([r['key'].split(':')[0] for r in self.outbox()], ['incident', 'escalation'])

    def test_retry_freezes_payload_date_recipient_and_idempotency_across_restart(self):
        row = fixture(); row['orders'].update(status='attention', manualReview=1)
        self.step(row); self.step(row, 1)
        cfg = dict(notifications_enabled=True, recipient='general@example.invalid', mailhub_url='https://mail.invalid', mailhub_key='fixture-secret')
        requests, durable = [], []
        def lost(request):
            requests.append(request)
            with closing(sqlite3.connect(self.path)) as independent:
                persisted = independent.execute('SELECT payload FROM outbox').fetchone()
                durable.append(persisted is not None and persisted[0] is not None)
            raise TimeoutError('secret-token-must-not-be-persisted')
        deliver(self.db, cfg, NOW + 2, lost)
        self.assertEqual(durable, [True])
        saved = self.outbox()[0]
        self.assertEqual(saved['error'], 'TimeoutError')
        self.assertNotIn('secret-token', saved['payload'])
        self.db.close(); self.db = connect(self.path); self.addCleanup(self.db.close)
        cfg['recipient'] = 'changed@example.invalid'
        self.db.execute("UPDATE outbox SET recipient='changed@example.invalid',subject='operator edit',text='operator edit'")
        deliver(self.db, cfg, NOW + 2 * 86400, lambda req: requests.append(req) or {'status':'resolved','emailId':'fixture-email'})
        self.assertEqual(requests[0].data, requests[1].data)
        self.assertEqual(requests[0].get_header('Idempotency-key'), requests[1].get_header('Idempotency-key'))
        self.assertEqual(json.loads(requests[1].data)['recipient']['email'], RECIPIENTS['ledgerhound'])
        self.assertIsNotNone(self.outbox()[0]['sent'])

    def test_old_database_pending_rows_upgrade_and_keep_the_global_recipient(self):
        path = Path(self.tmp.name) / 'old.db'
        old = sqlite3.connect(path)
        old.execute('CREATE TABLE outbox(key TEXT PRIMARY KEY,created INTEGER,subject TEXT,text TEXT,sent INTEGER,attempts INTEGER DEFAULT 0,last_try INTEGER DEFAULT 0,error TEXT)')
        old.execute("INSERT INTO outbox(key,created,subject,text) VALUES ('old',1,'Old','Text')")
        old.commit(); old.close()
        upgraded = connect(path); self.addCleanup(upgraded.close)
        sent = []
        deliver(upgraded, dict(notifications_enabled=True, recipient='general@example.invalid', mailhub_url='https://mail.invalid', mailhub_key='fixture'), NOW, lambda req: sent.append(req) or {'status':'resolved','emailId':'fixture-email'})
        self.assertEqual(json.loads(sent[0].data)['recipient']['email'], 'general@example.invalid')

    def test_notifications_disabled_never_send_or_mark_as_accepted(self):
        row = fixture(); row['orders'].update(status='attention', failed=1)
        self.step(row); self.step(row, 1)
        deliver(self.db, {'notifications_enabled': False}, NOW + 2, lambda req: self.fail('unexpected send'))
        self.assertIsNone(self.outbox()[0]['sent'])

    def test_failed_or_ambiguous_provider_receipts_stay_pending(self):
        row = fixture(); row['orders'].update(status='attention', failed=1)
        self.step(row); self.step(row, 1)
        cfg = dict(notifications_enabled=True, recipient='general@example.invalid', mailhub_url='https://mail.invalid', mailhub_key='fixture')
        for n, reply in enumerate([None, {}, {'status':'unsupported'}, {'status':'failed','error':'suppressed_recipient'},
                                   {'status':'failed','emailId':'not-accepted'}, {'status':'resolved'}, {'status':'resolved','emailId':''}]):
            deliver(self.db, cfg, NOW + 2 + n*400, lambda req: reply)
            self.assertIsNone(self.outbox()[0]['sent'])
            self.assertIsNone(self.outbox()[0]['receipt'])
        deliver(self.db, cfg, NOW + 10000, lambda req: {'status':'resolved','emailId':'accepted-email'})
        self.assertEqual(self.outbox()[0]['receipt'], 'accepted-email')

    def test_slow_notification_batch_leaves_time_for_collector_heartbeat(self):
        from core import queue
        queue(self.db, 'a', 'A', 'Text', NOW)
        queue(self.db, 'b', 'B', 'Text', NOW)
        cfg = dict(notifications_enabled=True, recipient='general@example.invalid', mailhub_url='https://mail.invalid', mailhub_key='fixture')
        clock, requests = [0], []
        def slow(request):
            requests.append(request)
            clock[0] += 21
            return {'status':'resolved', 'emailId':'accepted'}
        with patch('core.time.monotonic', side_effect=lambda: clock[0]):
            deliver(self.db, cfg, NOW, slow)
        self.assertEqual(len(requests), 1)
        self.assertIsNone(self.db.execute("SELECT sent FROM outbox WHERE key='b'").fetchone()[0])

    def test_collector_sensor_is_opt_in_and_does_not_touch_other_settings(self):
        sample = healthy()
        with patch.object(monitor, 'collect_ledgerhound', return_value=fixture()) as collect:
            monitor.application_checks(sample, {}, None, NOW)
            collect.assert_not_called()
            self.assertNotIn('ledgerhound', sample)
            cfg = {'ledgerhound_monitor': {'enabled': True}, 'project_recipients': RECIPIENTS, 'recipient': 'global@example.invalid'}
            original = copy.deepcopy(cfg)
            monitor.application_checks(sample, cfg, None, NOW)
            collect.assert_called_once_with(NOW)
            self.assertEqual(cfg, original)
            self.assertEqual(sample['ledgerhound'], fixture())

    def test_sensor_requires_explicit_recipient_and_never_recovers_on_disabling(self):
        with self.assertRaisesRegex(ValueError, 'project recipient'):
            monitor.application_checks({}, {'ledgerhound_monitor': {'enabled': True}}, None, NOW)
        sample = {}
        monitor.application_checks(sample, {}, {'ledgerhound': fixture()}, NOW)
        self.assertIsNone(sample['ledgerhound'])
        self.assertTrue(set(lh.ALL_CODES) <= lh.assess(sample['ledgerhound'], NOW)[1])

    def test_dashboard_core_import_does_not_require_host_collector_module(self):
        core = Path(__file__).with_name('core.py').read_bytes()
        with tempfile.TemporaryDirectory() as d:
            Path(d, 'core.py').write_bytes(core)
            result = subprocess.run([sys.executable, '-c', 'from core import signed_session; print("OK")'],
                                    cwd=d, capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode, 0, result.stderr)

    @unittest.skipIf(sys.platform == 'win32', 'real collector flock is verified on Linux/WSL')
    def test_real_runner_persists_incident_outbox_and_snapshot_under_the_collector_lock(self):
        cfg = {'state_dir': self.tmp.name, 'notifications_enabled': False, 'project_recipients': RECIPIENTS}
        config_path = Path(self.tmp.name) / 'config.json'
        config_path.write_text(json.dumps(cfg))
        row = fixture(); row['orders'].update(status='attention', failed=1)
        sample = healthy(NOW); sample['ledgerhound'] = row; sample['collector_errors'] = []
        with patch.object(monitor, 'collect', side_effect=lambda *args: (copy.deepcopy(sample), None)), \
                patch.object(monitor.time, 'time', return_value=NOW):
            monitor.run(config_path)
        sample['ts'] += 60
        with patch.object(monitor, 'collect', side_effect=lambda *args: (copy.deepcopy(sample), None)), \
                patch.object(monitor.time, 'time', return_value=NOW + 60):
            monitor.run(config_path)
        state = json.loads(Path(self.tmp.name, 'snapshot.json').read_text())
        self.assertEqual(state['incidents'][0]['code'], 'ledgerhound_order_failed')
        self.assertEqual(state['notification_pending'], 2)  # existing server digest + the new incident
        real_db = connect(Path(self.tmp.name) / 'history.db'); self.addCleanup(real_db.close)
        incident = list(real_db.execute("SELECT * FROM outbox WHERE key LIKE 'incident:%'"))
        self.assertEqual(len(incident), 1)
        self.assertEqual(incident[0]['recipient'], RECIPIENTS['ledgerhound'])


if __name__ == '__main__':
    unittest.main()
