import datetime as dt
import hmac
import json
import os
import sqlite3
import time
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from core import signed_session, valid_session

CONFIG = json.loads(Path(os.environ.get('OPS_AUTH_CONFIG','/run/secrets/ops-auth.json')).read_text())
STATE = Path(os.environ.get('OPS_STATE','/data'))
PREFIX = '/admin/server'
FAILURES = {}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass  # no IPs, cookies, credentials or query strings in web logs

    def path_only(self):
        path = urlsplit(self.path).path
        return path[len(PREFIX):] or '/' if path.startswith(PREFIX) else path

    def respond(self, status, body, kind='application/json; charset=utf-8', cookie=None):
        data = body if isinstance(body, bytes) else json.dumps(body,ensure_ascii=False).encode()
        self.send_response(status)
        for key,value in {'Content-Type':kind,'Content-Length':str(len(data)),'Cache-Control':'no-store',
          'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY',
          'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"}.items():
            self.send_header(key,value)
        if cookie:self.send_header('Set-Cookie',cookie)
        self.end_headers();self.wfile.write(data)

    def authenticated(self):
        try:
            cookie=SimpleCookie();cookie.load(self.headers.get('Cookie',''))
            return any(valid_session(cookie[name].value,CONFIG['admin_key'])
                       for name in ['server_ops_session','swapspot_admin_session'] if name in cookie)
        except Exception:return False

    def do_GET(self):
        path=self.path_only()
        if path=='/healthz':return self.respond(200,{'ok':True})
        if path=='/watchdog':
            token=self.headers.get('Authorization','')
            if not hmac.compare_digest(token,'Bearer '+CONFIG['watch_token']):return self.respond(401,{'error':'Unauthorized'})
            try:
                snap=json.loads((STATE/'snapshot.json').read_text());age=int(time.time()-snap['ts'])
                pending=bool(snap.get('notification_oldest') and time.time()-snap['notification_oldest']>300)
                return self.respond(200 if age<180 else 503,{'ok':age<180,'age_seconds':age,'notification_backlog':pending})
            except Exception:return self.respond(503,{'ok':False})
        if path in ['/', '/app.js','/style.css']:
            name={'/':'index.html','/app.js':'app.js','/style.css':'style.css'}[path]
            kind={'/':'text/html; charset=utf-8','/app.js':'text/javascript; charset=utf-8','/style.css':'text/css; charset=utf-8'}[path]
            return self.respond(200,(Path(__file__).parent/name).read_bytes(),kind)
        if not self.authenticated():return self.respond(401,{'error':'Unauthorized'})
        if path=='/api/state':
            try:
                hours=int(parse_qs(urlsplit(self.path).query).get('hours',['24'])[0]);hours=hours if hours in [12,24,168,720] else 24
                now=int(time.time());db=sqlite3.connect('file:'+str(STATE/'history.db')+'?mode=ro',uri=True,timeout=3);db.row_factory=sqlite3.Row
                latest=json.loads((STATE/'snapshot.json').read_text())
                raw=[json.loads(r[0]) for r in db.execute('SELECT data FROM samples WHERE ts>? ORDER BY ts',(now-min(hours,168)*3600,))]
                # Downsample charts only; tables/daily totals keep every measurement.
                stride=max(1,len(raw)//240)
                chart=[{'ts':r['ts'],'cpu':r['host'].get('cpu_pct'),'memory':r['host']['mem_total']-r['host']['mem_available'],
                        'requests':sum(p.get('requests',0) for p in r['projects'].values())} for r in raw[::stride]]
                incidents=[dict(r) for r in db.execute('SELECT * FROM incidents ORDER BY opened DESC LIMIT 100')]
                daily=[dict(r) for r in db.execute('SELECT * FROM daily WHERE day>=? ORDER BY day,project',((dt.datetime.now(dt.timezone.utc)-dt.timedelta(days=30)).date().isoformat(),))]
                notifications=[dict(r) for r in db.execute('SELECT key,created,sent,attempts,error FROM outbox ORDER BY created DESC LIMIT 30')]
                totals={}
                for sample in raw:
                    for name,p in sample['projects'].items():
                        agg=totals.setdefault(name,{'cpu_seconds':0,'requests':0,'errors':0,'response_bytes':0,'routes':{}})
                        for key in ['cpu_seconds','requests','errors','response_bytes']:agg[key]+=p.get(key,0)
                        for route,count in p.get('routes',{}).items():agg['routes'][route]=agg['routes'].get(route,0)+count
                result={'latest':latest,'chart':chart,'daily':daily,'incidents':incidents,'notifications':notifications,
                        'totals':totals,
                        'age_seconds':now-latest['ts'],'coverage_hours':round((now-raw[0]['ts'])/3600,2) if raw else 0,
                        'hours':hours,'timezone':'America/New_York','cpu_scope':'CPU общего API учтён в AppPlatform; по отдельным тенантам не распределяется.'}
                if hours==720:
                    result['chart']=[{'ts':int(dt.datetime.fromisoformat(r['day']).replace(tzinfo=dt.timezone.utc).timestamp()),
                      'cpu':r['cpu_sum']/r['samples'],'memory':r['memory_sum']/r['samples'],'requests':None}
                      for r in db.execute('SELECT * FROM host_daily WHERE day>=? ORDER BY day',((dt.datetime.now(dt.timezone.utc)-dt.timedelta(days=30)).date().isoformat(),))]
                    result['totals']={}
                    for r in daily:
                        agg=result['totals'].setdefault(r['project'],{'cpu_seconds':0,'requests':0,'errors':0,'response_bytes':0,'routes':{}})
                        for key in ['cpu_seconds','requests','errors']:agg[key]+=r[key]
                        agg['response_bytes']+=r['traffic_bytes']
                try:result['external']=json.loads(Path('/external/latest.json').read_text())
                except Exception:result['external']=None
                db.close();return self.respond(200,result)
            except Exception:return self.respond(503,{'error':'Мониторинг пока не собрал данные или история временно недоступна.'})
        return self.respond(404,{'error':'Not found'})

    def do_POST(self):
        if self.path_only()=='/external':
            if not hmac.compare_digest(self.headers.get('Authorization',''),'Bearer '+CONFIG['watch_token']):return self.respond(401,{'error':'Unauthorized'})
            try:
                n=int(self.headers.get('Content-Length','0'))
                if not 0<n<=2048:raise ValueError()
                incoming=json.loads(self.rfile.read(n))
                safe={k:incoming.get(k) for k in ['checked_at','reason','opened','accepted_at','delivery_error']}
                if not isinstance(safe['checked_at'],int):raise ValueError()
                dest=Path('/external/latest.json');tmp=dest.with_suffix('.next');tmp.write_text(json.dumps(safe));tmp.replace(dest)
                return self.respond(200,{'ok':True})
            except Exception:return self.respond(400,{'error':'Invalid status'})
        origin=self.headers.get('Origin')
        if origin and origin!='https://www.swapspot.org':return self.respond(403,{'error':'Forbidden origin'})
        path=self.path_only()
        if path=='/api/logout':return self.respond(200,{'ok':True},cookie='server_ops_session=; Max-Age=0; Path=/admin/server; Secure; HttpOnly; SameSite=Strict')
        if path!='/api/login':return self.respond(404,{'error':'Not found'})
        length=int(self.headers.get('Content-Length','0'))
        if length>4096:return self.respond(413,{'error':'Too large'})
        # Only Caddy is attached to this private upstream; it sets the real forwarded IP.
        client=self.headers.get('X-Forwarded-For',self.client_address[0]).split(',')[0].strip()
        now=time.time();attempts=[t for t in FAILURES.get(client,[]) if t>now-900]
        if len(attempts)>=10:return self.respond(429,{'error':'Слишком много попыток. Повторите через 15 минут.'})
        try:password=json.loads(self.rfile.read(length)).get('password','')
        except Exception:return self.respond(400,{'error':'Invalid request'})
        if not isinstance(password,str) or not hmac.compare_digest(password.encode(),CONFIG['admin_key'].encode()):
            if len(FAILURES)>1000:FAILURES.clear()
            FAILURES[client]=attempts+[now];return self.respond(401,{'error':'Неверный пароль.'})
        FAILURES.pop(client,None)
        token=signed_session(CONFIG['admin_key'],int(now)+8*3600)
        return self.respond(200,{'ok':True},cookie=f'server_ops_session={token}; Max-Age=28800; Path=/admin/server; Secure; HttpOnly; SameSite=Strict')


if __name__=='__main__':
    ThreadingHTTPServer(('0.0.0.0',int(os.environ.get('PORT','8793'))),Handler).serve_forever()
