"use client";

import { CATEGORIES } from "@/data/catalog";
import type { CategoryId } from "@/lib/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const ITEMS: { id?: CategoryId; label: string; href: string }[] = [
  { label: "Alle", href: "/" },
  ...CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    href: `/?kategorie=${category.id}`,
  })),
];

export function parseCategoryParam(value: string | null): CategoryId | undefined {
  if (value === "mac" || value === "ipad" || value === "iphone") return value;
  return undefined;
}

export function CategoryNav({
  variant = "bar",
  onNavigate,
}: {
  variant?: "bar" | "menu";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = pathname === "/" ? parseCategoryParam(searchParams.get("kategorie")) : undefined;
  const onHome = pathname === "/";

  return (
    <nav
      className={
        variant === "menu"
          ? "flex flex-col"
          : "flex items-center justify-center gap-2.5 whitespace-nowrap sm:gap-6 md:gap-10"
      }
    >
      {ITEMS.map((item) => {
        const selected = onHome && item.id === active;
        return (
          <Link
            key={item.id ?? "all"}
            href={item.href}
            aria-current={selected ? "page" : undefined}
            onClick={onNavigate}
            className={
              variant === "menu"
                ? `flex h-11 items-center text-[15px] ${
                    selected ? "font-medium text-uf-link" : "text-uf-text"
                  }`
                : `uf-nav-link${selected ? " uf-nav-link-active" : ""}`
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
