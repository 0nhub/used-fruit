"use client";

import { CloseIcon, ThumbDownIcon, ThumbUpIcon } from "@/components/icons";
import { RankIcon, StatusMedalIcon } from "@/components/StatusIcons";
import { RANKS, type PendingRating, type PersonReputation, type RatingSentiment } from "@/lib/reputation";
import type { Thread } from "@/lib/messages";
import { useEffect } from "react";

export function ReputationSheet({
  reputation,
  personName,
  own,
  onClose,
}: {
  reputation: PersonReputation;
  personName?: string;
  own?: boolean;
  onClose: () => void;
}) {
  const currentIndex = RANKS.findIndex((rank) => rank.id === reputation.rank.id);
  const earnedCount = reputation.medals.filter((medal) => medal.earned).length;
  const title = own ? "Dein Rang" : personName ? `Rang von ${personName}` : "Rang";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/30 p-3 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="uf-stand-title"
        className="max-h-[min(88vh,720px)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-[0_16px_48px_rgba(0,0,0,0.18)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="uf-stand-title" className="text-[19px] font-semibold text-uf-text">
              {title}
            </h2>
            <p className="mt-1 text-[13px] text-uf-text-secondary">
              Vom Bauern zum Mogul. Inserate, Abschlüsse und anonyme Bewertungen
              heben den Rang.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-uf-text-secondary hover:bg-uf-bg-subtle hover:text-uf-text"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-5 text-[12px] tracking-wide text-uf-text-secondary uppercase">
          Stationen
        </p>
        <ol className="mt-2 space-y-2">
          {RANKS.map((rank, index) => {
            const reached = index <= currentIndex;
            const current = rank.id === reputation.rank.id;
            return (
              <li
                key={rank.id}
                className={`rounded-2xl border px-3 py-3 ${
                  current
                    ? "border-uf-border bg-uf-bg-subtle/80"
                    : reached
                      ? "border-uf-border-soft bg-white"
                      : "border-uf-border-soft bg-uf-bg-subtle/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      reached ? "bg-white" : "bg-transparent"
                    }`}
                    style={{ color: reached ? rank.tone : "#a1a1a6" }}
                  >
                    <RankIcon id={rank.id} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-[14px] font-medium text-uf-text">
                      <span style={{ color: reached ? rank.tone : undefined }}>{rank.label}</span>
                      <span className="text-[12px] font-normal text-uf-text-tertiary">
                        {current ? "aktuell" : reached ? "erreicht" : "noch offen"}
                      </span>
                    </p>
                    <p
                      className={`mt-0.5 text-[13px] ${
                        reached ? "text-uf-text-secondary" : "text-uf-text-tertiary"
                      }`}
                    >
                      {rank.blurb}
                    </p>
                  </div>
                </div>
                {current && reputation.nextRank && reputation.nextSteps.length > 0 ? (
                  <div className="mt-3 border-t border-uf-border-soft pt-3">
                    <p className="text-[12px] text-uf-text-secondary">
                      So wird daraus {reputation.nextRank.label}:
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {reputation.nextSteps.map((step) => (
                        <li key={step.label} className="flex items-start gap-2 text-[13px] text-uf-text">
                          <span
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                              step.done
                                ? "bg-uf-text text-white"
                                : "border border-uf-border text-uf-text-tertiary"
                            }`}
                            aria-hidden
                          >
                            {step.done ? "✓" : ""}
                          </span>
                          <span className={step.done ? "text-uf-text-secondary" : ""}>{step.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>

        <p className="mt-6 text-[12px] tracking-wide text-uf-text-secondary uppercase">
          Auszeichnungen · {earnedCount} von {reputation.medals.length}
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {reputation.medals.map((medal) => (
            <li
              key={medal.id}
              className={`rounded-2xl border px-3 py-3 ${
                medal.earned
                  ? "border-uf-border-soft bg-white"
                  : "border-uf-border-soft bg-uf-bg-subtle/50"
              }`}
            >
              <p
                className={`flex items-center gap-2 text-[14px] font-medium ${
                  medal.earned ? "text-uf-text" : "text-uf-text-tertiary"
                }`}
              >
                <StatusMedalIcon id={medal.id} className="h-4 w-4 shrink-0" />
                {medal.label}
              </p>
              <p className="mt-1 text-[12px] text-uf-text-secondary">{medal.how}</p>
              <p className="mt-1 text-[11px] text-uf-text-tertiary">
                {medal.earned ? "Im Korb" : "Noch offen"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PendingRatings({
  pending,
  onRate,
}: {
  pending: PendingRating[];
  onRate?: (thread: Thread, sentiment: RatingSentiment) => void;
}) {
  if (pending.length === 0) return null;

  return (
    <section className="mt-14 border-t border-uf-border-soft pt-8">
      <h2 className="text-[17px] font-semibold text-uf-text">Offene Bewertungen</h2>
      <ul className="mt-4 space-y-2">
        {pending.map((item) => (
          <li key={item.thread.id} className="rounded-2xl border border-uf-border-soft px-4 py-3">
            <p className="text-[14px] text-uf-text">Handel mit {item.counterpart}</p>
            <p className="mt-0.5 text-[13px] text-uf-text-secondary">
              {item.thread.listingTitle.replace(/^Refurbished\s+/, "").replace(/\s+Apple$/, "")}
            </p>
            {item.ready && onRate ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onRate(item.thread, "positive")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-uf-text px-3 text-[13px] text-white hover:bg-[#424245]"
                >
                  <ThumbUpIcon className="h-4 w-4" />
                  Positiv
                </button>
                <button
                  type="button"
                  onClick={() => onRate(item.thread, "negative")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-uf-border px-3 text-[13px] text-uf-text hover:bg-uf-bg-subtle"
                >
                  <ThumbDownIcon className="h-4 w-4" />
                  Negativ
                </button>
              </div>
            ) : (
              <p className="mt-2 text-[13px] text-uf-text-tertiary">
                Bewertung in {item.daysLeft === 1 ? "1 Tag" : `${item.daysLeft} Tagen`} möglich.
                So bleibt Zeit für Übergabe und Klärung.
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
