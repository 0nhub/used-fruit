import { createPrivateKey, createSign } from "crypto";

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function normalizePrivateKey(raw: string) {
  let key = raw.replace(/\\n/g, "\n").trim();
  if (!key.includes("BEGIN PRIVATE KEY")) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
  }
  return key;
}

/** Static Maps token or a short-lived JWT signed with the Maps .p8 key. */
export function createMapKitToken(origin?: string | null) {
  const staticToken = process.env.MAPKIT_TOKEN ?? process.env.NEXT_PUBLIC_MAPKIT_TOKEN;
  if (staticToken?.trim()) return staticToken.trim();

  const teamId = process.env.MAPKIT_TEAM_ID?.trim();
  const keyId = process.env.MAPKIT_KEY_ID?.trim();
  const privateKey = process.env.MAPKIT_PRIVATE_KEY;
  if (!teamId || !keyId || !privateKey) return null;

  const header = { alg: "ES256", typ: "JWT", kid: keyId };
  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, string | number> = {
    iss: teamId,
    iat: now,
    exp: now + 50 * 60,
  };
  if (origin) payload.origin = origin;

  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const key = createPrivateKey(normalizePrivateKey(privateKey));
  const signer = createSign("SHA256");
  signer.update(unsigned);
  const signature = signer.sign({ key, dsaEncoding: "ieee-p1363" });
  return `${unsigned}.${signature.toString("base64url")}`;
}
