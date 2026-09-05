"use client";

import { CategoryNav } from "@/components/CategoryNav";
import { MobileFilterButton } from "@/components/MobileNav";
import { NavActions } from "@/components/NavActions";
import { StoreLogo } from "@/components/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, type ReactNode } from "react";

function CategoryNavFallback() {
  return (
    <nav className="flex items-center justify-center gap-2.5 whitespace-nowrap sm:gap-6 md:gap-10">
      {["Alle", "Mac", "iPad", "iPhone"].map((label) => (
        <span key={label} className="uf-nav-link">
          {label}
        </span>
      ))}
    </nav>
  );
}

export function SiteHeader({
  center,
  mobileSort,
  onLogoClick,
  listingId,
  minimal = false,
}: {
  center?: ReactNode;
  mobileSort?: ReactNode;
  onLogoClick?: () => void;
  listingId?: string;
  minimal?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const showMobileCategories = ["/", "/favoriten", "/meine-inserate"].includes(pathname);
  if (minimal) return (
    <header className="shrink-0 bg-white pt-[env(safe-area-inset-top)]">
      <div className="flex h-12 items-center justify-center px-4 md:px-6">
        <button type="button" aria-label="Used Fruit – Vorgang abbrechen"
          onClick={onLogoClick ?? (() => router.push("/"))}
          className="flex cursor-pointer items-center gap-1.5 text-[15px] font-medium tracking-tight">
          <StoreLogo className="h-7 w-7 rounded-[7px]" /><span>Used Fruit</span>
        </button>
      </div>
    </header>
  );
  return (
    <>
      <header className="sticky top-0 z-40 shrink-0 border-b border-uf-border-soft bg-white pt-[env(safe-area-inset-top)]">
        <div className="relative flex h-12 w-full items-center gap-0.5 px-1.5 sm:gap-2 sm:px-3 md:px-6">
          <div className="flex shrink-0 items-center">
            <Link
              href="/"
              onClick={
                onLogoClick
                  ? (event) => {
                      event.preventDefault();
                      onLogoClick();
                    }
                  : undefined
              }
              aria-label="Used Fruit – Startseite"
              className="flex items-center gap-1.5 whitespace-nowrap text-[15px] font-medium tracking-tight"
            >
              <StoreLogo className="h-7 w-7 shrink-0 rounded-[7px] sm:h-8 sm:w-8 sm:rounded-[8px]" />
              <span>Used Fruit</span>
            </Link>
          </div>
  
          <div className="pointer-events-none absolute inset-x-0 hidden justify-center lg:flex [&>*]:pointer-events-auto">
            {showMobileCategories ? center ?? (
              <Suspense fallback={<CategoryNavFallback />}>
                <CategoryNav />
              </Suspense>
            ) : null}
          </div>
  
          <div className="ml-auto flex shrink-0 items-center">
            <NavActions />
          </div>
        </div>
      </header>
      {showMobileCategories && <div className="uf-scroll-hidden flex shrink-0 items-center gap-2 overflow-x-auto overscroll-x-contain border-b border-uf-border-soft bg-white px-2 py-3 min-[390px]:gap-2 min-[390px]:px-3 lg:hidden">
        {mobileSort && <MobileFilterButton />}
        {mobileSort}
        <div className="shrink-0">
        {center ?? (
          <Suspense fallback={<div className="h-8" aria-hidden />}>
            <CategoryNav variant="pills" />
          </Suspense>
        )}
        </div>
      </div>}
    </>
  );
}
