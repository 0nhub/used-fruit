import { randomBytes } from 'node:crypto';
import { appleClientSecret, applePublicKeys, verifyAppleToken } from '@/lib/appleAuth';
import { APPLE_ORIGIN } from '@/lib/auth';
import { database, transaction } from './db';
import { accountView, appleAccount, createSession, sha256 } from './accounts';
import { ApiError, string, uuid } from './http';

export async function appleChallenge() {
  const nonce=randomBytes(32).toString('base64url');
  const row=(await database().query("INSERT INTO auth_challenges(nonce_hash,expires_at) VALUES($1,now()+interval '5 minutes') RETURNING id",[sha256(nonce)])).rows[0];
  // Pass nonceHash to ASAuthorizationAppleIDRequest.nonce; no client-side second hashing.
  return {challengeId:row.id,nonceHash:sha256(nonce),expiresIn:300};
}
export async function nativeAppleLogin(input: Record<string,unknown>) {
  const id=uuid(input.challengeId),token=string(input.identityToken,16384),code=string(input.authorizationCode,4096);
  const clientId=process.env.APPLE_NATIVE_CLIENT_ID;
  if (!clientId) throw new ApiError(503,'configuration','Die App-Anmeldung ist noch nicht eingerichtet.');
  const challenge=(await database().query('SELECT nonce_hash FROM auth_challenges WHERE id=$1 AND used_at IS NULL AND expires_at>now()',[id])).rows[0];
  if (!challenge) throw new ApiError(401,'invalid_challenge','Bitte starte die Anmeldung erneut.');
  let apple;
  try { apple=verifyAppleToken(token,await applePublicKeys(),clientId,challenge.nonce_hash); }
  catch { throw new ApiError(401,'invalid_apple_token','Die Apple-Anmeldung konnte nicht bestätigt werden.'); }
  const response=await fetch(`${APPLE_ORIGIN}/auth/token`,{method:'POST',redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',code,client_id:clientId,client_secret:appleClientSecret(clientId)})});
  if (!response.ok) throw new ApiError(401,'invalid_apple_code','Bitte starte die Anmeldung erneut.');
  const tokens=await response.json();
  let exchanged;
  try { exchanged=verifyAppleToken(tokens.id_token,await applePublicKeys(),clientId,challenge.nonce_hash); }
  catch { throw new ApiError(401,'invalid_apple_token','Die Apple-Anmeldung konnte nicht bestätigt werden.'); }
  if (apple.sub!==exchanged.sub || typeof tokens.refresh_token!=='string') throw new ApiError(401,'invalid_apple_token','Die Apple-Anmeldung konnte nicht bestätigt werden.');
  return transaction(async client=> {
    const used=await client.query('UPDATE auth_challenges SET used_at=now() WHERE id=$1 AND used_at IS NULL AND expires_at>now() RETURNING id',[id]);
    if (!used.rowCount) throw new ApiError(401,'invalid_challenge','Bitte starte die Anmeldung erneut.');
    // Apple Service ID and native App ID must be grouped under the same primary App ID.
    // Never link accounts by email, display name or a client-supplied user identifier.
    const user=await appleAccount(client,exchanged,string(input.name??'',40,true),tokens.refresh_token,clientId);
    const session=await createSession(client,user.id,'ios');
    return {...session,user:accountView(user)};
  });
}
