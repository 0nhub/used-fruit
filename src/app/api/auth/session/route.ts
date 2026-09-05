import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, unseal } from "@/lib/auth";
export async function GET(request: NextRequest) {
  const session = unseal(request.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ user: session?.kind === "session" ? { id: session.sub, name: session.name } : null }, { headers: { "Cache-Control": "no-store" } });
}
