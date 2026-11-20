import copy
import datetime as dt
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from core import connect,evaluate,transition,deliver,digest,save_sample,signed_session,valid_session,service_expectations,scheduled_job_status
from monitor import read_access
from external import step,notify,flush
import urllib.error


def healthy(ts=1800000000):
    return {'ts':ts,'host':{'disk_pct':50,'disk_free':30*1024**3,'disk_total':80*1024**3,
      'mem_available':4*1024**3,'mem_total':8*1024**3,'load':.5,'cores':4,'cpu_pct':12},
      'probes':{'site':{'ok':True},'platform':{'ok':True}},'projects':{'web':{'cpu_seconds':2,'memory':123456,'requests':2}},
      'services':{'web/server':'web'},'report_timer':'active','tls_days':80}


class OpsTest(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.db=connect(Path(self.tmp.name)/'history.db');self.addCleanup(self.db.close)

    def test_sustained_threshold_dedupe_and_three_good_recovery(self):
        s=healthy();s['host']['disk_pct']=87
        for i in range(2):transition(self.db,evaluate(s,None,[]),100+i)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM incidents').fetchone()[0],0)
        for i in range(8):transition(self.db,evaluate(s,None,[]),103+i)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM outbox').fetchone()[0],1)
        for i in range(2):transition(self.db,[],120+i)
        self.assertIsNone(self.db.execute('SELECT closed FROM incidents').fetchone()[0])
        transition(self.db,[],123)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM outbox').fetchone()[0],2)
        transition(self.db,[],124)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM outbox').fetchone()[0],2)

    def test_reason_does_not_repeat_for_changing_free_bytes(self):
        s=healthy();s['host']['disk_free']=4*1024**3
        for i in range(5):
            s['host']['disk_free']-=100000
            transition(self.db,evaluate(s,None,[]),100+i)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM outbox').fetchone()[0],1)

    def test_api_failure_and_missing_expected_service(self):
        prev=healthy();prev['expected_services']={'web/server':'web'}
        s=healthy();s['services']={};s['probes']['platform']['ok']=False
        for i in range(3):transition(self.db,evaluate(s,prev,[]),100+i)
        codes={r[0] for r in self.db.execute('SELECT code FROM incidents')}
        self.assertEqual(codes,{'api_unavailable','service_missing:web/server'})

    def test_low_traffic_does_not_trigger_error_percentage(self):
        s=healthy();s['projects']['web'].update(requests=1,errors=1,slow=1)
        self.assertNotIn('http_5xx',{f['code'] for f in evaluate(s,None,[])})
        s['projects']['web'].update(requests=30,errors=12)
        self.assertIn('http_5xx',{f['code'] for f in evaluate(s,None,[])})

    def test_oneoff_job_is_measured_but_not_expected_after_completion(self):
        job={'Names':['/backup-run-1'],'Labels':{'com.docker.compose.project':'platform',
            'com.docker.compose.service':'backup','com.docker.compose.oneoff':'True'}}
        expected,transient=service_expectations([job])
        self.assertEqual(expected,{})
        self.assertEqual(transient,['platform/backup'])
        previous={'expected_services':{'platform/backup':'platform'},'one_shot_services':transient}
        expected,transient=service_expectations([],previous)
        s=healthy();s['expected_services']=expected
        self.assertFalse(any(f['code'].startswith('service_missing:') for f in evaluate(s,previous,[])))

    def test_migration_removes_only_confirmed_job_and_keeps_daemon_failure(self):
        previous={'expected_services':{'platform/backup':'platform','platform/api':'platform'}}
        expected,_=service_expectations([],previous,['platform/backup'])
        s=healthy();s['expected_services']=expected
        self.assertEqual({f['code'] for f in evaluate(s,previous,[])},{'service_missing:platform/api'})

    def test_regular_service_overrides_historical_oneoff_identity(self):
        daemon={'Names':['/backup-1'],'Labels':{'com.docker.compose.project':'platform',
            'com.docker.compose.service':'backup','com.docker.compose.oneoff':'False'}}
        expected,transient=service_expectations([daemon],{'one_shot_services':['platform/backup']})
        self.assertEqual(expected,{'platform/backup':'platform'})
        self.assertEqual(transient,[])

    def test_stopped_buildx_builder_migrates_old_daemon_expectation(self):
        name='standalone/buildx_buildkit_blog0'
        builder={'Names':['/buildx_buildkit_blog0'],'Labels':{},'State':'exited',
            'Image':'moby/buildkit@sha256:fixture'}
        previous={'expected_services':{name:'standalone','web/server':'web'}}
        expected,transient=service_expectations([builder],previous)
        self.assertEqual(expected,{'web/server':'web'})
        self.assertEqual(transient,[name])
        s=healthy();s['expected_services']=expected
        self.assertFalse(any(f['code'].startswith('service_missing:') for f in evaluate(s,previous,[])))
        expected,_=service_expectations([],{'expected_services':expected,'one_shot_services':transient})
        self.assertNotIn(name,expected)

    def test_running_buildx_is_not_required_but_remains_in_inventory(self):
        builder={'Names':['/buildx_buildkit_blog0'],'Labels':{},'State':'running',
            'Image':'moby/buildkit:buildx-stable-1'}
        expected,transient=service_expectations([builder])
        self.assertEqual(expected,{})
        self.assertEqual(transient,['standalone/buildx_buildkit_blog0'])
        self.assertEqual(builder['State'],'running')

    def test_builder_name_or_image_alone_does_not_silence_real_services(self):
        for container in [
            {'Names':['/buildx_buildkit_web0'],'Labels':{},'Image':'my-web:latest'},
            {'Names':['/buildkit-server'],'Labels':{},'Image':'moby/buildkit:latest'},
            {'Names':['/buildx_buildkit_web0'],'Image':'moby/buildkit:latest',
             'Labels':{'com.docker.compose.project':'web','com.docker.compose.service':'server'}}]:
            expected,transient=service_expectations([container])
            self.assertEqual(len(expected),1)
            self.assertEqual(transient,[])

    def test_stopped_persistent_service_stays_missing_and_old_stopped_is_not_learned(self):
        daemon={'Names':['/api'],'Labels':{'com.docker.compose.project':'platform',
            'com.docker.compose.service':'api','com.docker.compose.oneoff':'False'},'State':'exited'}
        expected,_=service_expectations([daemon],{'expected_services':{'platform/api':'platform'}})
        s=healthy();s['expected_services']=expected
        self.assertIn('service_missing:platform/api',{f['code'] for f in evaluate(s,None,[])})
        self.assertEqual(service_expectations([daemon])[0],{})

    def test_scheduled_backup_success_and_staleness(self):
        path=Path(self.tmp.name)/'status.json';now=1800000000
        path.write_text(json.dumps({'timestamp':dt.datetime.fromtimestamp(now-60,dt.timezone.utc).isoformat(),'status':'ok'}))
        self.assertTrue(scheduled_job_status(path,now,7*3600)['ok'])
        self.assertEqual(scheduled_job_status(path,now+8*3600,7*3600)['reason'],'stale')

    def test_backup_failure_missing_invalid_and_future_status(self):
        path=Path(self.tmp.name)/'status.json';now=1800000000
        self.assertEqual(scheduled_job_status(path,now,3600)['reason'],'status_unavailable')
        for stamp,status,reason in [('invalid','ok','status_unavailable'),
                ('2027-01-15T08:00:00+00:00','failed','failed'),
                (dt.datetime.fromtimestamp(now+3600,dt.timezone.utc).isoformat(),'ok','invalid_timestamp')]:
            path.write_text(json.dumps({'timestamp':stamp,'status':status,'secret':'must-not-escape'}))
            result=scheduled_job_status(path,now,3600)
            self.assertEqual(result['reason'],reason)
            self.assertNotIn('secret',json.dumps(result))
        s=healthy();s['scheduled_jobs']={'backup':{'ok':False,'reason':'stale','project':'platform'}}
        self.assertEqual({f['code'] for f in evaluate(s,None,[])},{'scheduled_job:backup'})

    def test_large_growth_needs_a_real_baseline(self):
        s=healthy();self.assertNotIn('disk_growth',{f['code'] for f in evaluate(s,None,[])})
        old=healthy(s['ts']-3600);old['host']['disk_free']+=2*1024**3
        self.assertIn('disk_growth',{f['code'] for f in evaluate(s,None,[old])})

    def test_notification_retry_uses_same_idempotency_key(self):
        s=healthy();s['host']['disk_free']=1
        transition(self.db,evaluate(s,None,[]),100)
        cfg={'notifications_enabled':True,'recipient':'owner@example.invalid','mailhub_url':'https://mail.invalid','mailhub_key':'fixture-secret'}
        calls=[]
        def failed(r):calls.append(r);raise TimeoutError('do-not-log-token')
        deliver(self.db,cfg,101,failed);deliver(self.db,cfg,102,failed)
        self.assertEqual(len(calls),1)
        deliver(self.db,cfg,500,lambda r:(calls.append(r) or {'status':'resolved','emailId':'fixture-email'}))
        self.assertEqual(calls[0].get_header('Idempotency-key'),calls[1].get_header('Idempotency-key'))
        self.assertEqual(self.db.execute('SELECT error FROM outbox').fetchone()[0],None)
        self.assertEqual(json.loads(calls[1].data)['recipient']['email'],'owner@example.invalid')

    def test_daily_digest_is_once_per_new_york_day_and_not_fake_zero(self):
        now=int(dt.datetime(2026,11,19,17,tzinfo=dt.timezone.utc).timestamp())
        digest(self.db,now);self.assertEqual(self.db.execute('SELECT COUNT(*) FROM outbox').fetchone()[0],0)
        save_sample(self.db,healthy(now-60));digest(self.db,now);digest(self.db,now+60)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM outbox').fetchone()[0],1)
        self.assertIn('неполные',self.db.execute('SELECT text FROM outbox').fetchone()[0])

    def test_sessions_expiry_signature_and_password_not_echoed(self):
        token=signed_session('fixture',2000)
        self.assertTrue(valid_session(token,'fixture',1999))
        self.assertFalse(valid_session(token,'fixture',2000))
        self.assertFalse(valid_session(token,'wrong',1999))
        self.assertFalse(valid_session('2000.invalid','fixture',1000))

    def test_access_rotation_exact_once_and_only_sanitized_counters(self):
        directory=Path(self.tmp.name)/'access';directory.mkdir();file=directory/'web.log'
        row={'project':'web','route_group':'api','status':503,'size':12,'duration':4,'request':{'uri':'/x?secret=hidden','remote_ip':'private'}}
        file.write_text(json.dumps(row)+'\n')
        result,gap=read_access(directory,self.db);self.assertFalse(gap);self.assertEqual(result['web']['errors'],1)
        self.assertNotIn('hidden',json.dumps(result))
        file.rename(directory/'web-old.log');file.write_text(json.dumps(dict(row,status=200))+'\n')
        result,gap=read_access(directory,self.db)
        self.assertEqual(result['web']['requests'],1);self.assertEqual(result['web']['errors'],0)

    def test_external_watchdog_needs_three_failed_and_three_good_checks(self):
        state={}
        for n in range(2):state=step({},state,'host_unreachable',100+n)
        self.assertNotIn('pending',state)
        state=step({},state,'host_unreachable',103);self.assertEqual(state.pop('pending'),'open')
        for n in range(2):state=step({},state,None,110+n)
        self.assertNotIn('pending',state)
        state=step({},state,None,113);self.assertEqual(state['pending'],'recovery')
        self.assertNotIn('reason',state)

    def test_early_redirect_inherits_project_from_dedicated_log_file(self):
        directory=Path(self.tmp.name)/'redirects';directory.mkdir()
        (directory/'towhub_web.log').write_text(json.dumps({'status':308,'duration':0})+'\n')
        result,gap=read_access(directory,self.db)
        self.assertFalse(gap)
        self.assertEqual(result['towhub_web']['requests'],1)
        self.assertEqual(result['towhub_web']['redirects'],1)

    def test_traffic_alert_distinguishes_volume_from_resource_exhaustion(self):
        sample=healthy(1800000000)
        sample['projects']['web'].update(requests=180,redirects=100,client_errors=70,classified_statuses=180,cpu_pct=2.0)
        history=[]
        for n in range(1,41):
            item=healthy(sample['ts']-n*60)
            item['projects']['web'].update(requests=180 if n<=4 else 1)
            history.append(item)
        finding=next(f for f in evaluate(sample,None,history) if f['code']=='traffic_spike')
        self.assertIn('900 запросов',finding['message'])
        self.assertIn('HTTP 3xx: 100; 4xx: 70',finding['message'])
        self.assertIn('2.0% одного ядра',finding['message'])
        self.assertIn('не подтверждает перегрузку',finding['message'])

    def test_external_wire_payload_has_verified_sender_and_only_owner_recipient(self):
        captured=[]
        class Fake:
            status=200
            def __enter__(self):return self
            def __exit__(self,*args):pass
            def read(self,*args):return b'{"success_count":1}'
        with patch('urllib.request.urlopen',side_effect=lambda r,**kw:(captured.append(r) or Fake())):
            notify({'recipient':'owner@example.invalid'},'event:42','Fixture anomaly')
        payload=json.loads(captured[0].data)
        self.assertEqual(payload['envelope_sender'],'ops@bounce.direct.swapspot.org')
        self.assertEqual(payload['recipients'],[{'email':'owner@example.invalid'}])
        self.assertIn('Message-ID:',payload['content'])

    def test_external_refused_recovery_retains_episode_for_safe_retry(self):
        state={'opened':100,'reason':'monitor_stale','pending':'recovery'}
        cfg={'notifications_enabled':True};path=Path(self.tmp.name)/'external.json'
        def refused(*args):raise urllib.error.URLError(ConnectionRefusedError())
        flush(cfg,state,path,200,refused)
        self.assertEqual(state['opened'],100)
        self.assertEqual(state['pending'],'recovery')
        sent=[];flush(cfg,state,path,260,lambda *args:sent.append(args))
        self.assertEqual(sent[0][1],'100:recovery')
        self.assertNotIn('opened',state)
        self.assertNotIn('delivery_error',state)

    def test_public_project_failure_is_independent_of_container_health(self):
        sample=healthy();sample['project_probes']={'mailhub':{'ok':False}}
        for n in range(2):transition(self.db,evaluate(sample,None,[]),100+n)
        self.assertEqual(self.db.execute('SELECT code,project FROM incidents').fetchone()[:],('public_unavailable','mailhub'))

    def test_external_crash_after_injection_does_not_repeat_recovery(self):
        state={'opened':100,'pending':'recovery','last_attempt':'100:recovery'}
        path=Path(self.tmp.name)/'crash.json';sent=[]
        flush({'notifications_enabled':True},state,path,260,lambda *args:sent.append(args))
        self.assertEqual(sent,[])
        self.assertNotIn('opened',state)

    def test_repeated_traffic_is_recorded_without_repeated_mail_but_resources_notify(self):
        f={'code':'traffic_spike','project':'web','severity':'warning','message':'Volume spike','after':1}
        transition(self.db,[f],100)
        for n in [101,102,103]:transition(self.db,[],n)
        transition(self.db,[f],200)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM incidents').fetchone()[0],2)
        self.assertIsNone(self.db.execute("SELECT key FROM outbox WHERE key='incident:2'").fetchone())
        resource=dict(f,code='oom',severity='critical')
        transition(self.db,[f,resource],201)
        self.assertIsNotNone(self.db.execute("SELECT key FROM outbox WHERE key='incident:3'").fetchone())
        for n in [202,203,204]:transition(self.db,[],n)
        self.assertIsNone(self.db.execute("SELECT key FROM outbox WHERE key='recovery:2'").fetchone())
        transition(self.db,[f],2001)
        self.assertIsNotNone(self.db.execute("SELECT key FROM outbox WHERE key='incident:4'").fetchone())


if __name__=='__main__':unittest.main()
