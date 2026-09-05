import { NextRequest, NextResponse } from "next/server";
import { AUTH_ORIGIN, COOKIE_OPTIONS, FLOW_COOKIE, SESSION_COOKIE } from "@/lib/auth";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== AUTH_ORIGIN) return new NextResponse(null, { status: 403 });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(SESSION_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set(FLOW_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
