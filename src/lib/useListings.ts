"use client";

import { CATEGORIES, normalizeConditionId } from "@/data/catalog";
import { SEED_LISTINGS } from "@/data/listings";
import { readBlocked } from "@/lib/messages";
import { readSoldAt } from "@/lib/listingSold";
import { LISTINGS_STORAGE_KEY, PROFILE_EVENT } from "@/lib/profile";
import type { Listing } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";

function readUserListings(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Listing[];
    let changed = false;
    const next = parsed.map((listing) => {
      const condition = normalizeConditionId(listing.condition);
      if (condition === listing.condition) return listing;
      changed = true;
      return { ...listing, condition };
    });
    if (changed) localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export function useListings() {
  const [blocked, setBlocked] = useState<string[]>([]);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [soldAt, setSoldAt] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setBlocked(readBlocked());
      setUserListings(readUserListings());
      setSoldAt(readSoldAt());
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

  const allListings = useMemo(() => {
    const allowed = new Set(CATEGORIES.map((c) => c.id));
    return [...userListings, ...SEED_LISTINGS]
      .filter((listing) => allowed.has(listing.categoryId))
      .map((listing) => (soldAt[listing.id] ? { ...listing, soldAt: soldAt[listing.id] } : listing));
  }, [userListings, soldAt]);

  const listings = useMemo(
    () =>
      allListings.filter(
        (listing) =>
          !blocked.includes(listing.sellerName.trim().toLowerCase()) && !listing.soldAt && (!listing.visibility || listing.visibility === "public"),
      ),
    [allListings, blocked],
  );

  const persist = useCallback((next: Listing[]) => {
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(PROFILE_EVENT));
    return next;
  }, []);

  const addListing = useCallback((listing: Listing) => {
    setUserListings((prev) => persist([listing, ...prev]));
  }, [persist]);

  const renameSeller = useCallback((sellerName: string, sellerEmoji?: string) => {
    setUserListings((prev) =>
      persist(
        prev.map((listing) => ({
          ...listing,
          sellerName,
          ...(sellerEmoji ? { sellerEmoji } : {}),
        })),
      ),
    );
  }, [persist]);

  const clearUserListings = useCallback(() => {
    setUserListings(persist([]));
  }, [persist]);

  const getListing = useCallback(
    (id: string) => allListings.find((l) => l.id === id && !blocked.includes(l.sellerName.trim().toLowerCase())),
    [allListings, blocked],
  );

  const updateListing = useCallback((id: string, patch: Partial<Listing>) => {
    setUserListings((prev) =>
      persist(prev.map((listing) => (listing.id === id ? { ...listing, ...patch } : listing))),
    );
  }, [persist]);

  const removeListing = useCallback((id: string) => {
    setUserListings((prev) => persist(prev.filter((listing) => listing.id !== id)));
  }, [persist]);

  return {
    listings,
    allListings,
    userListings,
    addListing,
    updateListing,
    removeListing,
    getListing,
    renameSeller,
    clearUserListings,
    ready,
  };
}
