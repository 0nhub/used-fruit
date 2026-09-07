import {unlink,rename,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {database,transaction} from './db';
import {decryptSecret} from './accounts';
import {appleClientSecret} from '@/lib/appleAuth';
import {APPLE_ORIGIN} from '@/lib/auth';

export async function maintenance() {
  const db=database();
  await db.query("DELETE FROM rate_limits WHERE window_start<now()-interval '1 day'");
  await db.query("DELETE FROM auth_challenges WHERE expires_at<now()-interval '1 day'");
  await db.query("UPDATE device_tokens SET enabled=false WHERE session_id IN (SELECT id FROM sessions WHERE revoked_at IS NOT NULL OR refresh_expires_at<now())");
  const directory=process.env.USED_FRUIT_MEDIA_DIR;
  if(directory) {
    const trash=path.join(path.dirname(directory),'media-trash');await mkdir(trash,{recursive:true,mode:0o750});
    const deleted=(await db.query('SELECT id,filename,deleted_at FROM media WHERE deleted_at IS NOT NULL')).rows;
    for(const image of deleted) {
      // Filenames originate only from our UUID encoder, never from an upload path.
      if(!/^[a-f0-9-]{36}\.webp$/.test(image.filename))continue;
      const target=path.join(trash,image.filename);
      try{await rename(path.join(directory,image.filename),target);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
      if(new Date(image.deleted_at).getTime()<Date.now()-7*86400000) {
        try{await unlink(target);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
        // Keep the tombstone; historical references cannot resurrect the file.
      }
    }
  }
  await transaction(async client=> {
    const job=(await client.query('SELECT * FROM apple_revocations WHERE completed_at IS NULL AND attempts<10 AND due_at<=now() ORDER BY due_at FOR UPDATE SKIP LOCKED LIMIT 1')).rows[0];
    if(!job)return;
    try {
      const response=await fetch(APPLE_ORIGIN+'/auth/revoke',{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:job.client_id,client_secret:appleClientSecret(job.client_id),token:decryptSecret(job.token_encrypted),token_type_hint:'refresh_token'})});
      if(!response.ok)throw new Error('apple_revoke_'+response.status);
      await client.query("UPDATE apple_revocations SET completed_at=now(),token_encrypted='',last_error_code=NULL WHERE id=$1",[job.id]);
    }catch{await client.query("UPDATE apple_revocations SET attempts=attempts+1,due_at=now()+interval '1 hour',last_error_code='apple_revocation_failed' WHERE id=$1",[job.id]);}
  });
}
