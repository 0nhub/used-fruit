"use client";

import { ReputationSheet } from "@/components/ReputationSheet";
import { RankIcon } from "@/components/StatusIcons";
import type { PersonReputation } from "@/lib/reputation";
import { useState } from "react";

export function ReputationBadge({
  reputation,
  personName,
  own,
  variant = "compact",
}: {
  reputation: PersonReputation;
  personName?: string;
  own?: boolean;
  variant?: "compact" | "summary";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2 min-w-0">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={variant === "summary" ? "grid w-full cursor-pointer grid-cols-3 divide-x divide-uf-border text-center hover:opacity-80" : "flex min-w-0 max-w-full flex-wrap items-center gap-x-1.5 text-left text-[13px] hover:opacity-80"}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {variant === "summary" ? <>
          <span className="flex min-w-0 flex-col items-center gap-2 px-1 py-2">
            <span style={{ color: reputation.rank.tone }}><RankIcon id={reputation.rank.id} className="h-9 w-9" /></span>
            <span className="text-[12px] font-normal leading-4 text-uf-text-secondary">{reputation.rank.label}</span>
          </span>
          <span className="flex min-w-0 flex-col items-center gap-2 px-1 py-2">
            <span className="flex h-9 items-center text-[28px] font-semibold leading-none tracking-tight tabular-nums text-uf-text">{reputation.ratingCount}</span>
            <span className="text-[12px] font-normal leading-4 text-uf-text-secondary">Bewertungen</span>
          </span>
          <span className="flex min-w-0 flex-col items-center gap-2 px-1 py-2">
            <span className="flex h-9 items-center text-[28px] font-semibold leading-none tracking-tight tabular-nums text-uf-text">{reputation.percentPositive == null ? "–" : `${reputation.percentPositive}%`}</span>
            <span className="text-[12px] font-normal leading-4 text-uf-text-secondary">Positives Feedback</span>
          </span>
        </> : <>
        <span className="inline-flex" style={{ color: reputation.rank.tone }}>
          <RankIcon id={reputation.rank.id} className="h-3.5 w-3.5 shrink-0" />
        </span>
        <span
          className="font-medium underline decoration-dotted underline-offset-[3px]"
          style={{ color: reputation.rank.tone }}
        >
          {reputation.rank.label}
        </span>
        <span className="text-uf-text-tertiary">·</span>
        <span className="text-uf-text-secondary">{reputation.ratingLabel}</span>
        </>}
      </button>
      {open ? (
        <ReputationSheet
          reputation={reputation}
          personName={personName}
          own={own}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
