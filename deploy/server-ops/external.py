"""Independent Netcup watchdog. Uses the existing local DKIM-signed Kumo relay only on real incidents."""
import argparse
import datetime as dt
from email.message import EmailMessage
from email.policy import SMTP
import hashlib
import json
import time
import urllib.request
import urllib.error
from pathlib import Path


def check(config):
    results=[]
    for url in ['https://www.swapspot.org/api/health','https://platform.hubmail.vip/ready']:
        try:
            with urllib.request.urlopen(url,timeout=5) as r:results.append(r.status==200)
        except Exception:results.append(False)
    try:
        req=urllib.request.Request('https://www.swapspot.org/admin/server/watchdog',headers={'Authorization':'Bearer '+config['watch_token']})
        with urllib.request.urlopen(req,timeout=5) as r:heartbeat=json.load(r)
    except Exception:heartbeat={'ok':False}
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
    req=urllib.request.Request('http://127.0.0.1:8000/api/inject/v1',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json'},method='POST')
    with urllib.request.urlopen(req,timeout=8) as r:data=json.load(r)
    if data.get('success_count')!=1:raise RuntimeError('Kumo did not accept one recipient')


def step(config,state,reason,now,send=notify):
    state.setdefault('bad',0);state.setdefault('good',0)
    if reason:
        state['bad']=state['bad']+1 if state.get('reason')==reason else 1
        state['good']=0;state['reason']=reason
        if state['bad']>=3 and not state.get('opened'):
            state['opened']=now
            # Persist attempted=True before calling a non-idempotent SMTP injection.
            state['pending']='open'
    else:
        state['bad']=0;state['good']+=1
        if state.get('opened') and state['good']>=3:state['pending']='recovery'
    return state


def run(config_path):
    cfg=json.loads(Path(config_path).read_text());path=Path(cfg['state_file']);path.parent.mkdir(parents=True,exist_ok=True)
    state=json.loads(path.read_text()) if path.exists() else {};now=int(time.time());reason=check(cfg)
    state=step(cfg,state,reason,now)
    if state.get('pending') and cfg.get('notifications_enabled'):
        kind=state.pop('pending');key=str(state['opened'])+':'+kind
        state['last_attempt']=key;path.write_text(json.dumps(state))
        text=('Восстановлено: ' if kind=='recovery' else 'Сбой: ')+state.get('reason','OVH')
        try:notify(cfg,key,text);state['accepted_at']=now
        except Exception as e:
            state['delivery_error']=type(e).__name__
            # Retry only a definite refusal, never an ambiguous timed-out submission.
            if isinstance(e,urllib.error.URLError) and isinstance(e.reason,ConnectionRefusedError):state['pending']=kind
        if kind=='recovery':state.pop('opened',None)
    state['checked_at']=now;path.write_text(json.dumps(state))
    try:
        req=urllib.request.Request('https://www.swapspot.org/admin/server/external',data=json.dumps({k:state.get(k) for k in ['checked_at','reason','opened','accepted_at','delivery_error']}).encode(),
          headers={'Authorization':'Bearer '+cfg['watch_token'],'Content-Type':'application/json'},method='POST')
        with urllib.request.urlopen(req,timeout=5) as r:r.read(1024)
    except Exception:pass
    print(json.dumps({'reason':reason,'opened':state.get('opened'),'checked_at':now}))


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--config',required=True);run(p.parse_args().config)
