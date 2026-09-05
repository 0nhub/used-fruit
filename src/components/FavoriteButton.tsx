"use client";

import { HeartIcon } from "@/components/icons";
import { useFavorites } from "@/lib/useFavorites";

export function FavoriteButton({
  listingId,
  className,
  size = "sm",
}: {
  listingId: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { isFavorite, toggleFavorite, ready } = useFavorites();
  const on = ready && isFavorite(listingId);
  const box = size === "md" ? "h-10 w-10" : "h-8 w-8";
  const icon = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Aus Favoriten entfernen" : "Als Favorit merken"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(listingId);
      }}
      className={`group/favorite flex items-center justify-center rounded-full bg-white/90 text-uf-text-secondary backdrop-blur-sm ${
        size === "md" ? "" : "shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
      } ${box} ${className ?? ""}`}
    >
      <HeartIcon className={`${icon} group-hover/favorite:fill-current group-hover/favorite:text-[#ff3b30] ${on ? "text-[#ff3b30]" : ""}`} filled={on} />
    </button>
  );
}
