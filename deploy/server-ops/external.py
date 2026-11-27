"""Independent Netcup watchdog. Uses the existing local DKIM-signed Kumo relay only on real incidents."""
import argparse
import datetime as dt
from email.message import EmailMessage
from email.policy import SMTP
import hashlib
import json
import socket
import subprocess
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

RUN_BUDGET = 32
CALLBACK_RESERVE = 6
MAX_RESPONSE = 65536


class StageDeadline(TimeoutError):
    pass


def event(stage, phase, **fields):
    # Never log URLs, headers, config, response bodies or exception messages.
    print(json.dumps(dict(stage=stage, phase=phase, **fields)), file=sys.stderr, flush=True)


def request_worker(payload):
    stage = payload['stage']
    original = socket.getaddrinfo

    def resolve(*args, **kwargs):
        event(stage, 'dns_start')
        result = original(*args, **kwargs)
        event(stage, 'dns_complete')
        return result

    socket.getaddrinfo = resolve
    try:
        req = urllib.request.Request(payload['url'],
            data=payload.get('data', '').encode() if 'data' in payload else None,
            headers=payload.get('headers', {}), method=payload.get('method', 'GET'))
        event(stage, 'http_start')
        with urllib.request.urlopen(req, timeout=payload['timeout']) as response:
            event(stage, 'headers_received', status=response.status)
            body = response.read(MAX_RESPONSE + 1)
            if len(body) > MAX_RESPONSE:
                raise ValueError('response_limit')
            data = json.loads(body) if payload.get('json') else None
            result = {'ok': True, 'status': response.status, 'data': data}
    except Exception as exc:
        cause = exc.reason if isinstance(exc, urllib.error.URLError) else exc
        code = ('connection_refused' if isinstance(cause, ConnectionRefusedError) else
                'dns_error' if isinstance(cause, socket.gaierror) else
                'socket_timeout' if isinstance(cause, TimeoutError) else
                'http_error' if isinstance(exc, urllib.error.HTTPError) else 'request_error')
        result = {'ok': False, 'error': code}
    event(stage, 'http_complete', ok=result['ok'], error=result.get('error'))
    print(json.dumps(result), flush=True)


def bounded_request(stage, url, *, timeout=5, deadline=None, headers=None,
                    data=None, method='GET', parse_json=False):
    started = time.monotonic()
    budget = min(timeout, deadline - started) if deadline is not None else timeout
    if budget <= 0:
        event(stage, 'deadline_exhausted')
        raise StageDeadline(stage)
    payload = {'stage': stage, 'url': url, 'timeout': budget, 'method': method,
               'headers': headers or {}, 'json': parse_json}
    if data is not None:
        payload['data'] = data.decode()
    event(stage, 'start', budget_seconds=round(budget, 3))
    try:
        # The parent kills and reaps the child even if libc DNS or a trickling
        # response never returns. Secrets travel through stdin, never argv.
        child = subprocess.run([sys.executable, str(Path(__file__).resolve()), '--request-worker'],
            input=json.dumps(payload).encode(), stdout=subprocess.PIPE, timeout=budget,
            check=False, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
    except subprocess.TimeoutExpired:
        event(stage, 'deadline', elapsed_seconds=round(time.monotonic() - started, 3))
        raise StageDeadline(stage) from None
    if child.returncode:
        event(stage, 'worker_failed', exit_code=child.returncode)
        raise RuntimeError('worker_failed')
    result = json.loads(child.stdout)
    event(stage, 'complete', ok=result['ok'], elapsed_seconds=round(time.monotonic() - started, 3))
    if not result['ok']:
        code = result['error']
        if code == 'connection_refused':
            raise urllib.error.URLError(ConnectionRefusedError())
        if code == 'socket_timeout':
            raise StageDeadline(stage)
        raise RuntimeError(code)
    return result


def check(config, deadline=None, diagnostics=None):
    diagnostics = diagnostics if diagnostics is not None else {}
    results=[]
    for stage,url in [('site','https://www.swapspot.org/api/health'),('platform','https://platform.hubmail.vip/ready')]:
        try:
            results.append(bounded_request(stage,url,deadline=deadline)['status']==200)
        except Exception as exc:
            diagnostics[stage]=type(exc).__name__;results.append(False)
    try:
        heartbeat=bounded_request('monitor_heartbeat','https://www.swapspot.org/admin/server/watchdog',
            headers={'Authorization':'Bearer '+config['watch_token']},deadline=deadline,parse_json=True)['data']
        if not isinstance(heartbeat,dict):raise ValueError('heartbeat_schema')
    except Exception as exc:
        diagnostics['monitor_heartbeat']=type(exc).__name__;heartbeat={'ok':False}
    if not any(results):return 'host_unreachable'
    if not heartbeat.get('ok'):return 'monitor_stale'
    if heartbeat.get('notification_backlog'):return 'notifications_stuck'
    return None


def notify(config,key,text):
    msg=EmailMessage();msg['From']='Server Ops <hello@swapspot.org>';msg['To']=config['recipient']
    msg['Subject']='[OVH external] '+text;msg['Date']=dt.datetime.now(dt.timezone.utc)
    msg['Message-ID']='<server-ops-'+hashlib.sha256(key.encode()).hexdigest()[:32]+'@swapspot.org>'
    msg.set_content(text+'\nПроверено с независимого сервера Netcup.\nhttps://www.swapspot.org/admin/server/')
    payload={'envelope_sender':'ops@bounce.direct.swapspot.org','recipients':[{'email':config['recipient']}],
             'content':msg.as_bytes(policy=SMTP).decode('utf-8')}
    data=bounded_request('notification','http://127.0.0.1:8000/api/inject/v1',data=json.dumps(payload).encode(),
        headers={'Content-Type':'application/json'},method='POST',timeout=8,
        deadline=config.get('_deadline'),parse_json=True)['data']
    if data.get('success_count')!=1:raise RuntimeError('Kumo did not accept one recipient')


def step(config,state,reason,now,send=notify):
    state.setdefault('bad',0);state.setdefault('good',0)
    if reason:
        state['bad']=state['bad']+1 if state.get('reason')==reason else 1
        state['good']=0;state['reason']=reason
        if state['bad']>=3 and not state.get('opened'):
            state['opened']=now
            state['incident_reason']=reason
            # Persist attempted=True before calling a non-idempotent SMTP injection.
            state['pending']='open'
    else:
        state.pop('reason',None)
        state['bad']=0;state['good']+=1
        if state.get('opened') and state['good']>=3:state['pending']='recovery'
    return state


def run(config_path):
    deadline=time.monotonic()+RUN_BUDGET
    cfg=json.loads(Path(config_path).read_text());path=Path(cfg['state_file']);path.parent.mkdir(parents=True,exist_ok=True)
    cfg['_deadline']=deadline-CALLBACK_RESERVE
    state=json.loads(path.read_text()) if path.exists() else {};now=int(time.time());diagnostics={}
    reason=check(cfg,deadline=cfg['_deadline'],diagnostics=diagnostics)
    state['check_errors']=diagnostics
    state=step(cfg,state,reason,now)
    flush(cfg,state,path,now)
    state['checked_at']=int(time.time());persist(path,state)
    delivered=False
    try:
        result=bounded_request('heartbeat_delivery','https://www.swapspot.org/admin/server/external',
            data=json.dumps({k:state.get(k) for k in ['checked_at','reason','opened','accepted_at','delivery_error']}).encode(),
            headers={'Authorization':'Bearer '+cfg['watch_token'],'Content-Type':'application/json'},
            method='POST',deadline=deadline,parse_json=True)
        if result['status']!=200 or result['data'].get('ok') is not True:raise ValueError('delivery_rejected')
        delivered=True;state.pop('heartbeat_delivery_error',None)
    except Exception as exc:
        state['heartbeat_delivery_error']=type(exc).__name__
        event('heartbeat_delivery','failed',error=type(exc).__name__)
    persist(path,state)
    print(json.dumps({'reason':reason,'opened':state.get('opened'),'checked_at':state['checked_at'],
        'check_errors':diagnostics,'heartbeat_delivered':delivered}),flush=True)
    return 0 if delivered else 1


def persist(path,state):
    tmp=path.with_suffix('.next');tmp.write_text(json.dumps(state));tmp.replace(path)


def flush(cfg,state,path,now,send=notify):
    if state.get('pending') and cfg.get('notifications_enabled'):
        kind=state.pop('pending');key=str(state['opened'])+':'+kind
        if state.get('last_attempt')==key:
            # A killed process may have submitted successfully. Never repeat an
            # ambiguous Kumo injection; a definite refusal clears this marker.
            if kind=='recovery':state.pop('opened',None)
            persist(path,state);return
        state['last_attempt']=key;persist(path,state)
        text=('Восстановлено: ' if kind=='recovery' else 'Сбой: ')+(state.get('incident_reason') or state.get('reason') or 'OVH')
        try:
            send(cfg,key,text);state['accepted_at']=now;state.pop('delivery_error',None)
        except Exception as e:
            state['delivery_error']=type(e).__name__
            # Retry only a definite refusal, never an ambiguous timed-out submission.
            if isinstance(e,urllib.error.URLError) and isinstance(e.reason,ConnectionRefusedError):
                state['pending']=kind;state.pop('last_attempt',None)
        if kind=='recovery' and not state.get('pending'):state.pop('opened',None)


if __name__=='__main__':
    if sys.argv[1:]==['--request-worker']:
        request_worker(json.load(sys.stdin))
    else:
        p=argparse.ArgumentParser();p.add_argument('--config',required=True);sys.exit(run(p.parse_args().config))
