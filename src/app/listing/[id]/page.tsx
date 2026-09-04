"use client";

import { AppleMap } from "@/components/AppleMap";
import { ConditionHint } from "@/components/ConditionHint";
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
import { formatListingMeta, formatListingName, formatMemberSince, formatPrice } from "@/lib/format";
import { findThreadForListing } from "@/lib/messages";
import { listingJoinedAt, listingSellerEmoji } from "@/lib/seller";
import { sellerHref } from "@/lib/sellerPage";
import { useListings } from "@/lib/useListings";
import { useMessages } from "@/lib/useMessages";
import { useProfile } from "@/lib/useProfile";
import { useReputation } from "@/lib/useReputation";
import { useUserLocation } from "@/lib/useUserLocation";
import type { Listing } from "@/lib/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

function SpecGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">{children}</dl>
  );
}

function SpecRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <>
      <dt className="inline-flex items-center text-uf-text-secondary">{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function SellerBox({
  listing,
  sellerEmoji,
  isOwn,
}: {
  listing: Listing;
  sellerEmoji: string;
  isOwn: boolean;
}) {
  const router = useRouter();
  const { profile, signedIn } = useProfile();
  const { threads, ready: messagesReady, openThread, send } = useMessages();
  const { snapshot: sellerReputation } = useReputation(listing.sellerName);
  const [contactOpen, setContactOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const existingThread = findThreadForListing(threads, listing);
  const shopHref = sellerHref(listing.sellerName);

  const startConversation = (kind: "buy" | "contact") => {
    setError("");
    if (!signedIn) {
      router.push(`/anmelden?next=/listing/${listing.id}`);
      return;
    }
    if (!profile.name.trim()) {
      setError("Bitte zuerst deinen Namen im Profil setzen.");
      return;
    }

    const thread = openThread({
      listing,
      sellerEmoji,
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
    } else if (note.trim()) {
      send(thread.id, { author: "buyer", kind: "text", text: note.trim() });
    }

    router.push(`/nachrichten?id=${encodeURIComponent(thread.id)}`);
  };

  return (
    <section className="rounded-3xl border border-uf-border-soft bg-uf-bg-subtle/70 px-4 py-4">
      <div className="flex items-center gap-3">
        {shopHref ? (
          <Link
            href={shopHref}
            className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[28px] leading-none">
              {sellerEmoji}
            </span>
            <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-uf-text">
              {listing.sellerName}
            </p>
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
        <p className="shrink-0 text-right text-[13px] text-uf-text-secondary">
          Mitglied seit {formatMemberSince(listingJoinedAt(listing))}
        </p>
      </div>
      {sellerReputation && (
        <ReputationBadge reputation={sellerReputation} personName={listing.sellerName} own={isOwn} />
      )}

      {isOwn ? (
        <p className="mt-3 text-[13px] text-uf-text-secondary">
          {listing.visibility === "reserved"
            ? "Reserviert. Das Inserat ist nicht öffentlich sichtbar."
            : listing.visibility === "inactive"
              ? "Deaktiviert. Das Inserat ist nicht öffentlich sichtbar."
              : "Anfragen erscheinen unter Nachrichten."}
        </p>
      ) : !messagesReady ? (
        <div className="mt-4 h-11" aria-hidden />
      ) : existingThread ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() =>
              router.push(`/nachrichten?id=${encodeURIComponent(existingThread.id)}`)
            }
            className="h-11 w-full rounded-full bg-uf-text px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#424245] sm:h-10 sm:w-auto sm:text-[13px]"
          >
            Nachricht öffnen
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => startConversation("buy")}
              className="h-10 rounded-full bg-uf-text px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#424245]"
            >
              Kaufen
            </button>
            <button
              type="button"
              onClick={() => {
                setContactOpen((open) => !open);
                setError("");
              }}
              className="h-10 rounded-full border border-uf-border bg-white px-4 text-[13px] transition-colors hover:bg-[#f5f5f7]"
            >
              Kontakt aufnehmen
            </button>
          </div>

          {error && !contactOpen && (
            <div className="mt-3">
              <p className="text-[13px] text-[#d80000]">{error}</p>
              {!profile.name.trim() && (
                <Link href="/profil" className="mt-1 inline-block text-[13px] text-uf-link hover:underline">
                  Zum Account
                </Link>
              )}
            </div>
          )}

          {contactOpen && (
            <div className="mt-4 rounded-2xl bg-white px-3 py-3">
              <label className="block text-[12px] tracking-wide text-uf-text-secondary uppercase">
                Nachricht
                <textarea
                  className="mt-1.5 min-h-[72px] w-full rounded-xl border border-uf-border px-3 py-2 text-[14px] outline-none"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Schreib dem Anbieter…"
                />
              </label>
              {error && <p className="mt-2 text-[13px] text-[#d80000]">{error}</p>}
              {!profile.name.trim() && (
                <Link href="/profil" className="mt-2 inline-block text-[13px] text-uf-link hover:underline">
                  Zum Account
                </Link>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => startConversation("contact")}
                  className="h-10 rounded-full bg-uf-text px-4 text-[13px] text-white transition-colors hover:bg-[#424245]"
                >
                  Senden
                </button>
                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
                  className="h-10 rounded-full px-3 text-[13px] text-uf-text-secondary"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function ListingDetailPage() {
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

  if (listing.soldAt || (hiddenFromPublic && !isOwn)) {
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
    <div className="flex min-h-dvh flex-col bg-white lg:h-dvh lg:overflow-hidden">
      <SiteHeader />

      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col lg:grid lg:grid-cols-2 lg:overflow-hidden">
        <div className="order-2 min-h-0 lg:order-1 lg:overflow-y-auto lg:overscroll-contain">
          <div className="bg-uf-bg-subtle">
            <ProductGallery
              modelId={listing.modelId}
              colorId={listing.colorId}
              alt={formatListingName(listing)}
            />
          </div>
          {place && (
            <div className="px-4 pt-4 sm:px-6">
              <AppleMap
                lat={place.lat}
                lng={place.lng}
                label={placeLabel}
                exactAddress={Boolean(listing.street?.trim())}
              />
            </div>
          )}
          <div className="px-4 py-6 sm:px-6">
            <SellerBox listing={listing} sellerEmoji={sellerEmoji} isOwn={isOwn} />
            {isOwn ? (
              <div className="mt-4">
                <OwnerListingActions listing={listing} variant="pills" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="order-1 min-h-0 px-4 pb-6 pt-5 sm:px-6 lg:order-2 lg:overflow-y-auto lg:overscroll-contain lg:pt-6 lg:pb-10">
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
            </div>
            <div className="flex shrink-0 items-center">
              <ShareButton listing={listing} />
              <FavoriteButton listingId={listing.id} size="md" />
            </div>
          </div>
          <p className="mt-5 text-[28px] font-semibold tracking-tight text-uf-text">
            {formatPrice(listing.price)}
          </p>
          {listing.visibility === "reserved" ? (
            <p className="mt-1 text-[15px] font-medium text-[#c93400]">Reserviert</p>
          ) : listing.visibility === "inactive" ? (
            <p className="mt-1 text-[15px] font-medium text-uf-text-secondary">Deaktiviert</p>
          ) : null}

          <div className="mt-8">
            <SpecGrid>
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
        </div>
      </main>
    </div>
  );
}
