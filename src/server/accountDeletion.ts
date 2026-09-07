import { transaction } from './db';
import { lockPeople } from './access';

export async function revokeSession(id: string) {
  await transaction(async client=> {
    await client.query('UPDATE sessions SET revoked_at=now() WHERE id=$1',[id]);
    await client.query('DELETE FROM device_tokens WHERE session_id=$1',[id]);
  });
  return {ok:true};
}
export async function deleteAccount(userId: string) {
  await transaction(async client=> {
    await lockPeople(client,[userId]);
    await client.query('INSERT INTO apple_revocations(token_encrypted,client_id) SELECT refresh_token_encrypted,refresh_client_id FROM auth_identities WHERE user_id=$1 AND refresh_token_encrypted IS NOT NULL AND refresh_client_id IS NOT NULL',[userId]);
    await client.query('DELETE FROM auth_identities WHERE user_id=$1',[userId]);
    await client.query('UPDATE sessions SET revoked_at=now() WHERE user_id=$1',[userId]);
    await client.query('DELETE FROM device_tokens WHERE user_id=$1',[userId]);
    await client.query("UPDATE listings SET status='deleted',private_specs='{}',updated_at=now(),version=version+1 WHERE seller_id=$1",[userId]);
    for (const table of ['favorites','listing_notes','idempotency_keys']) await client.query(`DELETE FROM ${table} WHERE user_id=$1`,[userId]);
    await client.query('DELETE FROM user_blocks WHERE blocker_id=$1 OR blocked_id=$1',[userId]);
    await client.query('DELETE FROM admin_users WHERE user_id=$1',[userId]);
    await client.query('UPDATE media SET deleted_at=now() WHERE user_id=$1 AND deleted_at IS NULL',[userId]);
    await client.query("UPDATE notification_outbox SET state='cancelled' WHERE state='pending' AND (recipient_id=$1 OR message_id IN (SELECT id FROM messages WHERE sender_id=$1))",[userId]);
    await client.query("UPDATE users SET name='Gelöschtes Konto',emoji='🍏',bio='',city='',postal_code='',email=NULL,email_verified=false,email_notifications=false,push_notifications=false,onboarding_completed=false,cover_media_id=NULL,deleted_at=now(),updated_at=now() WHERE id=$1",[userId]);
  });
  return {ok:true};
}
