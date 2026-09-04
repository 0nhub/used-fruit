"use client";

import { ListingListPage } from "@/components/ListingListPage";
import { useFavorites } from "@/lib/useFavorites";
import { useListings } from "@/lib/useListings";
import { Suspense } from "react";

export default function FavoritenPage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-white" />}>
      <FavoritenInner />
    </Suspense>
  );
}

function FavoritenInner() {
  const { listings, ready } = useListings();
  const { ids, ready: favReady } = useFavorites();
  const favorites = ids
    .map((id) => listings.find((listing) => listing.id === id))
    .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing));
  const loading = !ready || !favReady;

  return (
    <ListingListPage
      title="Favoriten"
      listings={loading ? [] : favorites}
      mode="favorite"
      ready={!loading}
      emptyMessage="Noch keine Favoriten. Tippe auf das Herz an einem Angebot."
    />
  );
}
