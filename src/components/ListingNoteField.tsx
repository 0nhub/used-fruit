"use client";

import { LISTING_NOTE_MAX_LENGTH } from "@/lib/profile";
import { useListingNotes } from "@/lib/useListingNotes";
import { useEffect, useRef, useState } from "react";

export function ListingNoteField({ listingId }: { listingId: string }) {
  const { notes, setNote } = useListingNotes();
  const stored = notes[listingId] ?? "";
  const [value, setValue] = useState(stored);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setValue(stored);
  }, [stored]);

  return (
    <label className="block">
      <span className="sr-only">Notiz</span>
      <textarea
        value={value}
        maxLength={LISTING_NOTE_MAX_LENGTH}
        rows={2}
        placeholder="Notiz"
        onFocus={() => {
          focused.current = true;
        }}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => {
          focused.current = false;
          if (value.trim() !== stored) setNote(listingId, value);
        }}
        className="min-h-[44px] w-full resize-none rounded-xl border border-uf-border-soft bg-uf-bg-subtle/70 px-3 py-2 text-[13px] leading-snug text-uf-text outline-none placeholder:text-uf-text-tertiary focus:border-uf-border"
      />
    </label>
  );
}
