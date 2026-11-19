import argparse
from concurrent.futures import ThreadPoolExecutor
import datetime as dt
import http.client
import json
import os
import socket
import ssl
import subprocess
import time
import urllib.request
from pathlib import Path

from core import NY, GIB, connect, get_value, put_value, evaluate, transition, save_sample, deliver, digest, service_expectations, scheduled_job_status


class DockerConnection(http.client.HTTPConnection):
    def __init__(self):
        super().__init__('localhost', timeout=4)

    def connect(self):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.settimeout(self.timeout)
        self.sock.connect('/var/run/docker.sock')


def docker(path):
    conn = DockerConnection()
    try:
        conn.request('GET', '/v1.45' + path)
        response = conn.getresponse()
        if response.status != 200:
            raise RuntimeError('Docker HTTP ' + str(response.status))
        return json.load(response)
    finally:
        conn.close()


def probe(url):
    start = time.monotonic()
    try:
        with urllib.request.urlopen(url, timeout=5) as r:
            r.read(4096)
            return {'ok': r.status == 200, 'status': r.status, 'ms': round((time.monotonic()-start)*1000)}
    except Exception as e:
        return {'ok': False, 'error': type(e).__name__, 'ms': round((time.monotonic()-start)*1000)}


def read_access(directory, db):
    previous = get_value(db, 'log_cursors', {})
    cursors, result, gap = {}, {}, False
    budget = 5 * 1024 ** 2
    if not directory.exists():
        return {}, True
    for file in sorted(directory.glob('*.log*'), key=lambda p: p.stat().st_mtime):
        if not file.is_file() or file.suffix == '.gz':
            continue
        stat = file.stat()
        key = str(stat.st_ino)
        offset = previous.get(key, 0)
        if offset > stat.st_size:
            offset = 0
        if budget <= 0:
            gap = gap or stat.st_size > offset
            cursors[key] = offset
            continue
        with file.open('rb') as stream:
            stream.seek(offset)
            data = stream.read(budget)
        end = data.rfind(b'\n') + 1
        chunk = data[:end]
        cursors[key] = offset + end
        budget -= len(chunk)
        gap = gap or cursors[key] < stat.st_size
        for line in chunk.splitlines():
            try:
                row = json.loads(line)
                # Caddy can emit a redirect before log_append executes. Its dedicated
                # per-project filename still gives a trustworthy project boundary.
                project = row.get('project') or file.name.split('.')[0].split('-')[0]
                # Whitelist only operational counters; request/response content is discarded.
                target = result.setdefault(project, {'requests': 0, 'errors': 0, 'successes': 0,
                    'redirects': 0, 'client_errors': 0, 'classified_statuses': 0,
                    'slow': 0, 'response_bytes': 0, 'routes': {}})
                route = row.get('route_group', 'other')
                if route not in ['city_services', 'helper_profile', 'api', 'assets', 'health', 'admin', 'other']:
                    route = 'other'
                target['requests'] += 1
                status = int(row.get('status', 0))
                target['successes'] += int(200 <= status < 300)
                target['redirects'] += int(300 <= status < 400)
                target['client_errors'] += int(400 <= status < 500)
                target['errors'] += int(500 <= status < 600)
                target['classified_statuses'] += int(200 <= status < 600)
                target['slow'] += int(float(row.get('duration', 0)) > 3)
                target['response_bytes'] += max(0, int(row.get('size', 0)))
                target['routes'][route] = target['routes'].get(route, 0) + 1
            except (ValueError, TypeError):
                gap = True
    put_value(db, 'log_cursors', cursors)
    return result, gap


def cache_sizes(container):
    command = ['docker', 'exec', container, 'du', '-sk', '/app/.next/cache', '/app/.next/server/app']
    r = subprocess.run(command, capture_output=True, text=True, timeout=4)
    result = {}
    for line in r.stdout.splitlines():
        count, _, path = line.partition('\t')
        if count.isdigit():
            result['data_cache_bytes' if path.endswith('/cache') else 'cache_bytes'] = int(count) * 1024
    return result


def collect(config, db, now):
    raw = get_value(db, 'raw', {})
    elapsed = now - raw.get('ts', now)
    previous = db.execute('SELECT data FROM samples ORDER BY ts DESC LIMIT 1').fetchone()
    previous = json.loads(previous[0]) if previous else None
    mem = {l.split(':')[0]: int(l.split()[1]) * 1024 for l in Path('/proc/meminfo').read_text().splitlines()}
    cpu_ticks = [int(n) for n in Path('/proc/stat').read_text().splitlines()[0].split()[1:]]
    cpu_total, cpu_idle = sum(cpu_ticks), cpu_ticks[3] + cpu_ticks[4]
    cpu_delta = cpu_total - raw.get('cpu_total', cpu_total)
    host_cpu = None if not cpu_delta else round(100 * (1 - (cpu_idle - raw.get('cpu_idle', cpu_idle)) / cpu_delta), 1)
    stat = os.statvfs('/')
    total, free = stat.f_blocks * stat.f_frsize, stat.f_bavail * stat.f_frsize
    sample = {'ts': now, 'host': {'disk_pct': round(100*(1-free/total), 1), 'disk_free': free, 'disk_total': total,
      'mem_available': mem['MemAvailable'], 'mem_total': mem['MemTotal'], 'cores': os.cpu_count(),
      'load': os.getloadavg()[0], 'cpu_pct': host_cpu}, 'projects': {}, 'services': {}, 'collector_errors': []}
    current = {}
    containers = docker('/containers/json?all=false')
    cached = get_value(db, 'cache_sizes', {})
    for c in containers:
        cid = c['Id']
        project = c.get('Labels', {}).get('com.docker.compose.project', 'standalone')
        service = c.get('Labels', {}).get('com.docker.compose.service', c['Names'][0].lstrip('/'))
        sample['services'][project+'/'+service] = project
        p = sample['projects'].setdefault(project, {'cpu_seconds': 0, 'cpu_pct': None, 'memory': 0,
            'memory_limit_pct': 0, 'cpu_limit_pct': 0, 'log_bytes': 0, 'container_count': 0,
            'requests': 0, 'errors': 0, 'slow': 0, 'response_bytes': 0, 'routes': {}})
        try:
            stats = docker('/containers/'+cid+'/stats?stream=false&one-shot=true')
            info = docker('/containers/'+cid+'/json')
            state, limits = info['State'], info['HostConfig']
            usage = stats['cpu_stats']['cpu_usage']['total_usage']
            old = raw.get('containers', {}).get(cid)
            seconds = max(0, (usage - old['usage']) / 1e9) if old and elapsed > 0 else 0
            pct = seconds / elapsed * 100 if old and elapsed > 0 else None
            p['cpu_seconds'] += seconds
            if pct is not None:
                p['cpu_pct'] = (p['cpu_pct'] or 0) + pct
            cpu_limit = limits.get('NanoCpus', 0) / 1e9 or (limits.get('CpuQuota', 0) / max(1, limits.get('CpuPeriod', 100000)))
            if cpu_limit > 0 and pct is not None:
                p['cpu_limit_pct'] = max(p['cpu_limit_pct'], pct/cpu_limit)
            memory = stats['memory_stats']
            resident = max(0, memory.get('usage', 0) - memory.get('stats', {}).get('inactive_file', 0))
            p['memory'] += resident
            if limits.get('Memory', 0):
                p['memory_limit_pct'] = max(p['memory_limit_pct'], resident/limits['Memory']*100)
            p['container_count'] += 1
            p['unhealthy'] = p.get('unhealthy', False) or state.get('Health', {}).get('Status') == 'unhealthy'
            p['oom'] = p.get('oom', False) or state.get('OOMKilled', False)
            p['restarts'] = p.get('restarts', 0) + info.get('RestartCount', 0)
            log = Path(info.get('LogPath', '/nonexistent'))
            if log.is_file():
                p['log_bytes'] += sum(f.stat().st_size for f in log.parent.glob('*-json.log*') if f.is_file())
            current[cid] = {'usage': usage, 'restarts': info.get('RestartCount', 0)}
            name = c['Names'][0].lstrip('/')
            if name in ['swapspot-web', 'ledgerhound-web', 'logihub-web', 'maybachmiami-web', 'towhub-web']:
                if now - cached.get(name, {}).get('at', 0) >= 300:
                    cached[name] = dict(cache_sizes(cid), at=now)
                for key in ['cache_bytes', 'data_cache_bytes']:
                    if key in cached.get(name, {}):
                        p[key] = p.get(key, 0) + cached[name][key]
        except Exception as exc:
            sample['collector_errors'].append(project+':'+type(exc).__name__)
    put_value(db, 'cache_sizes', cached)
    volumes = docker('/volumes').get('Volumes') or []
    sizes = get_value(db,'volume_sizes',{})
    outdated = sorted(volumes,key=lambda v:sizes.get(v['Name'],{}).get('at',0))
    if outdated:
        volume = outdated[0]
        mount = Path(volume['Mountpoint'])
        if str(mount).startswith('/var/lib/docker/volumes/') and now-sizes.get(volume['Name'],{}).get('at',0)>3600:
            try:
                r=subprocess.run(['du','-sx','-B1',str(mount)],capture_output=True,text=True,timeout=4)
                if r.returncode==0:sizes[volume['Name']]={'bytes':int(r.stdout.split()[0]),'at':now}
            except Exception:pass
    for v in volumes:
        project=(v.get('Labels') or {}).get('com.docker.compose.project','standalone')
        if project not in sample['projects']:continue
        p=sample['projects'][project];p['volume_count']=p.get('volume_count',0)+1
        if v['Name'] in sizes:
            p['volume_bytes']=p.get('volume_bytes',0)+sizes[v['Name']]['bytes']
            p['volumes_measured']=p.get('volumes_measured',0)+1
    put_value(db,'volume_sizes',{v['Name']:sizes[v['Name']] for v in volumes if v['Name'] in sizes})
    put_value(db, 'raw', {'ts': now, 'cpu_total': cpu_total, 'cpu_idle': cpu_idle, 'containers': current})
    access, gap = read_access(Path(config['access_dir']), db)
    sample['log_gap'] = gap
    for name, counts in access.items():
        if name not in sample['projects']:
            # Redirects or short-lived compose projects can have traffic without a running container.
            sample['projects'][name] = {'cpu_seconds': 0, 'cpu_pct': None, 'memory': 0, 'container_count': 0}
        sample['projects'][name].update(counts)
    sample['probes'] = {'site': probe('https://www.swapspot.org/api/health'), 'platform': probe('https://platform.hubmail.vip/ready')}
    targets = {'ledgerhound': 'https://ledgerhound.vip', 'towhub_web': 'https://towhub.vip',
      'voicedata_beta': 'https://voicedata.hubmail.vip', 'mailhub': 'https://hubmail.vip',
      'logihub_prod': 'https://logihub.vip', 'maybachmiami_prod': 'https://maybachmiami.vip'}
    with ThreadPoolExecutor(max_workers=3) as pool:
        sample['project_probes'] = dict(zip(targets, pool.map(probe, targets.values())))
    try:
        context = ssl.create_default_context()
        with socket.create_connection(('www.swapspot.org',443), timeout=5) as sock:
            with context.wrap_socket(sock,server_hostname='www.swapspot.org') as tls:
                sample['tls_days'] = round((ssl.cert_time_to_seconds(tls.getpeercert()['notAfter'])-now)/86400,1)
    except Exception:
        sample['tls_days'] = None
    timer = subprocess.run(['systemctl','is-active','swapspot-daily-report.timer'], capture_output=True,text=True,timeout=3)
    sample['report_timer'] = timer.stdout.strip()
    service = subprocess.run(['systemctl','show','swapspot-daily-report.service','--property=Result,ExecMainStartTimestamp,ExecMainExitTimestamp'], capture_output=True,text=True,timeout=3)
    properties = dict(l.split('=',1) for l in service.stdout.splitlines() if '=' in l)
    sample['report_failed'] = properties.get('Result') not in [None, '', 'success']
    start_day = get_value(db, 'start_day')
    today = dt.datetime.fromtimestamp(now,NY)
    if not start_day:
        start_day = today.date().isoformat();put_value(db,'start_day',start_day)
    last_day = properties.get('ExecMainExitTimestamp', '')
    last_epoch = None
    if last_day:
        parsed = subprocess.run(['date','-d',last_day,'+%s'], capture_output=True,text=True,timeout=2)
        if parsed.returncode == 0:
            last_epoch = int(parsed.stdout.strip())
    sample['report_late'] = (today.hour,today.minute) >= (11,30) and (not last_epoch or dt.datetime.fromtimestamp(last_epoch,NY).date()!=today.date())
    first_seen = get_value(db,'first_seen')
    if not first_seen:first_seen=now;put_value(db,'first_seen',first_seen)
    try:
        external=json.loads(Path('/opt/server-ops/external/latest.json').read_text())
        sample['external_stale']=now-external['checked_at']>300
    except Exception:sample['external_stale']=now-first_seen>300
    sample['expected_services'], sample['one_shot_services'] = service_expectations(
        containers, previous, config.get('one_shot_services', ()), config.get('ignore_services', ()))
    sample['scheduled_jobs'] = {name: dict(scheduled_job_status(job['status_path'], now,
        job['max_age_seconds']), project=job['project'])
        for name, job in config.get('scheduled_jobs', {}).items()}
    return sample, previous


def run(config_path):
    import fcntl  # host collector runs on Linux; log-parser tests also run on Windows
    config = json.loads(Path(config_path).read_text())
    directory = Path(config['state_dir']);directory.mkdir(parents=True, exist_ok=True)
    with (directory/'collector.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX|fcntl.LOCK_NB)
        now = int(time.time()); db = connect(directory/'history.db')
        history = [json.loads(r[0]) for r in db.execute('SELECT data FROM samples WHERE ts>? ORDER BY ts', (now-3900,))]
        sample, previous = collect(config,db,now)
        transition(db,evaluate(sample,previous,history),now)
        save_sample(db,sample)
        digest(db,now)
        db.commit()
        deliver(db,config,now)
        db.commit()
        sample['incidents'] = [dict(r) for r in db.execute('SELECT * FROM incidents WHERE closed IS NULL')]
        sample['notification_pending'] = db.execute('SELECT COUNT(*) FROM outbox WHERE sent IS NULL').fetchone()[0]
        sample['notification_oldest'] = db.execute('SELECT MIN(created) FROM outbox WHERE sent IS NULL').fetchone()[0]
        pending = directory/'snapshot.next'
        pending.write_text(json.dumps(sample));pending.chmod(0o644);pending.replace(directory/'snapshot.json')
        db.close()
        print(json.dumps({'ts':now,'projects':len(sample['projects']),'incidents':len(sample['incidents']),
                          'notification_pending':sample['notification_pending'],'errors':sample['collector_errors']}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser();parser.add_argument('--config',required=True)
    run(parser.parse_args().config)
