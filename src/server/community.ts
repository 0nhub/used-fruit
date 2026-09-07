import { database, transaction } from './db';
import { assertContact, conversationAccess, lockPeople } from './access';
import { ApiError, requireValue, string, uuid } from './http';
import { getListing } from './marketplace';
import { reputationFromStats } from '@/lib/reputation';

export async function publicProfile(userId: string|null, target: string) {
  return transaction(async client=> {
    uuid(target);
    if (userId) await assertContact(client,userId,target);
    const profile=(await client.query(`SELECT id,name,emoji,bio,city,postal_code AS "postalCode",cover_media_id AS "coverMediaId",created_at AS "joinedAt",(SELECT count(*)::int FROM ratings WHERE recipient_id=u.id) AS "ratingCount",(SELECT avg(score)::float FROM ratings WHERE recipient_id=u.id) AS "ratingAverage" FROM users u WHERE id=$1 AND deleted_at IS NULL AND banned_at IS NULL`,[target])).rows[0];
    if (!profile) throw new ApiError(404,'not_found','Profil nicht gefunden.');
    const stats=(await client.query(`SELECT
      (SELECT count(*)::int FROM listings WHERE seller_id=$1 AND status<>'deleted') AS listings,
      (SELECT count(DISTINCT category_id)::int FROM listings WHERE seller_id=$1 AND status<>'deleted') AS categories,
      (SELECT count(*)::int FROM offers o JOIN conversations c ON c.id=o.conversation_id WHERE o.status='accepted' AND c.seller_id=$1) AS sales,
      (SELECT count(*)::int FROM offers o JOIN conversations c ON c.id=o.conversation_id WHERE o.status='accepted' AND c.buyer_id=$1) AS purchases,
      (SELECT count(*)::int FROM ratings WHERE recipient_id=$1 AND score>=4) AS positive,
      (SELECT count(*)::int FROM ratings WHERE recipient_id=$1 AND score<4) AS negative`,[target])).rows[0];
    return {...profile,reputation:reputationFromStats(target,stats)};
  });
}
export async function updateProfile(userId: string,input: Record<string,unknown>) {
  const fields: Record<string,unknown>={};
  for (const [key,column,max] of [['name','name',40],['emoji','emoji',16],['bio','bio',220],['city','city',80],['postalCode','postal_code',5]] as const) if (key in input) fields[column]=string(input[key],max,key==='bio'||key==='city'||key==='postalCode');
  if (fields.postal_code) requireValue(/^\d{5}$/.test(String(fields.postal_code)),'Ungültige Postleitzahl.');
  for (const [key,column] of [['emailNotifications','email_notifications'],['pushNotifications','push_notifications']] as const) if (key in input) { requireValue(typeof input[key]==='boolean','Ungültige Einstellung.'); fields[column]=input[key]; }
  if ('onboardingCompleted' in input) { requireValue(input.onboardingCompleted===true && typeof input.emailNotifications==='boolean','Bitte bestätige deine Benachrichtigungseinstellung.'); fields.onboarding_completed=true; }
  if ('coverMediaId' in input) fields.cover_media_id=input.coverMediaId===null?null:uuid(input.coverMediaId);
  return transaction(async client=> {
    await lockPeople(client,[userId]);
    if (fields.cover_media_id) requireValue((await client.query('SELECT 1 FROM media WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL',[fields.cover_media_id,userId])).rowCount,'Bild nicht gefunden.');
    if (fields.onboarding_completed) {
      const current=(await client.query('SELECT name FROM users WHERE id=$1',[userId])).rows[0];
      requireValue(Boolean(fields.name??current.name),'Bitte gib deinen Namen an.');
    }
    const entries=Object.entries(fields);
    if (entries.length) await client.query(`UPDATE users SET ${entries.map(([column],i)=>column+'=$'+(i+2)).join(',')},updated_at=now() WHERE id=$1 AND deleted_at IS NULL`,[userId,...entries.map(([,value])=>value)]);
    return (await client.query('SELECT * FROM users WHERE id=$1',[userId])).rows[0];
  });
}
export async function favorites(userId: string) {
  const result=await database().query(`SELECT f.listing_id AS id FROM favorites f JOIN listings l ON l.id=f.listing_id JOIN users u ON u.id=l.seller_id WHERE f.user_id=$1 AND l.status='public' AND u.deleted_at IS NULL AND u.banned_at IS NULL AND NOT EXISTS(SELECT 1 FROM user_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=l.seller_id) OR (b.blocked_id=$1 AND b.blocker_id=l.seller_id)) ORDER BY f.created_at DESC`,[userId]);
  return {items:result.rows.map(row=>row.id)};
}
export async function setFavorite(userId: string,id: string,enabled: boolean) {
  uuid(id);
  if (enabled) { await getListing(id,userId); await database().query('INSERT INTO favorites(user_id,listing_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[userId,id]); }
  else await database().query('DELETE FROM favorites WHERE user_id=$1 AND listing_id=$2',[userId,id]);
  return {ok:true};
}
export async function notes(userId: string) { return {items:(await database().query('SELECT listing_id AS "listingId",note FROM listing_notes WHERE user_id=$1',[userId])).rows}; }
export async function setNote(userId: string,id: string,input: Record<string,unknown>,remove=false) {
  uuid(id);
  if (remove) await database().query('DELETE FROM listing_notes WHERE user_id=$1 AND listing_id=$2',[userId,id]);
  else { await getListing(id,userId); await database().query('INSERT INTO listing_notes(user_id,listing_id,note) VALUES($1,$2,$3) ON CONFLICT(user_id,listing_id) DO UPDATE SET note=EXCLUDED.note',[userId,id,string(input.note,200,true)]); }
  return {ok:true};
}
export async function listBlocks(userId: string) { return {items:(await database().query(`SELECT u.id,u.name,u.emoji,b.created_at AS "createdAt" FROM user_blocks b JOIN users u ON u.id=b.blocked_id WHERE b.blocker_id=$1 ORDER BY b.created_at DESC`,[userId])).rows}; }
export async function report(userId: string,input: Record<string,unknown>) {
  const reason=string(input.reason,2000);
  requireValue(input.listingId||input.userId,'Bitte wähle ein Inserat oder Profil.');
  const listing = input.listingId ? await getListing(uuid(input.listingId),userId) : null;
  if (input.userId) await publicProfile(userId,uuid(input.userId));
  if (listing && input.userId) requireValue(listing.sellerId === input.userId, "Inserat und Profil passen nicht zusammen.");
  return (await database().query('INSERT INTO reports(reporter_id,listing_id,reported_user_id,reason) VALUES($1,$2,$3,$4) RETURNING id,status',[userId,input.listingId??null,input.userId??listing?.sellerId??null,reason])).rows[0];
}
export async function rateUser(userId: string,input: Record<string,unknown>) {
  const offerId=uuid(input.offerId);
  requireValue(Number.isInteger(input.score)&&Number(input.score)>=1&&Number(input.score)<=5,'Ungültige Bewertung.');
  const comment=string(input.comment??'',1000,true);
  return transaction(async client=> {
    const offer=(await client.query("SELECT * FROM offers WHERE id=$1 AND status='accepted' AND resolved_at<=now()-interval '2 days'",[offerId])).rows[0];
    if (!offer) throw new ApiError(409,'rating_unavailable','Bewertungen sind zwei Tage nach dem bestätigten Abschluss möglich.');
    const conversation=await conversationAccess(client,offer.conversation_id,userId);
    const target=conversation.buyer_id===userId?conversation.seller_id:conversation.buyer_id;
    const rating=(await client.query('INSERT INTO ratings(offer_id,author_id,recipient_id,score,comment) VALUES($1,$2,$3,$4,$5) ON CONFLICT(offer_id,author_id) DO NOTHING RETURNING id',[offerId,userId,target,input.score,comment])).rows[0];
    if (!rating) throw new ApiError(409,'already_rated','Du hast diesen Abschluss bereits bewertet.');
    return rating;
  });
}
export async function requireAdmin(userId: string) { if (!(await database().query('SELECT 1 FROM admin_users WHERE user_id=$1',[userId])).rowCount) throw new ApiError(403,'forbidden','Keine Berechtigung.'); }
export async function adminReports(userId: string) { await requireAdmin(userId); return {items:(await database().query('SELECT id,reporter_id AS "reporterId",listing_id AS "listingId",reported_user_id AS "reportedUserId",reason,status,created_at AS "createdAt" FROM reports ORDER BY created_at DESC LIMIT 200')).rows}; }
export async function moderate(userId: string,input: Record<string,unknown>) {
  await requireAdmin(userId);
  requireValue(['ban','unban','resolve'].includes(String(input.action)),'Ungültige Maßnahme.');
  const reason=string(input.reason,2000),target=input.userId?uuid(input.userId):null,reportId=input.reportId?uuid(input.reportId):null;
  requireValue(input.action==='resolve'?reportId:target,'Ziel fehlt.');
  return transaction(async client=> {
    if (target) {
      await lockPeople(client,[target]);
      if (input.action==='ban') {
        await client.query('UPDATE users SET banned_at=now() WHERE id=$1',[target]);
        await client.query('UPDATE sessions SET revoked_at=now() WHERE user_id=$1',[target]);
        await client.query('UPDATE device_tokens SET enabled=false WHERE user_id=$1',[target]);
        await client.query("UPDATE notification_outbox SET state='cancelled' WHERE state='pending' AND (recipient_id=$1 OR message_id IN (SELECT id FROM messages WHERE sender_id=$1))",[target]);
      } else if (input.action==='unban') await client.query('UPDATE users SET banned_at=NULL WHERE id=$1',[target]);
    }
    if (reportId) await client.query("UPDATE reports SET status='resolved' WHERE id=$1",[reportId]);
    await client.query('INSERT INTO moderation_actions(admin_id,target_user_id,report_id,action,reason) VALUES($1,$2,$3,$4,$5)',[userId,target,reportId,input.action,reason]);
    return {ok:true};
  });
}

export async function ownRatings(userId:string) {
  return {items:(await database().query(`SELECT r.id,c.id AS "threadId",c.listing_id AS "listingId",r.author_id AS "fromKey",r.recipient_id AS "toKey",CASE WHEN r.recipient_id=c.seller_id THEN 'seller' ELSE 'buyer' END AS "toRole",CASE WHEN score>=4 THEN 'positive' ELSE 'negative' END AS sentiment,r.created_at AS "createdAt" FROM ratings r JOIN offers o ON o.id=r.offer_id JOIN conversations c ON c.id=o.conversation_id WHERE r.author_id=$1`,[userId])).rows};
}
