"use client";

import { refreshIdentity } from "@/lib/authClient";
import { FAVORITES_STORAGE_KEY, PROFILE_EVENT } from "@/lib/profile";
import { useCallback, useEffect, useState } from "react";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setIds(readFavorites());
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

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggleFavorite = useCallback(async (id: string) => {
    const identity = await refreshIdentity();
    if (!identity) {
      sessionStorage.setItem("used-fruit-pending-favorite", id);
      window.location.assign("/anmelden?next=/favoriten");
      return;
    }
    const prev = readFavorites();
    const next = prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
    setIds(next);
    window.dispatchEvent(new Event(PROFILE_EVENT));
  }, []);

  return { ids, ready, isFavorite, toggleFavorite };
}
