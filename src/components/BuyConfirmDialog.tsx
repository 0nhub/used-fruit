"use client";

import { OverlayDialog } from "@/components/OverlayDialog";
import { appleLoginHref } from "@/lib/appleLogin";
import { formatListingName, formatPrice } from "@/lib/format";
import { useProfile } from "@/lib/useProfile";
import type { Listing } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

export function buyIntentPath(listingId: string) {
  return `/nachrichten/start?listing=${encodeURIComponent(listingId)}&intent=buy`;
}

export function BuyConfirmDialog({
  listing,
  open,
  onClose,
  onConfirm,
}: {
  listing: Listing;
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}) {
  const router = useRouter();
  const { signedIn } = useProfile();
  if (!open) return null;

  const confirm = () => {
    onClose();
    if (onConfirm) {
      onConfirm();
      return;
    }
    const next = buyIntentPath(listing.id);
    if (!signedIn) {
      window.location.assign(appleLoginHref(next));
      return;
    }
    router.push(next);
  };

  return (
    <OverlayDialog titleId="buy-confirm-title" onClose={onClose}>
      <h2 id="buy-confirm-title" className="pr-8 text-[22px] font-semibold tracking-tight">
        Kauf bestätigen
      </h2>
      <p className="mt-2 text-[15px] text-uf-text-secondary">{formatListingName(listing)}</p>
      <p className="mt-4 text-[28px] font-semibold tracking-tight">{formatPrice(listing.price)}</p>
      <p className="mt-3 text-[14px] leading-relaxed text-uf-text-secondary">
        Du sendest eine Kaufanfrage zum Inseratspreis. Es wird keine Zahlung ausgelöst. Der Anbieter
        kann annehmen oder ablehnen. Nimmt er an, gilt das Gerät als verkauft.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-full px-4 text-[14px] text-uf-text-secondary hover:text-uf-text"
        >
          Abbrechen
        </button>
        <button
          type="button"
          onClick={confirm}
          className="h-10 rounded-full bg-uf-action px-5 text-[14px] font-medium text-white hover:bg-uf-link"
        >
          Kaufanfrage senden
        </button>
      </div>
    </OverlayDialog>
  );
}

export function BuyButton({
  listing,
  className,
  children,
}: {
  listing: Listing;
  className: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <BuyConfirmDialog listing={listing} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
