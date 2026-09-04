"use client";

import { SellerShop } from "@/components/SellerShop";
import { resolveSellerPage } from "@/lib/sellerPage";
import { useListings } from "@/lib/useListings";
import { useProfile } from "@/lib/useProfile";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";

export default function AnbieterPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#f3f2ee]" />}>
      <AnbieterInner />
    </Suspense>
  );
}

function AnbieterInner() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { listings, ready: listingsReady } = useListings();
  const { profile, ready: profileReady } = useProfile();

  if (!listingsReady || !profileReady) {
    return <div className="min-h-dvh bg-[#f3f2ee]" />;
  }

  const page = resolveSellerPage(slug, listings, {
    name: profile.name,
    emoji: profile.emoji,
    bio: profile.bio,
  });

  if (!page) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f3f2ee] px-4 text-center">
        <p className="text-[18px] font-medium text-[#2c2c2a]">Anbieter nicht gefunden</p>
        <Link
          href="/"
          className="mt-4 text-[13px] text-[#8a8984] underline decoration-[#c8c6bf] underline-offset-4 hover:text-[#2c2c2a]"
        >
          Zur Übersicht
        </Link>
      </div>
    );
  }

  return <SellerShop seller={page.seller} listings={page.listings} isOwn={page.isOwn} />;
}
