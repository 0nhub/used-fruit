"use client";

import { FavoriteButton } from "@/components/FavoriteButton";
import { FavoriteListingActions } from "@/components/FavoriteListingActions";
import { ListingNoteField } from "@/components/ListingNoteField";
import { OwnerListingActions } from "@/components/OwnerListingActions";
import { ProductImage } from "@/components/ProductImage";
import { getCondition } from "@/data/catalog";
import { formatListingMeta, formatListingName, formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";
import Link from "next/link";
import type { ReactNode } from "react";

export function ListingListRow({
  listing,
  mode,
}: {
  listing: Listing;
  mode: "mine" | "favorite";
}) {
  const condition = getCondition(listing.condition)?.label;
  const meta = [formatListingMeta(listing), condition, listing.city].filter(Boolean).join(" · ");
  const hidden = listing.visibility === "reserved" || listing.visibility === "inactive";

  return (
    <article className="rounded-2xl border border-uf-border-soft bg-white px-3 py-3 sm:px-4 sm:py-3.5">
      <div className="flex gap-3 sm:gap-4">
        <Link
          href={`/listing/${listing.id}`}
          aria-label={formatListingName(listing)}
          className={`relative w-[88px] shrink-0 overflow-hidden rounded-xl bg-uf-bg-subtle sm:w-[112px] ${
            hidden ? "opacity-55" : ""
          }`}
        >
          <ProductImage modelId={listing.modelId} colorId={listing.colorId} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Link href={`/listing/${listing.id}`} className="block">
                <h2 className="truncate text-[15px] font-medium text-uf-text hover:text-uf-link sm:text-[16px]">
                  {formatListingName(listing)}
                </h2>
                {meta ? (
                  <p className="mt-0.5 truncate text-[13px] text-uf-text-secondary">{meta}</p>
                ) : null}
              </Link>
              <p className="mt-1 text-[16px] font-semibold tracking-tight text-uf-text sm:text-[17px]">
                {formatPrice(listing.price)}
              </p>
              {listing.visibility === "reserved" ? (
                <p className="mt-0.5 text-[13px] font-medium text-[#c93400]">Reserviert</p>
              ) : listing.visibility === "inactive" ? (
                <p className="mt-0.5 text-[13px] font-medium text-uf-text-secondary">Deaktiviert</p>
              ) : null}
            </div>
            {mode === "favorite" ? (
              <FavoriteButton listingId={listing.id} className="relative top-0 right-0 shadow-none" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <ListingNoteField listingId={listing.id} />
      </div>

      <div className="mt-2.5">
        {mode === "mine" ? (
          <OwnerListingActions listing={listing} variant="pills" />
        ) : (
          <FavoriteListingActions listing={listing} />
        )}
      </div>
    </article>
  );
}

export function ListingList({
  listings,
  mode,
  empty,
}: {
  listings: Listing[];
  mode: "mine" | "favorite";
  empty: ReactNode;
}) {
  if (listings.length === 0) return <>{empty}</>;
  return (
    <div className="flex flex-col gap-3">
      {listings.map((listing) => (
        <ListingListRow key={listing.id} listing={listing} mode={mode} />
      ))}
    </div>
  );
}
