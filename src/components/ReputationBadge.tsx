"use client";

import { ReputationSheet } from "@/components/ReputationSheet";
import { RankIcon } from "@/components/StatusIcons";
import type { PersonReputation } from "@/lib/reputation";
import { useState } from "react";

export function ReputationBadge({
  reputation,
  personName,
  own,
}: {
  reputation: PersonReputation;
  personName?: string;
  own?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2 min-w-0">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-w-0 max-w-full flex-wrap items-center gap-x-1.5 text-left text-[13px] hover:opacity-80"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
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
