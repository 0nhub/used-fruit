"use client";

import { FilterSidebar } from "@/components/FilterSidebar";
import { Header } from "@/components/Header";
import { MobileFilterHost } from "@/components/MobileNav";
import { ProductCard } from "@/components/ProductCard";
import { useCatalogFilters } from "@/lib/useCatalogFilters";
import type { Listing } from "@/lib/types";
import { useListings } from "@/lib/useListings";
import type { ReactNode } from "react";

export function CatalogShell({
  listings,
  resetOnLogo = true,
  noItemsMessage,
  noItemsAction,
}: {
  listings: Listing[];
  resetOnLogo?: boolean;
  noItemsMessage?: string;
  noItemsAction?: ReactNode;
}) {
  const { filtered, userPlace, categoryId, resetFilters, applyCategory, sidebar } =
    useCatalogFilters(listings);
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
  ].filter(Boolean).length;

  return (
    <div className="flex min-h-dvh flex-col bg-white lg:h-dvh lg:overflow-hidden">
      <Header
        activeCategory={categoryId}
        onHome={resetOnLogo ? resetFilters : undefined}
        onCategoryChange={applyCategory}
      />
      <MobileFilterHost count={activeFilterCount}>
        <FilterSidebar {...sidebar} hideLegal />
      </MobileFilterHost>

      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col px-0 md:px-6 lg:min-h-0 lg:flex-row lg:gap-10 lg:overflow-hidden">
        <div className="hidden lg:flex lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
          <FilterSidebar {...sidebar} />
        </div>

        <main className="uf-scroll-hidden min-h-0 min-w-0 flex-1 pb-6 pt-3 lg:overflow-y-auto lg:overscroll-contain lg:pt-0">
          {listings.length === 0 ? (
            <div className="px-2 py-16 text-center">
              <p className="text-[17px] font-medium text-uf-text">
                {noItemsMessage ?? "Keine Treffer"}
              </p>
              {noItemsAction ? <div className="mt-5">{noItemsAction}</div> : null}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-2 py-16 text-center">
              <p className="text-[17px] font-medium text-uf-text">Keine Treffer</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 items-stretch border-l border-uf-border-soft lg:grid-cols-3">
              {filtered.map((listing) => (
                <ProductCard key={listing.id} listing={listing} userPlace={userPlace} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export function CatalogPage() {
  const { listings } = useListings();
  return <CatalogShell listings={listings} />;
}
