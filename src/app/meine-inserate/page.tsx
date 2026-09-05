"use client";

import { ListingListPage } from "@/components/ListingListPage";
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
    <ListingListPage
      title="Meine Inserate"
      listings={ready ? mine : []}
      mode="mine"
      ready={ready}
      emptyMessage="Noch keine Inserate."
      emptyAction={
        <Link
          href="/inserieren"
          className="inline-flex h-10 items-center rounded-full bg-uf-text px-5 text-[14px] text-white"
        >
          Jetzt inserieren
        </Link>
      }

    />
  );
}
