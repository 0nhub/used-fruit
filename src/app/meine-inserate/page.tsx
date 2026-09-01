"use client";

import { CatalogShell } from "@/components/CatalogPage";
import { useListings } from "@/lib/useListings";
import Link from "next/link";
import { Suspense } from "react";

export default function MeineInseratePage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-white" />}>
      <MeineInserateInner />
    </Suspense>
  );
}

function MeineInserateInner() {
  const { allListings, userListings, ready } = useListings();
  const mine = allListings.filter(
    (listing) => !listing.soldAt && userListings.some((item) => item.id === listing.id),
  );

  return (
    <CatalogShell
      listings={ready ? mine : []}
      resetOnLogo={false}
      noItemsMessage={ready ? "Noch keine Inserate." : "Laden…"}
      noItemsAction={
        ready ? (
          <Link
            href="/inserieren"
            className="inline-flex h-10 items-center rounded-full bg-uf-text px-5 text-[14px] text-white"
          >
            Jetzt inserieren
          </Link>
        ) : null
      }
    />
  );
}
