"use client";

import { AppleSignInButton } from "@/components/AppleSignInButton";
import { StoreLogo } from "@/components/icons";
import { safeNextPath } from "@/lib/listingDraft";
import { useProfile } from "@/lib/useProfile";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function AnmeldenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signedIn, ready, login } = useProfile();
  const next = safeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (ready && signedIn) router.replace(next);
  }, [next, ready, router, signedIn]);

  const signIn = () => {
    login();
    router.replace(next);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="flex h-12 items-center px-4 pt-[env(safe-area-inset-top)]">
        <Link href="/" className="flex items-center gap-1.5 text-[15px] font-medium tracking-tight">
          <StoreLogo className="h-8 w-8 rounded-[8px]" />
          <span>Used Fruit</span>
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <AppleSignInButton onClick={signIn} />
      </main>
    </div>
  );
}

export default function AnmeldenPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white" />}>
      <AnmeldenContent />
    </Suspense>
  );
}
