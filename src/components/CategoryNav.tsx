"use client";

import { CATEGORIES } from "@/data/catalog";
import type { CategoryId } from "@/lib/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const CATALOG_PATHS = new Set(["/", "/favoriten", "/meine-inserate"]);

const ITEMS: { id?: CategoryId; label: string }[] = [
  { label: "Alle" },
  ...CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
  })),
];

export function parseCategoryParam(value: string | null): CategoryId | undefined {
  if (value === "mac" || value === "ipad" || value === "iphone") return value;
  return undefined;
}

export function catalogBasePath(pathname: string): string {
  return CATALOG_PATHS.has(pathname) ? pathname : "/";
}

export function categoryHref(pathname: string, categoryId?: CategoryId): string {
  const base = catalogBasePath(pathname);
  return categoryId ? `${base}?kategorie=${categoryId}` : base;
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
  const onCatalog = CATALOG_PATHS.has(pathname);
  const active = onCatalog ? parseCategoryParam(searchParams.get("kategorie")) : undefined;

  return (
    <nav
      className={
        variant === "menu"
          ? "flex flex-col"
          : "flex items-center justify-center gap-2.5 whitespace-nowrap sm:gap-6 md:gap-10"
      }
    >
      {ITEMS.map((item) => {
        const selected = onCatalog && item.id === active;
        return (
          <Link
            key={item.id ?? "all"}
            href={categoryHref(pathname, item.id)}
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
