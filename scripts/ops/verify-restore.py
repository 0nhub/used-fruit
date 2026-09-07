#!/usr/bin/env python3
"""Restore a complete staging dump into a disposable database and compare data."""
import os,pathlib,subprocess,tempfile,uuid
assert os.geteuid()==0,'Run as root on the database host'
name='usedfruit_restore_check_'+uuid.uuid4().hex[:12]
def postgres(*args,**kwargs):
 return subprocess.run(['sudo','-u','postgres',*args],check=True,**kwargs)
def fingerprint(database):
 query="SELECT json_build_object('users',(SELECT count(*) FROM users),'listings',(SELECT count(*) FROM listings),'messages',(SELECT count(*) FROM messages),'outbox',(SELECT count(*) FROM notification_outbox),'messageContent',(SELECT md5(coalesce(string_agg(id::text||text,'' ORDER BY id),'')) FROM messages))::text;"
 return postgres('psql','-X','-At','-d',database,'-c',query,capture_output=True,text=True).stdout.strip()
with tempfile.TemporaryDirectory(prefix='usedfruit-restore-',dir='/var/backups/used-fruit') as folder:
 dump=pathlib.Path(folder)/'staging.dump'
 expected=fingerprint('usedfruit_staging')
 with dump.open('wb') as target:postgres('pg_dump','-Fc','--no-owner','--no-acl','usedfruit_staging',stdout=target)
 postgres('createdb',name)
 try:
  with dump.open('rb') as source:postgres('pg_restore','--no-owner','--no-acl','--exit-on-error','-d',name,stdin=source,stdout=subprocess.DEVNULL)
  assert fingerprint(name)==expected,'Restored data differs'
  print('PASS staging dump restored with identical user/listing/message/outbox counts and message content')
 finally:postgres('dropdb',name)
