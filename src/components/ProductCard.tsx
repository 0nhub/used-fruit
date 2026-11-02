"use client";

import { FavoriteButton } from "@/components/FavoriteButton";
import { LocationIcon } from "@/components/icons";
import { DemoDeviceSlide } from "@/components/DemoDeviceSlides";
import { ProductImage } from "@/components/ProductImage";
import { listingCoverUrl } from "@/lib/listingPhotos";
import { findPlace, distanceKm, type Place } from "@/data/locations";
import { formatPlaceWithDistance } from "@/lib/device";
import { formatListingHeadline, formatPrice } from "@/lib/format";
import { isDemoListing } from "@/lib/listingNumber";
import type { Listing } from "@/lib/types";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

function CardHeadline({ children }: { children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      let size = window.matchMedia("(min-width: 640px)").matches ? 14 : 13;
      el.style.fontSize = `${size}px`;
      while (size > 10 && el.scrollWidth > el.clientWidth + 0.5) {
        size -= 0.25;
        el.style.fontSize = `${size}px`;
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  return (
    <h2
      ref={ref}
      className="h-[18px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-normal leading-[18px] text-uf-text group-hover:text-uf-link sm:h-5 sm:text-[14px] sm:leading-5"
    >
      {children}
    </h2>
  );
}

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
          {listingCoverUrl(listing) ? (
            <ProductImage src={listingCoverUrl(listing)} demo={isDemoListing(listing.id)} />
          ) : isDemoListing(listing.id) ? (
            <DemoDeviceSlide modelId={listing.modelId} colorId={listing.colorId} view={0} demo />
          ) : (
            <ProductImage />
          )}
        </div>

        <div className="mt-3 text-center sm:mt-5">
          <CardHeadline>{formatListingHeadline(listing, { includeParts: false })}</CardHeadline>
          <p className="mt-1 text-[16px] font-medium tracking-tight text-uf-text sm:mt-1.5 sm:text-[18px]">
            {formatPrice(listing.price)}
          </p>
          {listing.soldAt ? (
            <p className="mt-1 text-[13px] font-medium text-uf-text-secondary">Verkauft</p>
          ) : listing.visibility === "reserved" ? (
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
