#!/usr/bin/env python3
"""Archive reviewed Used Fruit source releases, verify every file, then reclaim builds.

Run on the deployment host as root. Defaults to inspection; --apply mutates.
Never follows release symlinks, touches the live release, or removes shared dependencies.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile

ROOT = Path('/opt/used-fruit-releases')
BACKUPS = Path('/var/backups/used-fruit/releases')
KEEP = {'titles-20260905', 'profile-20260905', 'smooth-20260905'}
REVIEWED = set('about-PAveL1 apple-login-jA19XG block-profiles-get5ra catalog-ui-4Xpj8R chat-entry-0npJYF direct-login-8C3tUx faq-Uc6ea4 listing-details-82hC8U listing-number-jlOvO0 map-favorites-8XEUyY map-fullscreen-NfvyXA mobile-back-L8hXnL mobile-footer-eqNIuX mobile-logo-sMp8FH mobile-navigation-Py98hf mobile-navigation-iwInxZ oauth-6y2Edt public-20260905-final publish-login-NLXgAS wizard-defaults-p3FugE'.split())
SKIP = {'node_modules', '.next', '.git'}

def live():
    return Path(subprocess.check_output(['systemctl', 'show', 'used-fruit', '-p', 'WorkingDirectory', '--value'], text=True).strip()).resolve()

def files(path):
    for base, dirs, names in os.walk(path, followlinks=False):
        dirs[:] = [d for d in dirs if d not in SKIP and not (Path(base)/d).is_symlink()]
        for name in names:
            file = Path(base)/name
            if file.is_symlink():
                continue
            yield file

def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()

def guard(candidate):
    assert candidate.parent == ROOT and candidate.name in REVIEWED
    assert not candidate.is_symlink() and candidate.is_dir()
    assert candidate.resolve() != live() and candidate.name not in KEEP
    for proc in Path('/proc').glob('[0-9]*/cwd'):
        try:
            cwd = proc.resolve()
            assert cwd != candidate and candidate not in cwd.parents, 'Release still in use'
        except (FileNotFoundError, PermissionError):
            pass
    for other in ROOT.iterdir():
        if other == candidate or not other.is_dir():
            continue
        for base, dirs, names in os.walk(other, followlinks=False):
            dirs[:] = [d for d in dirs if d not in SKIP or (Path(base)/d).is_symlink()]
            for name in dirs + names:
                link = Path(base)/name
                if link.is_symlink():
                    target = link.resolve()
                    assert target != candidate and candidate not in target.parents, 'Referenced by another release'

def main():
    candidates = [ROOT/name for name in sorted(REVIEWED) if (ROOT/name).exists()]
    for path in candidates:
        guard(path)
    print(json.dumps({'active': str(live()), 'keep': sorted(KEEP), 'archive_then_remove': [p.name for p in candidates]}), flush=True)
    if '--apply' not in sys.argv:
        return
    BACKUPS.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(BACKUPS, 0o700)
    for path in candidates:
        guard(path)
        archive = BACKUPS/(path.name + '.tar.gz')
        assert not archive.exists(), 'Existing archive must be inspected before retry'
        manifest = {str(p.relative_to(path)): digest(p) for p in files(path)}
        with tarfile.open(archive, 'w:gz') as tar:
            for name in manifest:
                tar.add(path/name, arcname=name, recursive=False)
        os.chmod(archive, 0o600)
        with tarfile.open(archive, 'r:gz') as tar:
            for name, expected in manifest.items():
                member = tar.extractfile(name)
                assert member is not None and hashlib.sha256(member.read()).hexdigest() == expected
        assert manifest == {str(p.relative_to(path)): digest(p) for p in files(path)}, 'Source changed during archival'
        (BACKUPS/(path.name+'.manifest.json')).write_text(json.dumps(manifest, indent=2))
        guard(path)
        shutil.rmtree(path)
        print('Archived and verified:', path.name, flush=True)
    print('Available bytes:', shutil.disk_usage(ROOT).free, flush=True)

if __name__ == '__main__':
    main()
