#!/usr/bin/env python3
from pathlib import Path
import os,secrets,shutil,subprocess
assert os.geteuid()==0
assert shutil.disk_usage('/').free>=10_000_000_000
root=Path('/etc/used-fruit')
target=root/'backend-staging.env'
if not target.exists():
 source=dict(line.split('=',1) for line in (root/'apple.env').read_text().splitlines() if '=' in line and not line.startswith('#'))
 values={key:source[key] for key in ('APPLE_CLIENT_ID','APPLE_TEAM_ID','APPLE_KEY_ID')}
 values.update(APPLE_NATIVE_CLIENT_ID='de.usedfruit.app',USED_FRUIT_ORIGIN='https://staging.usedfruit.de',USED_FRUIT_SESSION_SECRET=secrets.token_hex(32),USED_FRUIT_DATA_KEY=secrets.token_hex(32))
 fd=os.open(target,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'w') as file:
  for key,value in values.items():file.write(key+'='+value+'\n')
print('Staging secrets configured; values remain on server.')
