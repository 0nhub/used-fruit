"use client";

import { currentIdentity, refreshIdentity } from "@/lib/authClient";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, API_EVENT, invalidateApi, showApiError } from "./apiClient";

import { PROFILE_EVENT } from "./profile";

export function useFavorites() {
  const generation = useRef(0);
  const account = useRef<string | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const request = ++generation.current;
    try {
      const user = await refreshIdentity();
      if (request !== generation.current) return;
      if (account.current !== (user?.id ?? null)) { setIds([]); account.current=user?.id ?? null; }
      const next = user ? (await api<{items:string[]}>("/favorites")).items : [];
      if (request === generation.current && currentIdentity()?.id === user?.id) setIds(next);
    } catch { if(request === generation.current) setIds([]); }
    finally { if(request === generation.current) setReady(true); }
  }, []);

  useEffect(() => {
    const changed = () => {
      const id=currentIdentity()?.id ?? null;
      if(account.current===id)return;
      account.current=id;generation.current++;setIds([]);setReady(false);
      queueMicrotask(()=>void refresh());
    };
    window.addEventListener(PROFILE_EVENT, changed);
    refresh();
    window.addEventListener(API_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      generation.current++;
      window.removeEventListener(PROFILE_EVENT, changed);
      window.removeEventListener(API_EVENT, refresh);
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
    try {
      await api("/favorites/" + id, { method: ids.includes(id) ? "DELETE" : "PUT" });
      await refresh();
      invalidateApi();
    } catch (error) { showApiError(error); }
  }, [ids, refresh]);

  return { ids, ready, isFavorite, toggleFavorite };
}
