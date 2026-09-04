"use client";

import { FilterSidebar } from "@/components/FilterSidebar";
import { ProductCard } from "@/components/ProductCard";
import { ReputationBadge } from "@/components/ReputationBadge";
import { CATEGORIES } from "@/data/catalog";
import { formatMemberSince } from "@/lib/format";
import { listingJoinedAt } from "@/lib/seller";
import type { PublicSeller } from "@/lib/sellerPage";
import { useCatalogFilters } from "@/lib/useCatalogFilters";
import { useReputation } from "@/lib/useReputation";
import type { CategoryId, Listing } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function offerLabel(count: number) {
  return count === 1 ? "1 Angebot" : `${count} Angebote`;
}

export function SellerShop({
  seller,
  listings,
  isOwn,
}: {
  seller: PublicSeller;
  listings: Listing[];
  isOwn: boolean;
}) {
  const { filtered, userPlace, applyCategory, sidebar } = useCatalogFilters(listings);
  const { snapshot: reputation } = useReputation(seller.name);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    document.title = `${seller.name} · Used Fruit`;
    return () => {
      document.title = "Used Fruit";
    };
  }, [seller.name]);

  const joinedAt = useMemo(() => {
    if (!listings.length) return undefined;
    return listings
      .map((listing) => listingJoinedAt(listing))
      .sort()[0];
  }, [listings]);

  const activeFilterCount = [
    sidebar.modelId,
    sidebar.sizes.length,
    sidebar.years.length,
    sidebar.colors.length,
    sidebar.memory.length,
    sidebar.storage.length,
    sidebar.conditions.length,
    sidebar.warrantyOnly,
    sidebar.minBatteryCapacity,
    sidebar.maxBatteryCycles,
    sidebar.minPrice,
    sidebar.maxPrice,
    sidebar.shipping,
    sidebar.originalBox,
  ].filter(Boolean).length;

  const chips: { id?: CategoryId; label: string }[] = [
    { label: "Alle" },
    ...CATEGORIES.map((category) => ({ id: category.id, label: category.label })),
  ];

  return (
    <div className="min-h-dvh bg-[#f3f2ee] text-[#2c2c2a]">
      <header className="px-4 pt-[calc(env(safe-area-inset-top)+14px)] pb-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            href="/"
            className="text-[12px] tracking-wide text-[#8a8984] transition-colors hover:text-[#2c2c2a]"
          >
            Used Fruit
          </Link>
          {isOwn ? (
            <div className="flex items-center gap-4 text-[12px] text-[#6b6a66]">
              <Link href="/profil" className="hover:text-[#2c2c2a]">
                Konto
              </Link>
              <Link href="/meine-inserate" className="hover:text-[#2c2c2a]">
                Inserate
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <section className="max-w-xl">
          <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-white text-[40px] leading-none shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            {seller.emoji}
          </div>
          <h1 className="mt-5 text-[32px] font-semibold tracking-tight text-[#2c2c2a] sm:text-[40px]">
            {seller.name}
          </h1>
          <p className="mt-2 text-[14px] text-[#6b6a66]">
            {offerLabel(listings.length)}
            {joinedAt ? ` · dabei seit ${formatMemberSince(joinedAt)}` : ""}
          </p>
          {reputation ? (
            <ReputationBadge reputation={reputation} personName={seller.name} own={isOwn} />
          ) : null}
          {seller.bio ? (
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[#3d3d38]">
              {seller.bio}
            </p>
          ) : isOwn ? (
            <p className="mt-5 text-[14px] text-[#8a8984]">
              <Link href="/profil" className="underline decoration-[#c8c6bf] underline-offset-4 hover:text-[#2c2c2a]">
                Kurzbeschreibung ergänzen
              </Link>
            </p>
          ) : null}
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          {chips.map((chip) => {
            const selected = sidebar.categoryId === chip.id;
            return (
              <button
                key={chip.id ?? "all"}
                type="button"
                onClick={() => applyCategory(chip.id)}
                className={`h-8 rounded-full px-3.5 text-[13px] transition-colors ${
                  selected
                    ? "bg-[#2c2c2a] text-white"
                    : "bg-white text-[#3d3d38] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#ecebe6]"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="ml-1 h-8 rounded-full px-3.5 text-[13px] text-[#6b6a66] hover:text-[#2c2c2a]"
          >
            Filter{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
          </button>
        </div>

        {filtersOpen ? (
          <div className="mt-5 max-w-sm rounded-2xl bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <FilterSidebar {...sidebar} hideLegal />
          </div>
        ) : null}

        {listings.length === 0 ? (
          <p className="mt-16 text-[15px] text-[#6b6a66]">
            {isOwn
              ? "Noch keine öffentlichen Inserate. Reservierte oder deaktivierte Angebote bleiben unter Meine Inserate."
              : "Gerade keine Angebote."}
          </p>
        ) : filtered.length === 0 ? (
          <p className="mt-16 text-[15px] text-[#6b6a66]">Keine Treffer für diese Filter.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {filtered.map((listing) => (
              <ProductCard
                key={listing.id}
                listing={listing}
                userPlace={userPlace}
                variant="shop"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
