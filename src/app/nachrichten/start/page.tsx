"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfile } from "@/lib/useProfile";
import { useListings } from "@/lib/useListings";
import { useMessages } from "@/lib/useMessages";
import { appleLoginHref } from "@/lib/appleLogin";
import { formatPrice } from "@/lib/format";
import { listingSellerEmoji } from "@/lib/seller";
import Link from "next/link";

function StartConversation() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("listing") ?? "";
  const buy = params.get("intent") === "buy";
  const { profile, signedIn, ready: profileReady } = useProfile();
  const { getListing, ready: listingsReady } = useListings();
  const { openThread, send, ready: messagesReady } = useMessages();
  const started = useRef(false);
  const listing = getListing(id);

  useEffect(() => {
    if (!profileReady || started.current) return;
    if (!signedIn) {
      started.current = true;
      const next = `/nachrichten/start?listing=${encodeURIComponent(id)}${buy ? "&intent=buy" : ""}`;
      window.location.replace(appleLoginHref(next));
      return;
    }
    if (!listingsReady || !messagesReady || !listing) return;
    started.current = true;
    void openThread({ listing, sellerEmoji: listingSellerEmoji(listing), buyerName: profile.name.trim() || "Anbieter", buyerEmoji: profile.emoji })
      .then(async thread => {
        if (buy) {
          try {
            await send(
              thread.id,
              {
                author: "buyer",
                kind: "offer",
                price: listing.price,
                text: `Ich kaufe für ${formatPrice(listing.price)}.`,
              },
              { price: listing.price, status: "pending" },
            );
          } catch (error) {
            window.alert(error instanceof Error ? error.message : "Kaufanfrage konnte nicht gesendet werden.");
          }
        }
        router.replace(`/nachrichten?id=${encodeURIComponent(thread.id)}`);
      })
      .catch(error => { window.alert(error instanceof Error ? error.message : "Unterhaltung konnte nicht geöffnet werden."); router.replace(`/listing/${id}`); });
  }, [profileReady, signedIn, listingsReady, messagesReady, listing, id, buy, openThread, send, profile.name, profile.emoji, router]);

  return <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-uf-text-secondary">
    <p>{profileReady && signedIn && listingsReady && !listing ? "Inserat nicht gefunden" : "Nachrichten werden geöffnet…"}</p>
    {profileReady && signedIn && listingsReady && !listing && <Link href="/" className="text-uf-link">Zur Übersicht</Link>}
  </main>;
}

export default function StartConversationPage() {
  return <Suspense><StartConversation /></Suspense>;
}
