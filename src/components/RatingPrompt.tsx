import { ThumbDownIcon, ThumbUpIcon } from "@/components/icons";
import type { RatingSentiment } from "@/lib/reputation";

export function RatingPrompt({
  counterpart,
  onRate,
}: {
  counterpart: string;
  onRate: (sentiment: RatingSentiment) => void;
}) {
  return (
    <div className="border-b border-uf-border-soft bg-white px-4 py-3">
      <p className="text-[14px] font-medium text-uf-text">
        Wie war der Handel mit {counterpart}?
      </p>
      <p className="mt-1 text-[13px] text-uf-text-secondary">
        Die Bewertung bleibt anonym. Andere sehen nur, ob sie positiv oder negativ ausfällt.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onRate("positive")}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-uf-text px-3 text-[13px] text-white hover:bg-[#424245]"
        >
          <ThumbUpIcon className="h-4 w-4" />
          Positiv
        </button>
        <button
          type="button"
          onClick={() => onRate("negative")}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-uf-border px-3 text-[13px] text-uf-text hover:bg-uf-bg-subtle"
        >
          <ThumbDownIcon className="h-4 w-4" />
          Negativ
        </button>
      </div>
    </div>
  );
}
