"use client";

import { parseCategoryParam } from "@/components/CategoryNav";
import { ListingList } from "@/components/ListingListRow";
import { SiteHeader } from "@/components/SiteHeader";
import type { Listing } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

export function ListingListPage({
  title,
  listings,
  mode,
  ready,
  emptyMessage,
  emptyAction,
  banner,
}: {
  title: string;
  listings: Listing[];
  mode: "mine" | "favorite";
  ready: boolean;
  emptyMessage: string;
  emptyAction?: ReactNode;
  banner?: ReactNode;
}) {
  const searchParams = useSearchParams();
  const categoryId = parseCategoryParam(searchParams.get("kategorie"));
  const visible = categoryId
    ? listings.filter((listing) => listing.categoryId === categoryId)
    : listings;

  return (
    <div className="min-h-dvh bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-[28px] font-semibold tracking-tight text-uf-text">{title}</h1>
        {banner ? <div className="mt-4">{banner}</div> : null}

        <div className="mt-6">
          {!ready ? (
            <p className="py-16 text-center text-[15px] text-uf-text-secondary">Laden…</p>
          ) : listings.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[16px] font-medium text-uf-text">{emptyMessage}</p>
              {emptyAction ? <div className="mt-5">{emptyAction}</div> : null}
            </div>
          ) : (
            <ListingList
              listings={visible}
              mode={mode}
              empty={
                <p className="py-16 text-center text-[16px] font-medium text-uf-text">
                  Keine Treffer in dieser Kategorie.
                </p>
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
