"use client";

import { ThumbDownIcon, ThumbUpIcon } from "@/components/icons";
import { RankIcon, StatusMedalIcon } from "@/components/StatusIcons";
import { RANKS, type PendingRating, type PersonReputation, type RatingSentiment } from "@/lib/reputation";
import type { Thread } from "@/lib/messages";
import { OverlayDialog } from "@/components/OverlayDialog";

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

  return (
    <OverlayDialog titleId="uf-stand-title" onClose={onClose} wide closeLeft>
        <header className="text-center">
          <p id="uf-stand-title" className="text-[14px] font-medium text-uf-text-secondary">{title}</p>
          <div className="mx-auto mt-7 flex h-24 w-24 items-center justify-center rounded-full bg-uf-bg-subtle" style={{ color: reputation.rank.tone }}>
            <RankIcon id={reputation.rank.id} className="h-14 w-14" />
          </div>
          <h2 className="mt-4 text-[36px] font-semibold tracking-tight sm:text-[44px]">{reputation.rank.label}</h2>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-uf-text-secondary">Vom Bauern zum Mogul. Inserate, Abschlüsse und anonyme Bewertungen heben den Rang.</p>
        </header>

        <p className="mt-10 text-[21px] font-semibold tracking-tight text-uf-text">
          Auszeichnungen · {earnedCount} von {reputation.medals.length}
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {reputation.medals.map((medal) => (
            <li
              key={medal.id}
              className={`rounded-2xl border border-transparent px-5 py-5 ${
                medal.earned
                  ? "border-transparent bg-uf-bg-subtle"
                  : "border-uf-border-soft bg-uf-bg-subtle/50"
              }`}
            >
              <p
                className={`flex items-center gap-2 text-[14px] font-medium ${
                  medal.earned ? "text-uf-text" : "text-uf-text-secondary"
                }`}
              >
                <StatusMedalIcon id={medal.id} className="h-6 w-6 shrink-0" />
                {medal.label}
              </p>
              <p className="mt-1 text-[12px] text-uf-text-secondary">{medal.how}</p>
              <p className="mt-1 text-[11px] text-uf-text-secondary">
                {medal.earned ? "Im Korb" : "Noch offen"}
              </p>
            </li>
          ))}
        </ul>
        <details className="group mt-8 border-t border-uf-border-soft pt-5">
          <summary className="cursor-pointer list-none text-center text-[14px] text-uf-link hover:underline [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Zeige Stationen</span><span className="hidden group-open:inline">Stationen ausblenden</span>
          </summary>
        <p className="mt-10 text-[21px] font-semibold tracking-tight text-uf-text">
          Stationen
        </p>
        <ol className="mt-4 space-y-3">
          {RANKS.map((rank, index) => {
            const reached = index <= currentIndex;
            const current = rank.id === reputation.rank.id;
            return (
              <li
                key={rank.id}
                className={`rounded-2xl border border-transparent px-5 py-5 ${
                  current
                    ? "border-uf-border-soft bg-uf-bg-subtle"
                    : reached
                      ? "border-transparent bg-white"
                      : "border-transparent bg-uf-bg-subtle/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      reached ? "bg-white" : "bg-transparent"
                    }`}
                    style={{ color: reached ? rank.tone : "#a1a1a6" }}
                  >
                    <RankIcon id={rank.id} className="h-7 w-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-3 text-[17px] font-semibold text-uf-text">
                      <span style={{ color: reached ? rank.tone : undefined }}>{rank.label}</span>
                      <span className="text-[12px] font-normal text-uf-text-secondary">
                        {current ? "aktuell" : reached ? "erreicht" : "noch offen"}
                      </span>
                    </p>
                    <p
                      className={`mt-2 text-[14px] leading-relaxed ${
                        reached ? "text-uf-text-secondary" : "text-uf-text-secondary"
                      }`}
                    >
                      {rank.blurb}
                    </p>
                  </div>
                </div>
                {current && reputation.nextRank && reputation.nextSteps.length > 0 ? (
                  <div className="mt-5 border-t border-uf-border-soft pt-4">
                    <p className="text-[12px] text-uf-text-secondary">
                      So wird daraus {reputation.nextRank.label}:
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {reputation.nextSteps.map((step) => (
                        <li key={step.label} className="flex items-start gap-2 text-[13px] text-uf-text">
                          <span
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${
                              step.done
                                ? "bg-uf-text text-white"
                                : "border border-uf-border text-uf-text-secondary"
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

        </details>
    </OverlayDialog>
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
            <p className="mt-2 text-[14px] leading-relaxed text-uf-text-secondary">
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
              <p className="mt-2 text-[13px] text-uf-text-secondary">
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
