"use client";

import { CatalogSortControl } from "@/components/CatalogSortControl";
import { FilterSidebar } from "@/components/FilterSidebar";
import { LegalNav } from "@/components/LegalNav";
import { LocationPicker } from "@/components/LocationPicker";
import { Header } from "@/components/Header";
import { MobileFilterHost } from "@/components/MobileNav";
import { ProductCard } from "@/components/ProductCard";
import { useCatalogFilters } from "@/lib/useCatalogFilters";
import { SORT_OPTIONS } from "@/lib/format";
import type { Listing, SortId } from "@/lib/types";
import { useListings } from "@/lib/useListings";
import { catalogReturn, rememberCatalogReturn } from "@/lib/catalogReturn";
import { Suspense, useEffect, type ReactNode } from "react";

export function CatalogShell(props: {
  listings: Listing[];
  resetOnLogo?: boolean;
  noItemsMessage?: string;
  noItemsAction?: ReactNode;
  banner?: ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white" />}>
      <CatalogShellInner {...props} />
    </Suspense>
  );
}

function CatalogShellInner({
  listings,
  resetOnLogo = true,
  noItemsMessage,
  noItemsAction,
  banner,
}: {
  listings: Listing[];
  resetOnLogo?: boolean;
  noItemsMessage?: string;
  noItemsAction?: ReactNode;
  banner?: ReactNode;
}) {
  const { filtered, userPlace, resetFilters, sidebar } = useCatalogFilters(listings);
  useEffect(() => {
    const saved = catalogReturn;
    if (!saved || saved.url !== location.pathname + location.search || listings.length === 0) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => window.scrollTo(0, saved.scrollY));
    });
    return () => cancelAnimationFrame(frame);
  }, [listings.length]);

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

  return (
    <div className="flex min-h-dvh flex-col bg-white lg:h-dvh lg:overflow-hidden">
      <Header desktopRail onHome={resetOnLogo ? resetFilters : undefined} mobileSort={
        <>
        <LocationPicker value={sidebar.location} onChange={sidebar.onLocationChange} align="left" variant="pill" />
        <span className="relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-uf-bg-subtle px-2.5 text-[13px] font-medium text-uf-text focus-within:ring-1 focus-within:ring-uf-border">
          <span aria-hidden="true">{SORT_OPTIONS.find((option) => option.id === sidebar.sortId)?.label}</span>
          <svg aria-hidden="true" width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m2 5 3-3 3 3M2 9l3 3 3-3" />
          </svg>
        <select
          aria-label="Sortierung"
          value={sidebar.sortId}
          onChange={(event) => {
            sidebar.onSortChange(event.target.value as SortId);
            event.target.blur();
          }}
          className="absolute inset-0 h-full w-full cursor-pointer text-[16px] opacity-0"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id} disabled={option.needsLocation && !sidebar.canSortByDistance}>
              {option.label}
            </option>
          ))}
        </select>
        </span>
        </>
      } />
      <MobileFilterHost count={activeFilterCount}>
        <FilterSidebar {...sidebar} hideLegal />
      </MobileFilterHost>

      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col px-0 md:px-6 lg:min-h-0 lg:flex-row lg:overflow-hidden lg:px-0">
        <div className="hidden lg:flex lg:h-full lg:w-[220px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overscroll-contain lg:px-5">
          <FilterSidebar {...sidebar} />
        </div>

        <main onClickCapture={(event) => {
          const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="/listing/"]');
          if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
            rememberCatalogReturn(decodeURIComponent(link.pathname.split("/").pop()!));
          }
        }} className="uf-scroll-hidden min-h-0 min-w-0 flex-1 pb-6 pt-3 lg:overflow-y-auto lg:overscroll-contain lg:border-l lg:border-uf-border-soft lg:pt-0 lg:pb-0">
          <div className="hidden h-12 items-center justify-between border-b border-uf-border-soft px-6 lg:flex">
            <LocationPicker value={sidebar.location} onChange={sidebar.onLocationChange} align="left" />
            <CatalogSortControl
              sortId={sidebar.sortId}
              onSortChange={sidebar.onSortChange}
              canSortByDistance={sidebar.canSortByDistance}
            />
          </div>
          {banner ? <div className="px-4 pb-4 sm:px-6">{banner}</div> : null}
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
            <div className="grid grid-cols-2 items-stretch border-l border-uf-border-soft lg:grid-cols-3 lg:border-l-0">
              {filtered.map((listing) => (
                <ProductCard key={listing.id} listing={listing} userPlace={userPlace} />
              ))}
            </div>
          )}
        </main>
      </div>
      <footer className="mt-auto px-1.5 pb-[env(safe-area-inset-bottom)] sm:px-3 md:px-6 lg:hidden">
        <LegalNav includeListing />
      </footer>
    </div>
  );
}

export function CatalogPage() {
  const { listings } = useListings();
  return <CatalogShell listings={listings} />;
}
