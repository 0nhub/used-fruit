import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const AUTH_ORIGIN = "https://usedfruit.de";
export const APPLE_ORIGIN = "https://appleid.apple.com";
export const CALLBACK = `${AUTH_ORIGIN}/api/auth/callback`;
export const SESSION_COOKIE = "__Host-used-fruit-apple-auth";
export const FLOW_COOKIE = "__Host-used-fruit-apple-oauth";
export const COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };
export type AuthSession = { kind: "session"; sub: string; name: string; exp: number };
export type AuthFlow = { kind: "flow"; state: string; nonce: string; next: string; exp: number };

function signingKey() {
  const key = process.env.USED_FRUIT_SESSION_SECRET;
  if (!key || key.length < 32) throw new Error("Session signing key unavailable");
  return key;
}
export function seal(value: AuthSession | AuthFlow) {
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${payload}.${createHmac("sha256", signingKey()).update(payload).digest("base64url")}`;
}
export function unseal(value: string | undefined): AuthSession | AuthFlow | null {
  if (!value || value.length > 4096) return null;
  try {
    const [payload, signature, extra] = value.split(".");
    if (!payload || !signature || extra) return null;
    const expected = createHmac("sha256", signingKey()).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!Number.isFinite(parsed.exp) || parsed.exp <= Date.now() / 1000) return null;
    if (parsed.kind === "session" && typeof parsed.sub === "string" && parsed.sub && typeof parsed.name === "string") return parsed;
    if (parsed.kind === "flow" && typeof parsed.state === "string" && typeof parsed.nonce === "string" && typeof parsed.next === "string") return parsed;
  } catch { /* Reject malformed, expired, or unsigned cookies. */ }
  return null;
}
export function safeAuthNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/";
  try {
    const target = new URL(raw, AUTH_ORIGIN);
    if (target.origin !== AUTH_ORIGIN || target.pathname.startsWith("/api/auth") || target.pathname === "/anmelden") return "/";
    return target.pathname + target.search;
  } catch { return "/"; }
}
export function newFlow(next: string | null): AuthFlow {
  return { kind: "flow", state: randomBytes(32).toString("base64url"), nonce: randomBytes(32).toString("base64url"), next: safeAuthNext(next), exp: Math.floor(Date.now() / 1000) + 600 };
}
