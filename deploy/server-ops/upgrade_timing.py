"""Upgrade only count-safe timing log fields; preserve every ingress route/filter."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import time

ADDITIONS = ('    log_append upstream_headers_ms {rp.upstream.latency_ms}\n'
             '    log_append proxy_inclusive_ms {rp.upstream.duration_ms}\n')


def candidate(old):
    anchor = '    log_append route_group {ops_route_group}\n'
    if old.count('(server_ops_access) {') != 1 or old.count(anchor) != 1 \
            or 'log_append upstream_headers_ms' in old or 'log_append proxy_inclusive_ms' in old:
        raise ValueError('Unexpected ingress baseline')
    new = old.replace(anchor, anchor + ADDITIONS, 1)
    assert new.replace(ADDITIONS, '', 1) == old
    return new


def strip_additions(value):
    if isinstance(value, list):
        return [strip_additions(v) for v in value if not (
            isinstance(v, dict) and v.get('handler') == 'log_append'
            and v.get('key') in ('upstream_headers_ms', 'proxy_inclusive_ms'))]
    if isinstance(value, dict):
        return {k: strip_additions(v) for k, v in value.items()}
    return value


def adapted(text):
    p = subprocess.run(['docker', 'exec', '-i', 'appplatform_prod-caddy-1', 'caddy', 'adapt',
                        '--config', '/dev/stdin', '--adapter', 'caddyfile'],
                       input=text.encode(), capture_output=True, timeout=15)
    if p.returncode:
        raise RuntimeError('Caddy adapt failed')  # Do not print config or diagnostics.
    return json.loads(p.stdout)


def write_in_place(path, data):
    import os
    # Docker bind-mounts this file: keep its inode during apply and exact rollback.
    with path.open('wb') as out:
        out.write(data)
        out.flush()
        os.fsync(out.fileno())


def active_config():
    p = subprocess.run(['docker', 'exec', 'appplatform_prod-caddy-1', 'cat', '/config/caddy/autosave.json'],
                       capture_output=True, timeout=5)
    if p.returncode:
        raise RuntimeError('Active Caddy configuration unavailable')
    return json.loads(p.stdout)


def signal_reload(expected):
    # This deployment has admin off and the original file-based caddy run command.
    subprocess.run(['docker', 'kill', '--signal=USR1', 'appplatform_prod-caddy-1'],
                   capture_output=True, timeout=5, check=True)
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        if active_config() == expected:
            return
        time.sleep(.2)
    raise RuntimeError('Caddy reload not confirmed')


def main(apply=False):
    import fcntl
    target = Path('/opt/app-platform-prod/shared/caddy/Caddyfile')
    with open('/opt/app-platform-prod/shared/release-deploy.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        before = target.read_bytes()
        after = candidate(before.decode()).encode()
        old_config, new_config = adapted(before.decode()), adapted(after.decode())
        assert strip_additions(new_config) == old_config
        assert active_config() == old_config
        info = subprocess.run(['docker', 'inspect', 'appplatform_prod-caddy-1'],
                              capture_output=True, timeout=5, check=True)
        cmd = json.loads(info.stdout)[0]['Config']['Cmd']
        assert cmd == ['caddy', 'run', '--config', '/etc/caddy/Caddyfile', '--adapter', 'caddyfile']
        p = subprocess.run(['docker', 'exec', '-i', 'appplatform_prod-caddy-1', 'caddy', 'validate',
                            '--config', '/dev/stdin', '--adapter', 'caddyfile'],
                           input=after, capture_output=True, timeout=20)
        if p.returncode:
            raise RuntimeError('Caddy validate failed')
        record = {'before_sha256': hashlib.sha256(before).hexdigest(),
                  'after_sha256': hashlib.sha256(after).hexdigest(), 'semantic_routes_unchanged': True}
        if apply:
            backup = Path('/opt/server-ops/shared/Caddyfile.before-runtime-timing-20261127')
            if backup.exists():
                assert backup.read_bytes() == before
            else:
                backup.write_bytes(before)
                backup.chmod(0o600)
            assert target.read_bytes() == before
            write_in_place(target, after)
            try:
                signal_reload(new_config)
            except Exception:
                write_in_place(target, before)
                signal_reload(old_config)
                raise
            record['backup'] = str(backup)
        print(json.dumps(record))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    main(parser.parse_args().apply)
