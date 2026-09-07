import { FavoriteButton } from "@/components/FavoriteButton";
import { LocationIcon } from "@/components/icons";
import { ProductImage } from "@/components/ProductImage";
import { findPlace, distanceKm, type Place } from "@/data/locations";
import { formatPlaceWithDistance } from "@/lib/device";
import { formatListingHeadline, formatPrice } from "@/lib/format";
import { isDemoListing } from "@/lib/listingNumber";
import type { Listing } from "@/lib/types";
import Link from "next/link";

export function ProductCard({
  listing,
  userPlace,
  variant = "catalog",
}: {
  listing: Listing;
  userPlace?: Place;
  variant?: "catalog" | "shop";
}) {
  const listingPlace = findPlace(listing.postalCode, listing.city);
  const distance =
    userPlace && listingPlace ? distanceKm(userPlace, listingPlace) : undefined;
  const shop = variant === "shop";

  return (
    <div
      className={
        shop
          ? "group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          : "uf-grid-cell group relative flex h-full flex-col"
      }
    >
      <Link
        href={`/listing/${listing.id}`}
        className={
          shop
            ? "flex h-full flex-col px-3 pt-3 pb-5 sm:px-4 sm:pt-4 sm:pb-6"
            : "flex h-full flex-col px-2.5 pt-2.5 pb-5 sm:px-6 sm:pt-3 sm:pb-8"
        }
      >
        <div className="flex min-h-7 items-center pr-8 sm:min-h-8 sm:pr-10">
          <p className="flex min-w-0 items-center gap-1 text-[11px] leading-4 text-uf-text-secondary sm:text-[12px]">
            <LocationIcon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            <span className="truncate leading-4">
              {formatPlaceWithDistance(listing.city, distance)}
            </span>
          </p>
        </div>

        <div className={listing.visibility === "reserved" || listing.visibility === "inactive" ? "opacity-55" : undefined}>
          <ProductImage modelId={listing.modelId} colorId={listing.colorId} demo={isDemoListing(listing.id)} />
        </div>

        <div className="mt-3 text-center sm:mt-5">
          <h2 className="line-clamp-2 text-[13px] font-normal leading-snug text-uf-text group-hover:text-uf-link sm:text-[14px]">
            {formatListingHeadline(listing, { includeParts: false })}
          </h2>
          <p className="mt-1 text-[16px] font-medium tracking-tight text-uf-text sm:mt-1.5 sm:text-[18px]">
            {formatPrice(listing.price)}
          </p>
          {listing.visibility === "reserved" ? (
            <p className="mt-1 text-[13px] font-medium text-[#c93400]">Reserviert</p>
          ) : listing.visibility === "inactive" ? (
            <p className="mt-1 text-[13px] font-medium text-uf-text-secondary">Deaktiviert</p>
          ) : null}
        </div>
      </Link>
      <FavoriteButton listingId={listing.id} className="absolute top-2 right-1.5 sm:top-3 sm:right-4" />
    </div>
  );
}
