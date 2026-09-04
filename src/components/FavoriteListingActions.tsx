"use client";

import { formatPrice } from "@/lib/format";
import { findThreadForListing } from "@/lib/messages";
import { listingSellerEmoji } from "@/lib/seller";
import { useMessages } from "@/lib/useMessages";
import { useProfile } from "@/lib/useProfile";
import type { Listing } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FavoriteListingActions({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { profile, signedIn } = useProfile();
  const { threads, ready, openThread, send } = useMessages();
  const [error, setError] = useState("");
  const existing = findThreadForListing(threads, listing);

  const start = (kind: "buy" | "contact") => {
    setError("");
    if (!signedIn) {
      router.push(`/anmelden?next=/favoriten`);
      return;
    }
    if (!profile.name.trim()) {
      setError("Bitte zuerst deinen Namen im Profil setzen.");
      return;
    }
    const thread = openThread({
      listing,
      sellerEmoji: listingSellerEmoji(listing),
      buyerName: profile.name.trim(),
      buyerEmoji: profile.emoji,
    });
    if (kind === "buy") {
      send(
        thread.id,
        {
          author: "buyer",
          kind: "offer",
          price: listing.price,
          text: `Ich kaufe für ${formatPrice(listing.price)}.`,
        },
        { price: listing.price, status: "pending" },
      );
    }
    router.push(`/nachrichten?id=${encodeURIComponent(thread.id)}`);
  };

  if (!ready) return <div className="h-8" aria-hidden />;

  if (existing) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/nachrichten?id=${encodeURIComponent(existing.id)}`)}
        className="h-8 rounded-full bg-uf-text px-3.5 text-[13px] font-medium text-white hover:bg-[#424245]"
      >
        Zur Nachricht
      </button>
    );
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => start("buy")}
        className="h-8 rounded-full bg-uf-text px-3.5 text-[13px] font-medium text-white hover:bg-[#424245]"
      >
        Kaufen
      </button>
      <button
        type="button"
        onClick={() => start("contact")}
        className="h-8 rounded-full border border-uf-border bg-white px-3.5 text-[13px] text-uf-text hover:bg-uf-bg-subtle"
      >
        Nachricht schreiben
      </button>
      {error ? (
        <span className="w-full text-[12px] text-[#d80000]">
          {error}{" "}
          {!profile.name.trim() ? (
            <Link href="/profil" className="text-uf-link hover:underline">
              Zum Account
            </Link>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
