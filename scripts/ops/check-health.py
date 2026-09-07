#!/usr/bin/env python3
"""Local operational checks, no credentials or message contents in the output."""
import datetime,json,pathlib,shutil,subprocess,urllib.request
issues=[]
free=shutil.disk_usage('/').free
if free<5_000_000_000:issues.append('disk_below_5GB')
backup=pathlib.Path('/var/backups/used-fruit/databases/last-success')
now=datetime.datetime.now(datetime.timezone.utc)
if not backup.exists() or (now-datetime.datetime.fromisoformat(backup.read_text().strip().replace('Z','+00:00'))).total_seconds()>30*3600:issues.append('backup_overdue')
backup_result=subprocess.run(['systemctl','show','used-fruit-backup.service','--property=Result','--value'],capture_output=True,text=True).stdout.strip()
if backup_result not in ('','success'):issues.append('backup_failed')
for environment,port in [('staging',3003)]:
 try:
  response=urllib.request.urlopen('http://10.0.3.1:'+str(port)+'/api/v1/listings',timeout=10)
  if response.status!=200:issues.append(environment+'_api_unhealthy')
 except Exception:issues.append(environment+'_api_unreachable')
 logs=subprocess.run(['journalctl','-u','used-fruit-'+environment,'--since','5 minutes ago','--output=cat','--no-pager'],capture_output=True,text=True).stdout
 if logs.count('used-fruit-api')>=5:issues.append(environment+'_api_errors')
 sql="SELECT count(*) FROM notification_outbox WHERE state IN ('failed','uncertain') OR (state IN ('pending','processing') AND due_at<now()-interval '15 minutes');"
 try:
  count=int(subprocess.check_output(['sudo','-u','postgres','psql','-X','-At','-d','usedfruit_'+environment,'-c',sql],text=True).strip())
  if count:issues.append(environment+'_delivery_attention_'+str(count))
 except Exception:issues.append(environment+'_database_unreachable')
result={'checkedAt':now.isoformat(),'freeBytes':free,'issues':issues}
path=pathlib.Path('/var/lib/used-fruit/health.json');path.write_text(json.dumps(result)+'\n');path.chmod(0o640)
print(json.dumps(result))
raise SystemExit(bool(issues))
