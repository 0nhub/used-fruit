"use client";

import { ShareIcon } from "@/components/icons";
import { formatListingName, formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";

export function ShareButton({ listing }: { listing: Listing }) {
  const title = `${formatListingName(listing)} · Used Fruit`;
  const text = `${formatListingName(listing)} für ${formatPrice(listing.price)}`;

  return (
    <button
      type="button"
      aria-label="Teilen"
      onClick={async () => {
        if (typeof navigator.share !== "function") return;
        const url = window.location.href;
        try {
          await navigator.share({ title, text, url });
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          try {
            await navigator.share({ url });
          } catch {
            /* User cancelled or the browser refused the payload. */
          }
        }
      }}
      className="flex h-10 w-10 items-center justify-center rounded-full text-uf-text-secondary hover:bg-uf-bg-subtle hover:text-uf-text"
    >
      <ShareIcon className="h-5 w-5" />
    </button>
  );
}
