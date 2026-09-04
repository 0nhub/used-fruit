"use client";

import { ListingListPage } from "@/components/ListingListPage";
import { sellerHref } from "@/lib/sellerPage";
import { useListings } from "@/lib/useListings";
import { useProfile } from "@/lib/useProfile";
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
  const { profile } = useProfile();
  const mine = allListings.filter(
    (listing) => !listing.soldAt && userListings.some((item) => item.id === listing.id),
  );
  const publicPage = sellerHref(profile.name);

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
      banner={
        publicPage ? (
          <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-uf-bg-subtle px-4 py-3">
            <p className="text-[14px] text-uf-text">Deine öffentliche Seite</p>
            <Link href={publicPage} className="text-[13px] text-uf-link hover:underline">
              Ansehen
            </Link>
          </div>
        ) : null
      }
    />
  );
}
