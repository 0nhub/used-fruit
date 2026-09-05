import { createPrivateKey, createPublicKey, sign, verify, type JsonWebKey } from "crypto";
import { readFileSync } from "fs";
import { APPLE_ORIGIN } from "./auth";

type AppleKey = JsonWebKey & { kid: string; alg: string; use: string };
let keyCache: { keys: AppleKey[]; expires: number } | undefined;

export function appleCredentials() {
  const clientId = process.env.APPLE_CLIENT_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const keyPath = process.env.APPLE_PRIVATE_KEY_PATH;
  if (!clientId || !teamId || !keyId || !keyPath) throw new Error("Apple sign-in is not configured");
  return { clientId, teamId, keyId, keyPath };
}

export function appleClientSecret() {
  const { clientId, teamId, keyId, keyPath } = appleCredentials();
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ iss: teamId, iat: now, exp: now + 300, aud: APPLE_ORIGIN, sub: clientId })).toString("base64url");
  const input = `${header}.${payload}`;
  const key = createPrivateKey(readFileSync(keyPath));
  return `${input}.${sign("sha256", Buffer.from(input), { key, dsaEncoding: "ieee-p1363" }).toString("base64url")}`;
}

export function verifyAppleToken(token: string, keys: AppleKey[], clientId: string, nonce: string) {
  if (typeof token !== "string" || token.length > 16384) throw new Error("Invalid identity token");
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) throw new Error("Malformed token");
  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("Unsupported token signature");
  const jwk = keys.find(key => key.kid === header.kid && key.alg === "RS256" && key.kty === "RSA" && key.use === "sig");
  if (!jwk) throw new Error("Unknown Apple key");
  const key = createPublicKey({ key: jwk, format: "jwk" });
  if (!verify("RSA-SHA256", Buffer.from(`${parts[0]}.${parts[1]}`), key, Buffer.from(parts[2], "base64url"))) throw new Error("Invalid token signature");
  const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== APPLE_ORIGIN || claims.aud !== clientId || claims.nonce !== nonce ||
      !Number.isFinite(claims.exp) || claims.exp <= now || !Number.isFinite(claims.iat) || claims.iat > now + 60 ||
      typeof claims.sub !== "string" || !claims.sub || claims.sub.length > 255) throw new Error("Invalid token claims");
  return { sub: claims.sub as string };
}

export async function applePublicKeys() {
  if (keyCache && keyCache.expires > Date.now()) return keyCache.keys;
  const response = await fetch(`${APPLE_ORIGIN}/auth/keys`, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Apple keys unavailable");
  const data = await response.json();
  if (!Array.isArray(data.keys) || !data.keys.length) throw new Error("Apple keys unavailable");
  keyCache = { keys: data.keys, expires: Date.now() + 5 * 60 * 1000 };
  return keyCache.keys;
}
