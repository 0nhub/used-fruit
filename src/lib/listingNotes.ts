import {
  LISTING_NOTE_MAX_LENGTH,
  LISTING_NOTES_STORAGE_KEY,
  PROFILE_EVENT,
} from "@/lib/profile";

export function readListingNotes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LISTING_NOTES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const next: Record<string, string> = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!id || typeof value !== "string") continue;
      const note = value.trim().slice(0, LISTING_NOTE_MAX_LENGTH);
      if (note) next[id] = note;
    }
    return next;
  } catch {
    return {};
  }
}

export function writeListingNote(listingId: string, note: string) {
  const next = readListingNotes();
  const trimmed = note.trim().slice(0, LISTING_NOTE_MAX_LENGTH);
  if (trimmed) next[listingId] = trimmed;
  else delete next[listingId];
  localStorage.setItem(LISTING_NOTES_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(PROFILE_EVENT));
  return next;
}
