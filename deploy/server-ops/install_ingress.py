"""Add only this dashboard and privacy-filtered project access log imports."""
import argparse
import fcntl
import hashlib
import os
from pathlib import Path
import shutil
import subprocess

ROOT=Path('/opt/server-ops')
TARGET=Path('/opt/app-platform-prod/shared/caddy/Caddyfile')
HOSTS={'platform.hubmail.vip, api.logihub.vip':'appplatform_prod','maybachmiami.vip':'maybachmiami_prod',
 'www.maybachmiami.vip':'maybachmiami_prod','logihub.vip':'logihub_prod','www.logihub.vip':'logihub_prod',
 'towhub.vip':'towhub_web','www.towhub.vip':'towhub_web','hubmail.vip':'mailhub','api.hubmail.vip':'mailhub',
 'www.ledgerhound.vip':'ledgerhound','ledgerhound.vip':'ledgerhound','voicedata.hubmail.vip':'voicedata_beta',
 'www.swapspot.org':'swapspot_web','swapspot.org':'swapspot_web'}


def candidate(old):
    if '(server_ops_access)' in old:
        raise RuntimeError('Instrumentation already exists; inspect instead of duplicating it')
    snippet=(Path(__file__).parent/'access-snippet.Caddyfile').read_text()
    old=old.replace('platform.hubmail.vip, api.logihub.vip {',snippet+'\nplatform.hubmail.vip, api.logihub.vip {',1)
    for host,project in HOSTS.items():
        marker='\n'+host+' {'
        assert old.count(marker)==1,host
        insert='\n    import server_ops_access '+project+' '+project+'\n'
        if host=='platform.hubmail.vip, api.logihub.vip':
            insert='''
    map {path} {ops_platform_project} {
        ~^/immigrationtracker-r1a(?:/|$) immigrationtracker_r1a
        ~^/immigrationtracker-sandbox(?:/|$) immigrationtracker_sandbox_demo
        ~^/voicedata(?:/|$) voicedata_beta
        default appplatform_prod
    }
    import server_ops_access appplatform_prod {ops_platform_project}
'''
        if host=='www.swapspot.org':
            insert='''
    map {path} {ops_swapspot_project} {
        ~^/admin/server(?:/|$) server_ops
        default swapspot_web
    }
    import server_ops_access swapspot_web {ops_swapspot_project}
    @server_ops_root path /admin/server
    redir @server_ops_root /admin/server/ 308
    handle_path /admin/server/* {
        request_body {
            max_size 4KB
        }
        reverse_proxy server-ops-web:8793
    }
'''
        old=old.replace(marker,marker+insert,1)
    return old


def main(apply=False):
    with open('/opt/app-platform-prod/shared/release-deploy.lock','a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        before=TARGET.read_bytes();after=candidate(before.decode())
        run=subprocess.run(['docker','exec','-i','appplatform_prod-caddy-1','caddy','validate','--config','/dev/stdin','--adapter','caddyfile'],input=after.encode(),capture_output=True)
        if run.returncode:
            print(run.stderr.decode()[-2000:]);raise SystemExit('Invalid candidate; ingress unchanged')
        (ROOT/'shared/Caddyfile.candidate').write_text(after)
        if apply:
            assert hashlib.sha256(before).digest()==hashlib.sha256(TARGET.read_bytes()).digest()
            backup=ROOT/'shared/Caddyfile.before-server-ops'
            if not backup.exists():shutil.copy2(TARGET,backup);backup.chmod(0o600)
            with TARGET.open('w') as out:out.write(after);out.flush();os.fsync(out.fileno())
            subprocess.run(['docker','kill','--signal=USR1','appplatform_prod-caddy-1'],check=True)
        print('Caddy valid; '+('applied' if apply else 'dry run')+'; '+str(len(HOSTS))+' host blocks instrumented')


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--apply',action='store_true');main(p.parse_args().apply)
