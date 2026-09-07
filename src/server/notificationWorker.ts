import { randomUUID } from 'node:crypto';
import { database, transaction } from './db';
import { lockPeople } from './access';
import { DeliveryError, sendEmail, sendPush } from './notificationTransport';

export async function eligibility(client: import('./db').Transaction,id:string) {
  return (await client.query(`SELECT o.*,m.sequence,m.sender_id,m.text,m.kind,c.id AS conversation_id,l.title,s.name AS sender_name,u.email,u.email_verified,u.email_suppressed,u.email_notifications,u.push_notifications,p.muted,p.read_sequence,p.active_until,EXISTS(SELECT 1 FROM message_reads mr WHERE mr.message_id=m.id AND mr.user_id=u.id) AS message_read,
    (s.deleted_at IS NOT NULL OR s.banned_at IS NOT NULL OR u.deleted_at IS NOT NULL OR u.banned_at IS NOT NULL OR EXISTS(SELECT 1 FROM user_blocks b WHERE (b.blocker_id=u.id AND b.blocked_id=s.id) OR (b.blocker_id=s.id AND b.blocked_id=u.id))) AS blocked
    FROM notification_outbox o JOIN messages m ON m.id=o.message_id JOIN conversations c ON c.id=m.conversation_id JOIN listings l ON l.id=c.listing_id JOIN users s ON s.id=m.sender_id JOIN users u ON u.id=o.recipient_id JOIN conversation_participants p ON p.conversation_id=c.id AND p.user_id=u.id WHERE o.id=$1`,[id])).rows[0];
}
export function shouldDeliver(job:Record<string,unknown>,now=Date.now()) {
  if(job.blocked||job.muted||job.message_read)return false;
  if(job.channel==='email')return Boolean(job.email&&job.email_verified&&!job.email_suppressed&&job.email_notifications);
  return Boolean(job.push_notifications)&&(!job.active_until||new Date(String(job.active_until)).getTime()<=now);
}
export async function processNextNotification(transport = {sendEmail, sendPush}, onlyJobId: string | null = null) {
  const claimed=await transaction(async client=> {
    // A crash after an external handoff has an unknown outcome. Keep it visible for review.
    await client.query("UPDATE notification_outbox SET state='uncertain',last_error_code='worker_interrupted' WHERE state='processing' AND locked_until<now()");
    return (await client.query(`UPDATE notification_outbox SET state='processing',attempts=attempts+1,locked_until=now()+interval '2 minutes' WHERE id=(SELECT id FROM notification_outbox WHERE state='pending' AND due_at<=now() AND ($1::uuid IS NULL OR id=$1) ORDER BY due_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING id`,[onlyJobId])).rows[0];
  });
  if(!claimed)return false;
  try {
    await transaction(async client=> {
      let job=await eligibility(client,claimed.id);
      await lockPeople(client,[job.recipient_id,job.sender_id]);
      // Lock read state and the outbox while rechecking settings immediately before handoff.
      await client.query('SELECT 1 FROM conversation_participants WHERE conversation_id=$1 AND user_id=$2 FOR UPDATE',[job.conversation_id,job.recipient_id]);
      await client.query('SELECT 1 FROM notification_outbox WHERE id=$1 FOR NO KEY UPDATE',[job.id]);
      job=await eligibility(client,job.id);
      if(job.state!=='processing')return;
      if(!shouldDeliver(job)) { await client.query("UPDATE notification_outbox SET state='cancelled',locked_until=NULL WHERE id=$1",[job.id]);return; }
      const data={sender:job.sender_name,title:job.title,text:job.text,conversationId:job.conversation_id};
      let providerId:string|null=null;
      if(job.channel==='email')providerId=await transport.sendEmail(job.email,job.id,data);
      else {
        const devices=(await client.query(`SELECT d.* FROM device_tokens d JOIN sessions s ON s.id=d.session_id WHERE d.user_id=$1 AND d.enabled AND s.revoked_at IS NULL AND s.refresh_expires_at>now() AND NOT EXISTS(SELECT 1 FROM notification_deliveries nd WHERE nd.outbox_id=$2 AND nd.device_id=d.id AND nd.state IN ('sent','uncertain'))`,[job.recipient_id,job.id])).rows;
        for(const device of devices) {
          // Persist each device result independently: a later device failure cannot resend an earlier one.
          try { await transport.sendPush(device,randomUUID(),data); await database().query("INSERT INTO notification_deliveries(outbox_id,device_id,state) VALUES($1,$2,'sent') ON CONFLICT(outbox_id,device_id) DO UPDATE SET state='sent'",[job.id,device.id]); }
          catch(error) {
            if(error instanceof DeliveryError&&error.invalidDevice) { await client.query('DELETE FROM device_tokens WHERE id=$1',[device.id]);continue; }
            if(error instanceof DeliveryError&&error.uncertain)await database().query("INSERT INTO notification_deliveries(outbox_id,device_id,state) VALUES($1,$2,'uncertain') ON CONFLICT DO NOTHING",[job.id,device.id]);
            throw error;
          }
        }
      }
      await client.query("UPDATE notification_outbox SET state='sent',provider_id=$2,locked_until=NULL,last_error_code=NULL WHERE id=$1",[job.id,providerId]);
    });
  } catch(error) {
    const e=error instanceof DeliveryError?error:new DeliveryError('worker_error',false,true);
    await database().query(`UPDATE notification_outbox SET state=CASE WHEN $2 THEN 'uncertain' WHEN $3 AND attempts<5 THEN 'pending' ELSE 'failed' END,last_error_code=$4,due_at=now()+LEAST(3600,30*power(2,attempts))*interval '1 second',locked_until=NULL WHERE id=$1 AND state='processing'`,[claimed.id,e.uncertain,e.retryable,e.code]);
  }
  return true;
}
