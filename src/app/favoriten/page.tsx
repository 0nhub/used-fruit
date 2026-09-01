"use client";

import { CatalogShell } from "@/components/CatalogPage";
import { useFavorites } from "@/lib/useFavorites";
import { useListings } from "@/lib/useListings";

export default function FavoritenPage() {
  const { listings, ready } = useListings();
  const { ids, ready: favReady } = useFavorites();
  const favorites = ids
    .map((id) => listings.find((listing) => listing.id === id))
    .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing));

  const loading = !ready || !favReady;

  return (
    <CatalogShell
      listings={loading ? [] : favorites}
      resetOnLogo={false}
      noItemsMessage={
        loading ? "Laden…" : "Noch keine Favoriten. Tippe auf das Herz an einem Angebot."
      }
    />
  );
}
