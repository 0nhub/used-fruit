import { NextRequest, NextResponse } from "next/server";
import { AUTH_ORIGIN, APPLE_ORIGIN, CALLBACK, COOKIE_OPTIONS, FLOW_COOKIE, newFlow, safeAuthNext, seal } from "@/lib/auth";

import { appleCredentials } from "@/lib/appleAuth";

export async function GET(request: NextRequest) {
  try {
    const { clientId } = appleCredentials();
    const flow = newFlow(request.nextUrl.searchParams.get("next"));
    const url = new URL("/auth/authorize", APPLE_ORIGIN);
    url.search = new URLSearchParams({ client_id: clientId, redirect_uri: CALLBACK, response_type: "code", scope: "name email", response_mode: "form_post", state: flow.state, nonce: flow.nonce }).toString();
    const response = NextResponse.redirect(url);
    response.cookies.set(FLOW_COOKIE, seal(flow), { ...COOKIE_OPTIONS, sameSite: "none", maxAge: 600 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.redirect(`${AUTH_ORIGIN}/anmelden?error=configuration&next=${encodeURIComponent(safeAuthNext(request.nextUrl.searchParams.get("next")))}`);
  }
}
