import { NextRequest, NextResponse } from "next/server";
import { authenticate, accountView } from "@/server/accounts";
import { failure } from "@/server/http";
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request, false);
    return NextResponse.json({ user: user ? accountView(user) : null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
