"use client";

import { SellerShop } from "@/components/SellerShop";
import type { PublicSeller } from "@/lib/sellerPage";
import { api } from "@/lib/apiClient";
import { currentIdentity } from "@/lib/authClient";
import { useListings } from "@/lib/useListings";
import { useProfile } from "@/lib/useProfile";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function AnbieterPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white" />}>
      <AnbieterInner />
    </Suspense>
  );
}

function AnbieterInner() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { listings, ready: listingsReady } = useListings();
  const { ready: profileReady } = useProfile();
  const [seller, setSeller] = useState<PublicSeller | null>();
  useEffect(() => {
    let active = true; setSeller(undefined);
    api<PublicSeller & { coverMediaId: string | null }>("/users/" + encodeURIComponent(slug))
      .then(value => { if (active) setSeller({ ...value, coverImage: value.coverMediaId ? "/api/v1/media/" + value.coverMediaId : undefined }); })
      .catch(() => { if (active) setSeller(null); });
    return () => { active = false; };
  }, [slug]);

  if (!listingsReady || !profileReady || seller === undefined) {
    return <div className="min-h-dvh bg-white" />;
  }

  if (!seller) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 text-center">
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

  return <SellerShop seller={seller} listings={listings.filter(listing => listing.sellerId === slug)} isOwn={currentIdentity()?.id === slug} />;
}
