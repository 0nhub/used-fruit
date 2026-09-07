import { NextRequest, NextResponse } from "next/server";
import { AUTH_ORIGIN, COOKIE_OPTIONS, FLOW_COOKIE, SESSION_COOKIE } from "@/lib/auth";
import { authenticate } from "@/server/accounts";
import { revokeSession } from "@/server/accountDeletion";
import { failure } from "@/server/http";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== AUTH_ORIGIN) return new NextResponse(null, { status: 403 });
  try {
    const user = await authenticate(request, false);
    if (user) await revokeSession(user.session_id);
  } catch (error) { return failure(error); }
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(SESSION_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set(FLOW_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
