import { PROFILE_EVENT, SOLD_STORAGE_KEY } from "@/lib/profile";

export function readSoldAt(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SOLD_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
  } catch {
    return {};
  }
}

export function markListingSold(listingId: string): string {
  const at = new Date().toISOString();
  const next = { ...readSoldAt(), [listingId]: at };
  localStorage.setItem(SOLD_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(PROFILE_EVENT));
  return at;
}

