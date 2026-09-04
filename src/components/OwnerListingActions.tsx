"use client";

import { useListings } from "@/lib/useListings";
import type { Listing, ListingVisibility } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

function actionClass(kind: "link" | "danger", variant: "links" | "pills") {
  if (variant === "pills") {
    return kind === "danger"
      ? "h-8 rounded-full border border-[#d80000]/25 px-3 text-[13px] text-[#d80000] hover:bg-[#d80000]/5"
      : "h-8 rounded-full border border-uf-border bg-white px-3 text-[13px] text-uf-text hover:bg-uf-bg-subtle";
  }
  return kind === "danger"
    ? "text-[13px] text-[#d80000] hover:underline"
    : "text-[13px] text-uf-link hover:underline";
}

export function OwnerListingActions({
  listing,
  variant = "links",
}: {
  listing: Listing;
  variant?: "links" | "pills";
}) {
  const router = useRouter();
  const { updateListing, removeListing } = useListings();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const visibility: ListingVisibility = listing.visibility ?? "public";

  const setVisibility = (next: ListingVisibility) => {
    updateListing(listing.id, { visibility: next === "public" ? undefined : next });
    setConfirmDelete(false);
  };

  return (
    <>
      <div className={variant === "pills" ? "flex flex-wrap gap-2" : "flex flex-wrap gap-x-5 gap-y-2"}>
        {visibility === "public" ? (
          <>
            <button type="button" className={actionClass("link", variant)} onClick={() => setVisibility("reserved")}>
              Reservieren
            </button>
            <button type="button" className={actionClass("link", variant)} onClick={() => setVisibility("inactive")}>
              Deaktivieren
            </button>
          </>
        ) : (
          <>
            <button type="button" className={actionClass("link", variant)} onClick={() => setVisibility("public")}>
              Aktivieren
            </button>
            {visibility === "reserved" ? (
              <button type="button" className={actionClass("link", variant)} onClick={() => setVisibility("inactive")}>
                Deaktivieren
              </button>
            ) : (
              <button type="button" className={actionClass("link", variant)} onClick={() => setVisibility("reserved")}>
                Reservieren
              </button>
            )}
          </>
        )}
        <button type="button" className={actionClass("danger", variant)} onClick={() => setConfirmDelete(true)}>
          Löschen
        </button>
      </div>

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div
            role="dialog"
            aria-labelledby="delete-listing-title"
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl sm:p-6"
          >
            <h2 id="delete-listing-title" className="text-[19px] font-semibold text-uf-text">
              Inserat löschen?
            </h2>
            <p className="mt-2 text-[15px] text-uf-text-secondary">
              Sind Sie sicher, dass Sie das Inserat löschen möchten? Es ist danach nicht mehr
              vorhanden.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  removeListing(listing.id);
                  router.push("/meine-inserate");
                }}
                className="h-10 rounded-full bg-[#d80000] px-5 text-[14px] text-white hover:bg-[#b40000]"
              >
                Löschen
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="h-10 rounded-full px-4 text-[14px] text-uf-text-secondary hover:text-uf-text"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
