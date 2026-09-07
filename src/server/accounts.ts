import { createHash, randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import type { NextRequest } from "next/server";
import { AUTH_ORIGIN, SESSION_COOKIE, unseal } from "@/lib/auth";
import { database, transaction, type Transaction } from "./db";
import { ApiError, requireValue } from "./http";

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
export interface Account {
  id: string; name: string; emoji: string; bio: string; city: string; postal_code: string;
  email: string | null; email_verified: boolean; email_notifications: boolean; push_notifications: boolean;
  onboarding_completed: boolean; cover_media_id: string | null;
  session_id: string; session_kind: "web" | "ios";
}
function encryptionKey() {
  const value = process.env.USED_FRUIT_DATA_KEY;
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) throw new Error("Data encryption key unavailable");
  return Buffer.from(value, "hex");
}
export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64");
}
export function decryptSecret(value: string) {
  const bytes = Buffer.from(value, "base64");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), bytes.subarray(0, 12));
  decipher.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8");
}
export async function appleAccount(client: Transaction, apple: {sub: string; email?: string}, name: string, refreshToken?: string, clientId?: string) {
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", ["apple:" + apple.sub]);
  const found = await client.query("SELECT u.* FROM users u JOIN auth_identities a ON a.user_id=u.id WHERE a.provider='apple' AND a.subject=$1 FOR UPDATE OF u", [apple.sub]);
  let user = found.rows[0];
  if (user?.banned_at || user?.deleted_at) throw new ApiError(403, "account_unavailable", "Dieses Konto ist nicht verfügbar.");
  if (!user) {
    user = (await client.query("INSERT INTO users(name,email,email_verified) VALUES($1,$2,$3) RETURNING *", [name.slice(0,40), apple.email ?? null, Boolean(apple.email)])).rows[0];
    await client.query("INSERT INTO auth_identities(user_id,provider,subject) VALUES($1,'apple',$2)", [user.id, apple.sub]);
  } else if (apple.email) {
    user = (await client.query("UPDATE users SET email=$2,email_verified=true,updated_at=now() WHERE id=$1 RETURNING *", [user.id, apple.email])).rows[0];
  }
  if (refreshToken) await client.query("UPDATE auth_identities SET refresh_token_encrypted=$2,refresh_client_id=$3 WHERE user_id=$1", [user.id, encryptSecret(refreshToken), clientId ?? process.env.APPLE_CLIENT_ID]);
  return user;
}
export async function createSession(client: Transaction, userId: string, kind: "web" | "ios", familyId?: string) {
  const access = randomBytes(32).toString("base64url");
  const refresh = kind === "ios" ? randomBytes(48).toString("base64url") : null;
  const ttl = kind === "ios" ? 900 : 3600;
  const result = await client.query(`INSERT INTO sessions(user_id,token_hash,refresh_hash,kind,expires_at,refresh_expires_at,family_id)
    VALUES($1,$2,$3,$4,now()+$5*interval '1 second',CASE WHEN $4='ios' THEN now()+interval '30 days' END,COALESCE($6::uuid,gen_random_uuid())) RETURNING id`,
    [userId, sha256(access), refresh ? sha256(refresh) : null, kind, ttl, familyId ?? null]);
  return { id: result.rows[0].id as string, accessToken: access, refreshToken: refresh, expiresIn: ttl };
}
export async function authenticate(request: NextRequest, required = true): Promise<Account | null> {
  if (!process.env.DATABASE_URL) {
    if (required) throw new ApiError(401, "unauthorized", "Bitte melde dich an.");
    return null;
  }
  const bearer = request.headers.get("authorization");
  let clause = "s.id=$1::uuid", parameter: string | undefined;
  if (bearer) {
    if (!/^Bearer [A-Za-z0-9_-]{43}$/.test(bearer)) throw new ApiError(401, "unauthorized", "Bitte melde dich an.");
    clause = "s.token_hash=$1 AND s.kind='ios'";
    parameter = sha256(bearer.slice(7));
  } else {
    const value = unseal(request.cookies.get(SESSION_COOKIE)?.value);
    if (value?.kind === "session" && "sid" in value && typeof value.sid === "string") parameter = value.sid;
    if (!["GET", "HEAD"].includes(request.method) && request.headers.get("origin") !== (process.env.USED_FRUIT_ORIGIN || AUTH_ORIGIN)) throw new ApiError(403, "invalid_origin", "Ungültige Anfrage.");
  }
  const result = parameter ? await database().query<Account>(`SELECT u.*,s.id AS session_id,s.kind AS session_kind FROM sessions s JOIN users u ON u.id=s.user_id WHERE ${clause} AND s.revoked_at IS NULL AND s.expires_at>now() AND u.deleted_at IS NULL AND u.banned_at IS NULL`, [parameter]) : null;
  const user = result?.rows[0] ?? null;
  if (!user && (required || bearer !== null)) throw new ApiError(401, "unauthorized", "Bitte melde dich an.");
  return user;
}
export function accountView(user: Account) {
  return { id: user.id, name: user.name, emoji: user.emoji, bio: user.bio, city: user.city, postalCode: user.postal_code,
    coverMediaId: user.cover_media_id, email: user.email, emailVerified: user.email_verified,
    emailNotifications: user.email_notifications, pushNotifications: user.push_notifications, onboardingCompleted: user.onboarding_completed };
}
export async function refreshSession(raw: unknown) {
  requireValue(typeof raw === "string" && /^[A-Za-z0-9_-]{64}$/.test(raw), "Ungültige Sitzung.");
  const result = await transaction(async client => {
    const row = (await client.query("SELECT s.*,u.banned_at,u.deleted_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.refresh_hash=$1 FOR UPDATE OF s", [sha256(raw)])).rows[0];
    if (!row) return null;
    if (row.revoked_at || row.banned_at || row.deleted_at || new Date(row.refresh_expires_at).getTime() <= Date.now()) {
      await client.query("UPDATE sessions SET revoked_at=now() WHERE family_id=$1", [row.family_id]);
      await client.query("UPDATE device_tokens SET enabled=false WHERE session_id IN (SELECT id FROM sessions WHERE family_id=$1)", [row.family_id]);
      return null;
    }
    await client.query("UPDATE sessions SET revoked_at=now() WHERE id=$1", [row.id]);
    const next = await createSession(client, row.user_id, "ios", row.family_id);
    await client.query("UPDATE device_tokens SET session_id=$2 WHERE session_id=$1", [row.id, next.id]);
    return next;
  });
  if (!result) throw new ApiError(401, "unauthorized", "Bitte melde dich erneut an.");
  return result;
}
