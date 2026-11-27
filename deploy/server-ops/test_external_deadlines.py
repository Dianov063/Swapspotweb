"""Bound DNS, body reads and heartbeat delivery without any real mail."""
import contextlib
import io
import json
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch

import external


class ExternalDeadlineTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def hanging_worker(self, mode):
        worker = self.root / 'worker.py'
        worker.write_text(
            'import sys,json,time\n'
            f'sys.path.insert(0,{str(Path(external.__file__).parent)!r})\n'
            'import external\n'
            'def hang(*args,**kwargs):time.sleep(60)\n' +
            ('external.socket.getaddrinfo=hang\n' if mode == 'dns' else
             'class Response:\n'
             ' status=200\n'
             ' def __enter__(self):return self\n'
             ' def __exit__(self,*args):pass\n'
             ' def read(self,*args):hang()\n'
             'external.urllib.request.urlopen=lambda *a,**kw:Response()\n') +
            'external.request_worker(json.load(sys.stdin))\n', encoding='utf-8')
        return worker

    def test_hanging_dns_is_killed_and_diagnosed_without_credentials(self):
        worker = self.hanging_worker('dns')
        with patch.object(external, '__file__', str(worker)), contextlib.redirect_stderr(io.StringIO()) as log:
            start = time.monotonic()
            with self.assertRaises(external.StageDeadline):
                external.bounded_request('site', 'https://fixture.invalid/', timeout=.7,
                    headers={'Authorization': 'Bearer fixture-secret'})
        self.assertLess(time.monotonic() - start, 2.5)
        self.assertIn('"phase": "deadline"', log.getvalue())
        self.assertNotIn('fixture-secret', log.getvalue())
        self.assertNotIn('fixture.invalid', log.getvalue())

    def test_hanging_body_read_is_bounded_after_headers(self):
        worker = self.hanging_worker('body')
        with patch.object(external, '__file__', str(worker)), contextlib.redirect_stderr(io.StringIO()):
            start = time.monotonic()
            with self.assertRaises(external.StageDeadline):
                external.bounded_request('monitor_heartbeat', 'https://fixture.invalid/', timeout=.7)
        self.assertLess(time.monotonic() - start, 2.5)

    def test_global_budget_caps_stage_and_prevents_request_after_deadline(self):
        with patch('external.subprocess.run') as child, contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(external.StageDeadline):
                external.bounded_request('site', 'https://fixture.invalid/', deadline=time.monotonic() - 1)
        child.assert_not_called()

    def test_whole_run_is_bounded_even_with_dns_and_callback_hung(self):
        worker = self.hanging_worker('dns')
        cfg = self.root / 'config.json';state = self.root / 'state.json'
        cfg.write_text(json.dumps({'state_file': str(state), 'watch_token': 'fixture-secret'}))
        with patch.object(external, '__file__', str(worker)), \
             patch.object(external, 'RUN_BUDGET', 1.8), patch.object(external, 'CALLBACK_RESERVE', .7), \
             contextlib.redirect_stderr(io.StringIO()) as log, contextlib.redirect_stdout(io.StringIO()):
            start = time.monotonic()
            self.assertEqual(external.run(cfg), 1)
        self.assertLess(time.monotonic() - start, 3.5)
        saved = json.loads(state.read_text())
        self.assertEqual(saved['reason'], 'host_unreachable')
        self.assertEqual(saved['heartbeat_delivery_error'], 'StageDeadline')
        self.assertIn('"stage": "heartbeat_delivery"', log.getvalue())

    def test_all_probe_timeouts_remain_an_observation_failure(self):
        diagnostics = {}
        with patch('external.bounded_request', side_effect=external.StageDeadline()):
            reason = external.check({'watch_token': 'fixture-secret'}, diagnostics=diagnostics)
        self.assertEqual(reason, 'host_unreachable')
        self.assertEqual(set(diagnostics), {'site', 'platform', 'monitor_heartbeat'})

    def test_one_working_site_does_not_hide_failed_monitor_heartbeat(self):
        responses = [{'status': 200}, {'status': 200}, external.StageDeadline()]
        with patch('external.bounded_request', side_effect=responses):
            self.assertEqual(external.check({'watch_token': 'fixture'}), 'monitor_stale')

    def test_failed_heartbeat_post_persists_safe_error_and_exits_nonzero(self):
        cfg = self.root / 'config.json';state = self.root / 'state.json'
        cfg.write_text(json.dumps({'state_file': str(state), 'watch_token': 'fixture-secret'}))
        with patch('external.check', return_value=None), \
             patch('external.bounded_request', side_effect=RuntimeError('sensitive response fixture-secret')), \
             contextlib.redirect_stderr(io.StringIO()) as log, contextlib.redirect_stdout(io.StringIO()) as output:
            code = external.run(cfg)
        self.assertEqual(code, 1)
        self.assertEqual(json.loads(state.read_text())['heartbeat_delivery_error'], 'RuntimeError')
        self.assertFalse(json.loads(output.getvalue())['heartbeat_delivered'])
        self.assertNotIn('fixture-secret', log.getvalue() + output.getvalue() + state.read_text())

    def test_successful_post_clears_old_delivery_error_and_reserves_callback_budget(self):
        cfg = self.root / 'config.json';state = self.root / 'state.json'
        cfg.write_text(json.dumps({'state_file': str(state), 'watch_token': 'fixture'}))
        state.write_text(json.dumps({'heartbeat_delivery_error': 'StageDeadline'}))
        with patch('external.check', return_value=None) as check, \
             patch('external.bounded_request', return_value={'status': 200, 'data': {'ok': True}}) as post, \
             contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(external.run(cfg), 0)
        self.assertNotIn('heartbeat_delivery_error', json.loads(state.read_text()))
        self.assertAlmostEqual(post.call_args.kwargs['deadline'] - check.call_args.kwargs['deadline'],
                               external.CALLBACK_RESERVE)

    def test_timed_out_notification_is_not_reinjected(self):
        state = {'opened': 100, 'pending': 'open', 'reason': 'monitor_stale'}
        path = self.root / 'state.json'
        with patch('external.bounded_request', side_effect=external.StageDeadline()) as transport:
            external.flush({'notifications_enabled': True, 'recipient': 'owner@example.invalid'}, state, path, 200)
            external.flush({'notifications_enabled': True}, state, path, 260)
        self.assertEqual(transport.call_count, 1)
        self.assertEqual(state['last_attempt'], '100:open')
        self.assertEqual(state['delivery_error'], 'StageDeadline')


if __name__ == '__main__':
    unittest.main()
