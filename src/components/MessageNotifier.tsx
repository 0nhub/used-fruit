"use client";

import { showMessageNotification } from "@/lib/notify";
import { useMessages } from "@/lib/useMessages";
import { currentIdentity } from "@/lib/authClient";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function MessageNotifier() {
  const pathname = usePathname();
  const { threads, ready, isMuted } = useMessages();
  const seenRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!ready) return;
    const ids = new Set(
      threads.flatMap((thread) => thread.messages.map((message) => message.id)),
    );
    if (!seenRef.current) {
      seenRef.current = ids;
      return;
    }
    if (pathname.startsWith("/nachrichten")) {
      seenRef.current = ids;
      return;
    }

    for (const thread of threads) {
      const latest = thread.messages.at(-1);
      if (!latest || seenRef.current.has(latest.id)) continue;
      const iAmSeller = thread.sellerId === currentIdentity()?.id;
      const incoming =
        (iAmSeller && latest.author === "buyer") || (!iAmSeller && latest.author === "seller");
      if (!incoming) continue;
      const who = iAmSeller ? thread.buyerName : thread.sellerName;
      if (isMuted(thread.id)) continue;
      const body =
        latest.kind === "offer"
          ? "Neue Kaufoption"
          : latest.kind === "accept"
            ? "Kauf bestätigt"
            : latest.text?.trim() || "Neue Nachricht";
      showMessageNotification(who || "Used Fruit", body, `/nachrichten?id=${encodeURIComponent(thread.id)}`);
    }
    seenRef.current = ids;
  }, [ready, threads, pathname, isMuted]);

  return null;
}
