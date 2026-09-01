"use client";

import { markListingSold } from "@/lib/listingSold";
import { PROFILE_EVENT } from "@/lib/profile";
import {
  appendMessage,
  blockPerson,
  deleteThread,
  readBlocked,
  readThreads,
  setOfferStatus,
  setThreadArchived,
  unblockPerson,
  upsertThread,
  type ChatMessage,
  type OfferStatus,
  type Thread,
} from "@/lib/messages";
import type { Listing } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

export function useMessages() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setThreads(readThreads());
    setBlocked(readBlocked());
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

  const openThread = useCallback(
    (input: {
      listing: Listing;
      sellerEmoji: string;
      buyerName: string;
      buyerEmoji: string;
    }) => {
      const thread = upsertThread(input);
      refresh();
      return thread;
    },
    [refresh],
  );

  const send = useCallback(
    (threadId: string, message: Omit<ChatMessage, "id" | "at">, offer?: Thread["offer"]) => {
      const next = appendMessage(threadId, message, offer);
      refresh();
      return next;
    },
    [refresh],
  );

  const resolveOffer = useCallback(
    (threadId: string, status: OfferStatus, author: "buyer" | "seller") => {
      const next = setOfferStatus(threadId, status, author);
      if (status === "accepted" && next) markListingSold(next.listingId);
      refresh();
      return next;
    },
    [refresh],
  );

  const archiveThread = useCallback(
    (threadId: string, archived: boolean) => {
      setThreadArchived(threadId, archived);
      refresh();
    },
    [refresh],
  );

  const removeThread = useCallback(
    (threadId: string) => {
      deleteThread(threadId);
      refresh();
    },
    [refresh],
  );

  const block = useCallback(
    (name: string) => {
      blockPerson(name);
      refresh();
    },
    [refresh],
  );

  const unblock = useCallback(
    (name: string) => {
      unblockPerson(name);
      refresh();
    },
    [refresh],
  );

  const isBlocked = useCallback(
    (name: string) => blocked.includes(name.trim().toLowerCase()),
    [blocked],
  );

  return {
    threads,
    blocked,
    ready,
    openThread,
    send,
    resolveOffer,
    archiveThread,
    removeThread,
    block,
    unblock,
    isBlocked,
  };
}
