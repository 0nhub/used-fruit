import { createMapKitToken } from "@/lib/mapkitToken";

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const token = createMapKitToken(origin);
  if (!token) {
    return new Response(null, { status: 404 });
  }
  return new Response(token, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
