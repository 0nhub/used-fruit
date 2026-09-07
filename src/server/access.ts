import { database, type Transaction } from "./db";
import { ApiError, requireValue } from "./http";
import { sha256 } from "./accounts";

export async function rateLimit(key: string, limit: number, seconds = 60) {
  if (!process.env.DATABASE_URL) return;
  const start = new Date(Math.floor(Date.now() / (seconds * 1000)) * seconds * 1000);
  const result = await database().query(`INSERT INTO rate_limits(key,window_start,count) VALUES($1,$2,1)
    ON CONFLICT(key,window_start) DO UPDATE SET count=rate_limits.count+1 RETURNING count`, [key,start]);
  if (result.rows[0].count > limit) throw new ApiError(429, "rate_limited", "Bitte warte einen Moment und versuche es erneut.");
}
export async function lockPeople(client: Transaction, ids: string[]) {
  await client.query("SELECT id FROM users WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE", [ids]);
}
export async function assertContact(client: Transaction, a: string, b: string, allowDeleted = false) {
  const result = await client.query(`SELECT 1 FROM user_blocks WHERE (blocker_id=$1 AND blocked_id=$2) OR (blocker_id=$2 AND blocked_id=$1)
    UNION ALL SELECT 1 FROM users WHERE id IN ($1,$2) AND (banned_at IS NOT NULL OR (NOT $3::boolean AND deleted_at IS NOT NULL))`, [a,b,allowDeleted]);
  if (result.rowCount) throw new ApiError(404, "not_found", "Dieser Inhalt ist nicht verfügbar.");
}
export async function conversationAccess(client: Transaction, id: string, userId: string, readOnly = false) {
  const row = (await client.query("SELECT * FROM conversations WHERE id=$1 AND (buyer_id=$2 OR seller_id=$2)", [id,userId])).rows[0];
  if (!row) throw new ApiError(404, "not_found", "Unterhaltung nicht gefunden.");
  await lockPeople(client, [row.buyer_id,row.seller_id]);
  await assertContact(client,row.buyer_id,row.seller_id,readOnly);
  return row;
}
export async function idempotent<T>(client: Transaction, userId: string, scope: string, key: string | null, input: unknown, work: () => Promise<T>): Promise<T> {
  requireValue(key && /^[A-Za-z0-9_-]{8,128}$/.test(key), "Idempotency-Key erforderlich.");
  const hash = sha256(JSON.stringify(input));
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [userId+":"+scope+":"+key]);
  const existing = (await client.query("SELECT request_hash,response FROM idempotency_keys WHERE user_id=$1 AND scope=$2 AND key=$3", [userId,scope,key])).rows[0];
  if (existing) {
    if (existing.request_hash !== hash) throw new ApiError(409, "idempotency_conflict", "Diese Anfrage wurde bereits mit anderen Daten verwendet.");
    return existing.response as T;
  }
  const response = await work();
  await client.query("INSERT INTO idempotency_keys(user_id,scope,key,request_hash,response) VALUES($1,$2,$3,$4,$5)", [userId,scope,key,hash,JSON.stringify(response)]);
  return response;
}
