"use client";

import { api, API_EVENT, invalidateApi, showApiError } from "./apiClient";
import { currentIdentity, refreshIdentity } from "./authClient";
import { useCallback, useEffect, useRef, useState } from "react";

import { PROFILE_EVENT } from "./profile";

export function useListingNotes() {
  const generation = useRef(0);
  const account = useRef<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const request = ++generation.current;
    try {
      const user = await refreshIdentity();
      if (request !== generation.current) return;
      if (account.current !== (user?.id ?? null)) { setNotes({}); account.current=user?.id ?? null; }
      const next = user ? Object.fromEntries((await api<{items:{listingId:string;note:string}[]}>("/notes")).items.map(row=>[row.listingId,row.note])) : {};
      if (request === generation.current && currentIdentity()?.id === user?.id) setNotes(next);
    } catch { if(request === generation.current) setNotes({}); }
    finally { if(request === generation.current) setReady(true); }
  }, []);

  useEffect(() => {
    const changed = () => {
      const id=currentIdentity()?.id ?? null;
      if(account.current===id)return;
      account.current=id;generation.current++;setNotes({});setReady(false);
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

  const setNote = useCallback(async (listingId: string, note: string) => {
    try { await api("/notes/"+listingId, {method:"PUT",body:{note}}); await refresh(); invalidateApi(); }
    catch(error){showApiError(error);}
  }, [refresh]);

  return { notes, ready, setNote };
}
