"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfile } from "@/lib/useProfile";
import { useListings } from "@/lib/useListings";
import { useMessages } from "@/lib/useMessages";
import { listingSellerEmoji } from "@/lib/seller";
import Link from "next/link";

function StartConversation() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("listing") ?? "";
  const { profile, signedIn, ready: profileReady } = useProfile();
  const { getListing, ready: listingsReady } = useListings();
  const { openThread, ready: messagesReady } = useMessages();
  const started = useRef(false);
  const listing = getListing(id);

  useEffect(() => {
    if (!profileReady || started.current) return;
    if (!signedIn) {
      started.current = true;
      const next = `/nachrichten/start?listing=${encodeURIComponent(id)}`;
      window.location.replace(`/anmelden?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!listingsReady || !messagesReady || !listing) return;
    started.current = true;
    void openThread({ listing, sellerEmoji: listingSellerEmoji(listing), buyerName: profile.name.trim() || "Anbieter", buyerEmoji: profile.emoji })
      .then(thread => router.replace(`/nachrichten?id=${encodeURIComponent(thread.id)}`))
      .catch(error => { window.alert(error instanceof Error ? error.message : "Unterhaltung konnte nicht geöffnet werden."); router.replace(`/listing/${id}`); });
  }, [profileReady, signedIn, listingsReady, messagesReady, listing, id, openThread, profile.name, profile.emoji, router]);

  return <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-uf-text-secondary">
    <p>{profileReady && signedIn && listingsReady && !listing ? "Inserat nicht gefunden" : "Nachrichten werden geöffnet…"}</p>
    {profileReady && signedIn && listingsReady && !listing && <Link href="/" className="text-uf-link">Zur Übersicht</Link>}
  </main>;
}

export default function StartConversationPage() {
  return <Suspense><StartConversation /></Suspense>;
}
