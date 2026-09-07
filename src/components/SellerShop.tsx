"use client";

import { LegalNav } from "@/components/LegalNav";
import { StoreLogo } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import { ReputationBadge } from "@/components/ReputationBadge";
import { formatMemberSince } from "@/lib/format";
import { listingJoinedAt } from "@/lib/seller";
import type { PublicSeller } from "@/lib/sellerPage";
import { useReputation } from "@/lib/useReputation";
import type { Listing } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo } from "react";

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
  const { snapshot: reputation } = useReputation(seller.id);

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

  return (
    <div className="flex min-h-dvh flex-col bg-white text-uf-text">
      <header className="relative flex h-12 items-center justify-center bg-white pt-[env(safe-area-inset-top)]">
        <Link href="/" aria-label="Used Fruit – Startseite" className="flex items-center gap-1.5 text-[15px] font-medium tracking-tight text-uf-text">
          <StoreLogo className="h-8 w-8 rounded-[8px]" /><span>Used Fruit</span>
        </Link>
      </header>
      {isOwn && <div className="flex justify-end gap-4 px-4 pt-3 text-[12px]"><Link href="/profil">Konto</Link><Link href="/meine-inserate">Inserate</Link></div>}

      {seller.coverImage && <div className="h-48 w-full overflow-hidden bg-uf-bg-subtle sm:h-72">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={seller.coverImage} alt="" className="h-full w-full object-cover" />
      </div>}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-0 sm:px-6">
        <section className={`relative max-w-xl ${seller.coverImage ? "-mt-10" : "pt-8 sm:pt-12"}`}>
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-uf-bg-subtle text-[48px] leading-none shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            {seller.emoji}
          </div>
          <h1 className="mt-5 text-[32px] font-semibold tracking-tight text-uf-text sm:text-[40px]">
            {seller.name}
          </h1>
          <p className="mt-2 text-[14px] text-uf-text-secondary">
            {offerLabel(listings.length)}
            {joinedAt ? ` · dabei seit ${formatMemberSince(joinedAt)}` : ""}
          </p>
          {reputation ? (
            <ReputationBadge reputation={reputation} personName={seller.name} own={isOwn} />
          ) : null}
          {seller.bio ? (
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-uf-text">
              {seller.bio}
            </p>
          ) : isOwn ? (
            <p className="mt-5 text-[14px] text-uf-text-secondary">
              <Link href="/profil" className="underline decoration-[#c8c6bf] underline-offset-4 hover:text-uf-text">
                Kurzbeschreibung ergänzen
              </Link>
            </p>
          ) : null}
        </section>

        {listings.length === 0 ? (
          <p className="mt-16 text-[15px] text-uf-text-secondary">
            {isOwn
              ? "Noch keine öffentlichen Inserate. Reservierte oder deaktivierte Angebote bleiben unter Meine Inserate."
              : "Gerade keine Angebote."}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {listings.map((listing) => (
              <ProductCard
                key={listing.id}
                listing={listing}
                variant="shop"
              />
            ))}
          </div>
        )}
      </main>
      <footer className="w-full px-1.5 pb-[env(safe-area-inset-bottom)] sm:px-3 md:px-6">
        <LegalNav includeListing fullWidth />
      </footer>
    </div>
  );
}
