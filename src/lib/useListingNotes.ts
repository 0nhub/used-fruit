"use client";

import { PROFILE_EVENT } from "@/lib/profile";
import { readListingNotes, writeListingNote } from "@/lib/listingNotes";
import { useCallback, useEffect, useState } from "react";

export function useListingNotes() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setNotes(readListingNotes());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(PROFILE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROFILE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const setNote = useCallback((listingId: string, note: string) => {
    setNotes(writeListingNote(listingId, note));
  }, []);

  return { notes, ready, setNote };
}
