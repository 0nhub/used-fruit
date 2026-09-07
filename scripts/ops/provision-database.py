#!/usr/bin/env python3
"""Provision isolated Used Fruit databases on the existing PostgreSQL 16 host."""
import os
from pathlib import Path
import secrets
import shutil
import subprocess

def sql(statement):
    return subprocess.check_output(['sudo', '-u', 'postgres', 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-At', '-d', 'postgres'], input=statement, text=True).strip()

assert os.geteuid() == 0
assert shutil.disk_usage('/').free >= 10_000_000_000, 'At least 10 GB free required'
root = Path('/etc/used-fruit')
root.mkdir(mode=0o700, exist_ok=True)
for suffix in ('prod', 'staging'):
    name = 'usedfruit_' + suffix
    config = root / ('database-' + suffix + '.env')
    exists = sql("SELECT 1 FROM pg_roles WHERE rolname = '" + name + "';")
    if not exists:
        assert not config.exists(), 'Inspect existing credentials before recreation'
        password = secrets.token_hex(32)
        fd = os.open(config, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w') as file:
            file.write('DATABASE_URL=postgresql://' + name + ':' + password + '@127.0.0.1:5432/' + name + '\n')
            file.write('USED_FRUIT_MEDIA_DIR=/var/lib/used-fruit/' + suffix + '/media\n')
        sql('CREATE ROLE ' + name + " LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD '" + password + "';")
    else:
        assert config.exists(), 'Existing role has no managed configuration; inspect first'
    if not sql("SELECT 1 FROM pg_database WHERE datname = '" + name + "';"):
        sql('CREATE DATABASE ' + name + ' OWNER ' + name + ';')
    sql('REVOKE ALL ON DATABASE ' + name + ' FROM PUBLIC; GRANT CONNECT ON DATABASE ' + name + ' TO ' + name + ';')
    for leaf in ('media', 'media-trash'):
        path = Path('/var/lib/used-fruit') / suffix / leaf
        path.mkdir(parents=True, exist_ok=True, mode=0o750)
        shutil.chown(path, user='usedfruit', group='usedfruit')
    print(name + ': ready (credentials stored outside source)')
