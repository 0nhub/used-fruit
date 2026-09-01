"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { CATEGORIES } from "@/data/catalog";
import type { CategoryId } from "@/lib/types";

interface HeaderProps {
  activeCategory?: CategoryId;
  onCategoryChange: (id?: CategoryId) => void;
  onHome?: () => void;
}

const NAV_ITEMS: { id?: CategoryId; label: string }[] = [
  { label: "Alle" },
  ...CATEGORIES,
];

export function Header({
  activeCategory,
  onCategoryChange,
  onHome,
}: HeaderProps) {
  return (
    <SiteHeader
      onLogoClick={onHome}
      center={
        <nav className="flex items-center justify-center gap-2.5 whitespace-nowrap sm:gap-6 md:gap-10">
          {NAV_ITEMS.map((item) => {
            const active = item.id === activeCategory;
            return (
              <button
                key={item.id ?? "all"}
                type="button"
                onClick={() => onCategoryChange(item.id)}
                className={`uf-nav-link${active ? " uf-nav-link-active" : ""}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      }
    />
  );
}
