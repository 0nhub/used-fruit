"use client";

import { SellerShop } from "@/components/SellerShop";
import type { PublicSeller } from "@/lib/sellerPage";
import {
  listingsForSellerSlug,
  resolveSellerPage,
  sellerSlug,
  soldListingsForSellerSlug,
} from "@/lib/sellerPage";
import { api } from "@/lib/apiClient";
import { currentIdentity } from "@/lib/authClient";
import { useListings } from "@/lib/useListings";
import { useProfile } from "@/lib/useProfile";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

export default function AnbieterPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white" />}>
      <AnbieterInner />
    </Suspense>
  );
}

function uniqueListings(items: ReturnType<typeof listingsForSellerSlug>) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function AnbieterInner() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? sellerSlug(params.slug) : "";
  const { listings, allListings, ready: listingsReady } = useListings();
  const { profile, signedIn, ready: profileReady } = useProfile();
  const [remote, setRemote] = useState<PublicSeller | null>();

  useEffect(() => {
    let active = true;
    setRemote(undefined);
    api<PublicSeller & { coverMediaId: string | null }>("/users/" + encodeURIComponent(slug))
      .then((value) => {
        if (active) {
          setRemote({
            ...value,
            coverImage: value.coverMediaId ? "/api/v1/media/" + value.coverMediaId : undefined,
          });
        }
      })
      .catch(() => {
        if (active) setRemote(null);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const local = useMemo(
    () =>
      resolveSellerPage(
        slug,
        allListings,
        signedIn
          ? {
              name: profile.name,
              emoji: profile.emoji,
              bio: profile.bio,
              coverImage: profile.coverImage,
            }
          : undefined,
      ),
    [allListings, profile.bio, profile.coverImage, profile.emoji, profile.name, signedIn, slug],
  );

  const seller = remote ?? local?.seller ?? null;
  const isOwn = remote
    ? currentIdentity()?.id === remote.id
    : Boolean(local?.isOwn);

  const shopListings = useMemo(
    () =>
      uniqueListings([
        ...listingsForSellerSlug(listings, slug, remote?.id),
        ...(local?.listings ?? []),
      ]),
    [listings, local?.listings, remote?.id, slug],
  );
  const soldListings = useMemo(
    () => soldListingsForSellerSlug(allListings, slug, remote?.id),
    [allListings, remote?.id, slug],
  );

  if (!listingsReady || !profileReady || (remote === undefined && !local)) {
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

  return (
    <SellerShop
      seller={seller}
      listings={shopListings}
      soldListings={soldListings}
      isOwn={isOwn}
    />
  );
}
