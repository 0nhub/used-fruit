import { NextRequest, NextResponse } from "next/server";
import { AUTH_ORIGIN, APPLE_ORIGIN, CALLBACK, COOKIE_OPTIONS, FLOW_COOKIE, SESSION_COOKIE, safeAuthNext, seal, unseal } from "@/lib/auth";

import { appleCredentials, appleClientSecret, applePublicKeys, verifyAppleToken } from "@/lib/appleAuth";

export async function POST(request: NextRequest) {
  const flow = unseal(request.cookies.get(FLOW_COOKIE)?.value);
  let response: NextResponse;
  try {
    if (Number(request.headers.get("content-length")) > 32768) throw new Error("Callback too large");
    const body = await request.text();
    if (body.length > 32768) throw new Error("Callback too large");
    const form = new URLSearchParams(body);
    const state = form.get("state");
    const code = form.get("code");
    if (!flow || flow.kind !== "flow" || state !== flow.state || !code || form.has("error")) throw new Error("Invalid OAuth callback");
    const { clientId } = appleCredentials();
    const clientSecret = appleClientSecret();
    const tokenResponse = await fetch(`${APPLE_ORIGIN}/auth/token`, {
      method: "POST", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15000),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: clientId, client_secret: clientSecret, redirect_uri: CALLBACK }),
    });
    if (!tokenResponse.ok) throw new Error("Token exchange failed");
    const tokens = await tokenResponse.json();
    const user = verifyAppleToken(tokens.id_token, await applePublicKeys(), clientId, flow.nonce);
    // Apple supplies the editable display name only on first authorization.
    let name = "";
    try {
      const supplied = JSON.parse(form.get("user") ?? "{}");
      name = [supplied?.name?.firstName, supplied?.name?.lastName].filter(value => typeof value === "string").join(" ").trim().slice(0, 40);
    } catch { /* Name is optional and never used as the identity. */ }
    response = NextResponse.redirect(new URL(safeAuthNext(flow.next), AUTH_ORIGIN), 303);
    response.cookies.set(SESSION_COOKIE, seal({ kind: "session", sub: `apple:${user.sub}`, name, exp: Math.floor(Date.now() / 1000) + 3600 }), { ...COOKIE_OPTIONS, maxAge: 3600 });
  } catch {
    response = NextResponse.redirect(`${AUTH_ORIGIN}/anmelden?error=signin&next=${encodeURIComponent(safeAuthNext(flow?.kind === "flow" ? flow.next : null))}`, 303);
  }
  response.cookies.set(FLOW_COOKIE, "", { ...COOKIE_OPTIONS, sameSite: "none", maxAge: 0 });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

// Old provider callbacks cannot create an Apple session.
export async function GET() {
  return NextResponse.redirect(`${AUTH_ORIGIN}/anmelden?error=signin`, 303);
}
