"use client";

import { CategoryNav } from "@/components/CategoryNav";
import { MobileMenuButton } from "@/components/MobileNav";
import { NavActions } from "@/components/NavActions";
import { StoreLogo } from "@/components/icons";
import Link from "next/link";
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
  onLogoClick,
}: {
  center?: ReactNode;
  onLogoClick?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-uf-border-soft bg-white pt-[env(safe-area-inset-top)]">
      <div className="flex h-12 w-full items-center gap-0.5 px-1.5 sm:gap-2 sm:px-3 md:px-6">
        <div className="flex shrink-0 items-center">
          <MobileMenuButton />
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
            className="flex items-center gap-1.5 text-[15px] font-medium tracking-tight"
          >
            <StoreLogo className="h-7 w-7 shrink-0 rounded-[7px] sm:h-8 sm:w-8 sm:rounded-[8px]" />
            <span className="hidden truncate sm:inline">Used Fruit</span>
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 justify-center px-0.5">
          {center ?? (
            <Suspense fallback={<CategoryNavFallback />}>
              <CategoryNav />
            </Suspense>
          )}
        </div>

        <div className="flex shrink-0 items-center">
          <NavActions />
        </div>
      </div>
    </header>
  );
}
