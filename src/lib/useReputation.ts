"use client";

import {
  addRating,
  buildReputation,
  pendingRatingsFor,
  readRatings,
  type RatingSentiment,
} from "@/lib/reputation";
import { PROFILE_EVENT } from "@/lib/profile";
import { useListings } from "@/lib/useListings";
import { useMessages } from "@/lib/useMessages";
import type { Thread } from "@/lib/messages";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useReputation(personName?: string) {
  const { allListings, ready: listingsReady } = useListings();
  const { threads, ready: messagesReady } = useMessages();
  const [ratings, setRatings] = useState(() => (typeof window === "undefined" ? [] : readRatings()));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setRatings(readRatings());
      setReady(true);
    };
    refresh();
    window.addEventListener(PROFILE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROFILE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const snapshot = useMemo(
    () => (personName?.trim() ? buildReputation(personName, allListings, threads, ratings) : undefined),
    [personName, allListings, threads, ratings],
  );

  const pending = useMemo(
    () => (personName?.trim() ? pendingRatingsFor(personName, threads, ratings) : []),
    [personName, threads, ratings],
  );

  const rate = useCallback((thread: Thread, fromName: string, sentiment: RatingSentiment) => {
    return addRating({ thread, fromName, sentiment });
  }, []);

  return {
    snapshot,
    pending,
    ratings,
    rate,
    ready: ready && listingsReady && messagesReady,
  };
}
