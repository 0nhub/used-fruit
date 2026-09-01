"use client";

import { showMessageNotification } from "@/lib/notify";
import { useListings } from "@/lib/useListings";
import { useMessages } from "@/lib/useMessages";
import { useProfile } from "@/lib/useProfile";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function MessageNotifier() {
  const pathname = usePathname();
  const { profile } = useProfile();
  const { threads, ready } = useMessages();
  const { userListings } = useListings();
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
    if (!profile.notifyOnMessage) {
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
      const iAmSeller = userListings.some((listing) => listing.id === thread.listingId);
      const incoming =
        (iAmSeller && latest.author === "buyer") || (!iAmSeller && latest.author === "seller");
      if (!incoming) continue;
      const who = iAmSeller ? thread.buyerName : thread.sellerName;
      const body =
        latest.kind === "offer"
          ? "Neue Kaufoption"
          : latest.kind === "accept"
            ? "Kauf bestätigt"
            : latest.text?.trim() || "Neue Nachricht";
      showMessageNotification(who || "Used Fruit", body, `/nachrichten?id=${encodeURIComponent(thread.id)}`);
    }
    seenRef.current = ids;
  }, [ready, threads, profile.notifyOnMessage, pathname, userListings]);

  return null;
}
