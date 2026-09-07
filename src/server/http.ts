import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new ApiError(400, "invalid_input", message);
}
export function uuid(value: unknown): string {
  requireValue(typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value), "Ungültige ID.");
  return value;
}
export function string(value: unknown, max = 4000, allowEmpty = false): string {
  requireValue(typeof value === "string" && value.trim().length <= max && (allowEmpty || value.trim().length > 0), "Bitte prüfe deine Eingabe.");
  return value.trim();
}
export async function body(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new ApiError(415, "content_type", "JSON erforderlich.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "invalid_input", "Eingabe fehlt.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > 65536) { await reader.cancel(); throw new ApiError(413, "too_large", "Eingabe zu groß."); }
    chunks.push(part.value);
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    requireValue(parsed && typeof parsed === "object" && !Array.isArray(parsed), "Ungültige Eingabe.");
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "invalid_json", "Ungültige Eingabe.");
  }
}
export function failure(error: unknown) {
  const requestId = randomUUID();
  if (error instanceof ApiError && error.status >= 500) console.error("used-fruit-api", requestId, error.code);
  if (error instanceof ApiError) return NextResponse.json({ error: { code: error.code, message: error.message, requestId } }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  // Do not log SQL parameters, credentials, email addresses or message contents.
  console.error("used-fruit-api", requestId, error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ error: { code: "internal_error", message: "Das hat nicht geklappt. Bitte versuche es erneut.", requestId } }, { status: 500, headers: { "Cache-Control": "no-store" } });
}
