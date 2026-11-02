"use client";

import { BuyButton } from "@/components/BuyConfirmDialog";
import { appleLoginHref } from "@/lib/appleLogin";
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
  const { threads, ready, openThread } = useMessages();
  const [error, setError] = useState("");
  const existing = findThreadForListing(threads, listing);
  const offerOpen = existing?.offer?.status === "pending" || existing?.offer?.status === "accepted";

  const start = async () => {
    setError("");
    if (!signedIn) {
      window.location.assign(appleLoginHref("/favoriten"));
      return;
    }
    if (!profile.name.trim()) {
      setError("Bitte zuerst deinen Namen im Profil setzen.");
      return;
    }
    try {
    const thread = await openThread({
      listing,
      sellerEmoji: listingSellerEmoji(listing),
      buyerName: profile.name.trim(),
      buyerEmoji: profile.emoji,
    });
    router.push(`/nachrichten?id=${encodeURIComponent(thread.id)}`);
    } catch (error) { setError(error instanceof Error ? error.message : "Nachricht konnte nicht geöffnet werden."); }
  };

  if (!ready) return <div className="h-8" aria-hidden />;

  if (existing && offerOpen) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/nachrichten?id=${encodeURIComponent(existing.id)}`)}
        className="h-8 rounded-full bg-uf-action px-3.5 text-[13px] font-medium text-white hover:bg-uf-link"
      >
        Zur Nachricht
      </button>
    );
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {!listing.soldAt ? (
        <BuyButton
          listing={listing}
          className="h-8 rounded-full bg-uf-action px-3.5 text-[13px] font-medium text-white hover:bg-uf-link"
        >
          Kaufen
        </BuyButton>
      ) : null}
      <button
        type="button"
        onClick={() => existing ? router.push(`/nachrichten?id=${encodeURIComponent(existing.id)}`) : start()}
        className="h-8 rounded-full border border-uf-border bg-white px-3.5 text-[13px] text-uf-text hover:bg-uf-bg-subtle"
      >
        {existing ? "Zur Nachricht" : "Nachricht schreiben"}
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
