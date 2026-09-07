"use client";

import { SORT_OPTIONS } from "@/lib/format";
import type { SortId } from "@/lib/types";

export function CatalogSortControl({
  sortId,
  onSortChange,
  canSortByDistance,
}: {
  sortId: SortId;
  onSortChange: (id: SortId) => void;
  canSortByDistance: boolean;
}) {
  const current = SORT_OPTIONS.find((option) => option.id === sortId)?.label ?? "Neueste zuerst";

  return (
    <div className="relative inline-flex items-center gap-1.5 py-0.5 text-[12px] leading-5 text-uf-text">
      <span className="text-uf-text-secondary">Sortieren nach</span>
      <span className="inline-flex items-center gap-1">
        <span className="leading-5">{current}</span>
        <svg aria-hidden="true" width="8" height="5" viewBox="0 0 8 5" fill="none" className="text-uf-text-secondary">
          <path d="M1 1.15 4 3.85 7 1.15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <select
        aria-label="Sortierung"
        value={sortId}
        onChange={(event) => {
          onSortChange(event.target.value as SortId);
          event.target.blur();
        }}
        className="absolute inset-0 cursor-pointer text-[16px] opacity-0"
      >
        {SORT_OPTIONS.map((option) => (
          <option
            key={option.id}
            value={option.id}
            disabled={option.needsLocation && !canSortByDistance}
          >
            {option.needsLocation && !canSortByDistance
              ? `${option.label} (Standort setzen)`
              : option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
