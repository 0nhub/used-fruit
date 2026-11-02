"use client";

import { catalogReturn } from "@/lib/catalogReturn";
import { BlockSellerButton } from "@/components/BlockedProfiles";
import { isDemoListing, listingNumber } from "@/lib/listingNumber";
import { LegalNav } from "@/components/LegalNav";
import { ListingReport } from "@/components/ListingReport";
import { needsSimLock, formatSimLock } from "@/lib/simLock";
import { AppleMap } from "@/components/AppleMap";
import { ConditionHint } from "@/components/ConditionHint";
import { BuyButton } from "@/components/BuyConfirmDialog";
import { FavoriteButton } from "@/components/FavoriteButton";
import { OwnerListingActions } from "@/components/OwnerListingActions";
import { ProductGallery } from "@/components/ProductGallery";
import { ShareButton } from "@/components/ShareButton";
import { ReputationBadge } from "@/components/ReputationBadge";
import { SiteHeader } from "@/components/SiteHeader";
import { formatConnectivity, getCondition, getColor } from "@/data/catalog";
import { getHardwareSpecs } from "@/data/hardware";
import { distanceKm, findPlace } from "@/data/locations";
import {
  formatBatteryLabel,
  formatListingPlace,
  formatPlaceWithDistance,
  formatWarrantyLabel,
} from "@/lib/device";
import { formatListingMeta, formatListingName, formatPrice } from "@/lib/format";
import { formatPriceAdjustmentSentence } from "@/lib/priceAdjustment";
import { acceptsDesktopAccessories, formatIncludedAccessories, needsKeyboardLayout } from "@/lib/accessories";
import { formatKeyboardLayout } from "@/lib/keyboard";
import { listingSellerEmoji } from "@/lib/seller";
import { sellerHref } from "@/lib/sellerPage";
import { buildReputation, readRatings } from "@/lib/reputation";
import { useListings } from "@/lib/useListings";
import { useReputation } from "@/lib/useReputation";
import { useUserLocation } from "@/lib/useUserLocation";
import type { Listing } from "@/lib/types";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useMemo } from "react";

function ListingBackLink({
  listingId,
  messageReturn,
}: {
  listingId: string;
  messageReturn?: string;
}) {
  return (
    <Link
      href={messageReturn ?? (catalogReturn?.listingId === listingId ? catalogReturn.url : "/")}
      scroll={false}
      className="group inline-flex items-center gap-1 text-[14px] text-uf-link underline-offset-4"
    >
      <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 5-5 5 5 5" /></svg>
      <span className="group-hover:underline group-focus-visible:underline">{messageReturn ? "Nachricht" : "Inserate"}</span>
    </Link>
  );
}

function SpecGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">{children}</dl>
  );
}

function SpecRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <>
      <dt className="inline-flex items-center text-uf-text-secondary">{label}</dt>
      <dd className="min-w-0 [overflow-wrap:anywhere]">{value}</dd>
    </>
  );
}

function SellerBox({
  listing,
  sellerEmoji,
  isOwn,
  mobileFooter = false,
}: {
  listing: Listing;
  sellerEmoji: string;
  isOwn: boolean;
  mobileFooter?: boolean;
}) {
  const router = useRouter();
  const { allListings } = useListings();
  const { snapshot: sellerReputation } = useReputation(listing.sellerId);
  const localReputation = useMemo(
    () => buildReputation(listing.sellerName, allListings, [], readRatings()),
    [allListings, listing.sellerName],
  );
  const reputation = sellerReputation ?? localReputation;
  const shopHref = sellerHref(listing.sellerName);
  const startConversation = () => {
    router.push(`/nachrichten/start?listing=${encodeURIComponent(listing.id)}`);
  };

  return (
    <section className={mobileFooter
      ? "pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
      : "rounded-3xl bg-uf-bg-subtle px-4 py-4"}>
      {!mobileFooter && <>
      <div className="flex items-start justify-between gap-3">
        {shopHref ? (
          <Link
            href={shopHref}
            className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[28px] leading-none">
              {sellerEmoji}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-1 text-[15px] font-medium text-uf-text">
              <span className="truncate">{listing.sellerName}</span>
              <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-uf-text-secondary" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 3h6v6M17 3l-8 8M8 4H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4" /></svg>
            </span>
          </Link>
        ) : (
          <>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[28px] leading-none">
              {sellerEmoji}
            </span>
            <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-uf-text">
              {listing.sellerName}
            </p>
          </>
        )}
      </div>
      <div className="mt-5">
        <ReputationBadge reputation={reputation} personName={listing.sellerName} own={isOwn} variant="summary" />
      </div>

      </>}
      {isOwn && !mobileFooter ? (
        <p className="mt-3 text-[13px] text-uf-text-secondary">
          {listing.visibility === "reserved"
            ? "Reserviert. Das Inserat ist nicht öffentlich sichtbar."
            : listing.visibility === "inactive"
              ? "Deaktiviert. Das Inserat ist nicht öffentlich sichtbar."
              : "Anfragen erscheinen unter Nachrichten."}
        </p>
      ) : null}
      {!isOwn && mobileFooter ? (
        <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-2">
          <button
            type="button"
            onClick={startConversation}
            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-full border border-uf-border bg-white/90 px-3.5 text-[13px] font-medium leading-none text-uf-text shadow-lg backdrop-blur-sm hover:bg-white"
          >
            Nachricht
          </button>
          <BuyButton
            listing={listing}
            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-full bg-uf-action px-3.5 text-[13px] font-medium leading-none text-white shadow-lg hover:bg-uf-link"
          >
            Kaufen
          </BuyButton>
        </div>
      ) : null}
    </section>
  );
}

export default function ListingDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageId = searchParams.get("nachricht")?.slice(0, 200);
  const messageTab = searchParams.get("nachrichtenTab");
  const messageReturn = messageId ? `/nachrichten?id=${encodeURIComponent(messageId)}${messageTab && ["archiv", "blockiert"].includes(messageTab) ? `&tab=${messageTab}` : ""}` : undefined;
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const { getListing, userListings, ready } = useListings();
  const { userPlace } = useUserLocation();
  const listing = id ? getListing(id) : undefined;

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-uf-text-secondary">
        Laden…
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="text-[28px] font-semibold">Inserat nicht gefunden</h1>
        <Link href="/" className="mt-4 text-uf-link hover:underline">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const color = getColor(listing.modelId, listing.colorId);
  const condition = getCondition(listing.condition);
  const place = findPlace(listing.postalCode, listing.city);
  const distance = userPlace && place ? distanceKm(userPlace, place) : undefined;
  const placeName = formatListingPlace(listing);
  const placeLabel =
    distance != null
      ? formatPlaceWithDistance(placeName, distance)
      : `${placeName} (${listing.postalCode})`;
  const sellerEmoji = listingSellerEmoji(listing);
  const isOwn = userListings.some((item) => item.id === listing.id);
  const hardware = getHardwareSpecs(listing);
  const hiddenFromPublic =
    listing.visibility === "reserved" || listing.visibility === "inactive";

  if (hiddenFromPublic && !isOwn) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="text-[28px] font-semibold">Inserat nicht gefunden</h1>
        <Link href="/" className="mt-4 text-uf-link hover:underline">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh min-w-0 flex-col overflow-x-clip bg-white pb-24 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <SiteHeader listingId={listing.id} />
      <div className="pointer-events-none absolute inset-x-0 top-[calc(var(--uf-nav-height)+env(safe-area-inset-top))] z-30 hidden xl:block">
        <div className="pointer-events-auto absolute top-3 left-[calc(50%-32rem-1rem)] -translate-x-full">
          <ListingBackLink listingId={listing.id} messageReturn={messageReturn} />
        </div>
      </div>

      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col lg:grid lg:max-w-none lg:grid-cols-2 lg:overflow-hidden">
        <div className="contents lg:order-1 lg:flex lg:min-h-0 lg:min-w-0 lg:flex-col lg:items-end lg:overflow-y-auto lg:overscroll-contain">
          <div className="order-1 bg-white lg:w-full lg:max-w-[32rem]">
            <div className="w-full shrink-0 bg-white px-1.5 py-3 sm:px-3 md:px-6 xl:hidden">
              <ListingBackLink listingId={listing.id} messageReturn={messageReturn} />
            </div>
            <ProductGallery
              photoIds={listing.photoIds}
              photoUrls={listing.photoUrls}
              modelId={listing.modelId}
              colorId={listing.colorId}
              alt={formatListingName(listing)}
              demo={isDemoListing(listing.id)}
            />
          </div>
          {place && (
            <div className="order-3 px-4 pt-4 sm:px-6 lg:w-full lg:max-w-[32rem]">
              <AppleMap
                lat={place.lat}
                lng={place.lng}
                label={placeLabel}
                exactAddress={Boolean(listing.street?.trim())}
              />
            </div>
          )}
          <div className="order-4 px-4 py-6 sm:px-6 lg:w-full lg:max-w-[32rem]">
            <SellerBox listing={listing} sellerEmoji={sellerEmoji} isOwn={isOwn} />
            {isOwn ? (
              <div className="mt-4">
                <OwnerListingActions listing={listing} variant="pills" />
              </div>
            ) : null}
            <footer className="mt-6">
              <LegalNav includeListing />
            </footer>
          </div>
        </div>

        <div className="order-2 min-h-0 min-w-0 px-4 pb-6 pt-5 sm:px-6 lg:order-2 lg:overflow-y-auto lg:overscroll-contain lg:px-0 lg:pt-0 lg:pb-0">
          <div className="lg:max-w-[32rem] lg:px-6 lg:pt-6 lg:pb-10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[28px] font-semibold tracking-tight text-uf-text sm:text-[36px]">
                {formatListingName(listing)}
              </h1>
              {formatListingMeta(listing) && (
                <p className="mt-2 text-[17px] text-uf-text-secondary">
                  {formatListingMeta(listing)}
                </p>
              )}
              {isDemoListing(listing.id) ? (
                <p className="mt-2 text-[15px] font-medium text-uf-text-secondary">Demo-Inserat, kein echtes Angebot</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center">
              <ShareButton listing={listing} />
              <FavoriteButton listingId={listing.id} size="md" />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
            <p className="text-[28px] font-semibold tracking-tight text-uf-text">
              {formatPrice(listing.price)}
            </p>
            {listing.priceAdjustment && !listing.soldAt ? (
              <p className="mt-1 text-[13px] text-uf-text-secondary">
                {listing.listedPrice != null && listing.listedPrice !== listing.price
                  ? `Von ${formatPrice(listing.listedPrice)}. `
                  : ""}
                {formatPriceAdjustmentSentence(listing.priceAdjustment)}
                {listing.visibility === "reserved" || listing.visibility === "inactive"
                  ? " Die Senkung ist angehalten."
                  : ""}
              </p>
            ) : null}
            </div>
            {!isOwn && !listing.soldAt && (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/nachrichten/start?listing=${encodeURIComponent(listing.id)}`)}
                  className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-uf-border px-3.5 text-[13px] font-medium leading-none text-uf-text hover:bg-uf-bg-subtle"
                >
                  Nachricht
                </button>
                <BuyButton
                  listing={listing}
                  className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-uf-action px-3.5 text-[13px] font-medium leading-none text-white hover:bg-uf-link"
                >
                  Kaufen
                </BuyButton>
              </div>
            )}
          </div>
          {listing.soldAt ? (
            <p className="mt-1 text-[15px] font-medium text-uf-text-secondary">Verkauft</p>
          ) : listing.visibility === "reserved" ? (
            <p className="mt-1 text-[15px] font-medium text-[#c93400]">Reserviert</p>
          ) : listing.visibility === "inactive" ? (
            <p className="mt-1 text-[15px] font-medium text-uf-text-secondary">Deaktiviert</p>
          ) : null}

          <div className="mt-8">
            <SpecGrid>
              {acceptsDesktopAccessories(listing.modelId) && (
                <SpecRow label="Zubehör" value={formatIncludedAccessories(listing)} />
              )}
              {needsKeyboardLayout(listing.modelId, listing.includedAccessories) && (
                <SpecRow label="Tastaturlayout" value={formatKeyboardLayout(listing)} />
              )}
              {needsSimLock(listing.categoryId, listing.connectivity) && <SpecRow label="SIM-Lock" value={formatSimLock(listing.simLock)} />}
              {listing.memory && <SpecRow label="Arbeitsspeicher" value={listing.memory} />}
              {color && <SpecRow label="Farbe" value={color.label} />}
              {formatConnectivity(listing.connectivity) && (
                <SpecRow label="Verbindung" value={formatConnectivity(listing.connectivity)} />
              )}
              <SpecRow
                label={
                  <>
                    Zustand
                    <ConditionHint currentId={listing.condition} />
                  </>
                }
                value={condition?.label ?? listing.condition}
              />
              {listing.originalBox != null && (
                <SpecRow
                  label="Originalverpackung"
                  value={listing.originalBox ? "Ja" : "Nein"}
                />
              )}
              {formatBatteryLabel(listing) && (
                <SpecRow label="Batteriezustand" value={formatBatteryLabel(listing)} />
              )}
              <SpecRow label="Garantie" value={formatWarrantyLabel(listing)} />
              <SpecRow
                label="Versand"
                value={
                  listing.shippingScope === "deutschland" ? "Abholung und Versand" : "Nur Abholung"
                }
              />
            </SpecGrid>
          </div>

          {hardware.length > 0 && (
            <div className="mt-8 border-t border-uf-border-soft pt-6">
              <SpecGrid>
                {hardware.map((row) => (
                  <SpecRow key={row.label} label={row.label} value={row.value} />
                ))}
              </SpecGrid>
            </div>
          )}
          <div className="mt-8 border-t border-uf-border-soft pt-6">
            <SpecGrid>
              <SpecRow label="Anzeigen-ID" value={<span className="break-all">{listing.number ?? listingNumber(listing.id)}</span>} />
              <SpecRow label="Anzeige melden" value={<ListingReport listingId={listing.id} displayNumber={listing.number} />} />
              {!isOwn && <SpecRow label="Restriktion" value={<BlockSellerButton name={listing.sellerName} userId={listing.sellerId!} />} />}
            </SpecGrid>
          </div>
          </div>
        </div>
      </main>
      {!isOwn && !listing.soldAt && <SellerBox listing={listing} sellerEmoji={sellerEmoji} isOwn={false} mobileFooter />}
    </div>
  );
}
