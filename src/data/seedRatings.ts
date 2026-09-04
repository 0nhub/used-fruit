import { personKey } from "@/lib/messages";

interface SeedRating {
  id: string;
  threadId: string;
  listingId: string;
  fromKey: string;
  toKey: string;
  toRole: "buyer" | "seller";
  sentiment: "positive" | "negative";
  createdAt: string;
}

const SELLER_LISTING: Record<string, string> = {
  "Anna M.": "uf-s-01",
  "Jonas K.": "uf-s-02",
  "Lea S.": "uf-s-03",
  "Tom R.": "uf-s-04",
  "Nina B.": "uf-s-05",
  "Erik W.": "uf-s-06",
  "Studio Nord": "uf-s-07",
  "Mira P.": "uf-s-08",
  "Felix D.": "uf-s-09",
  "Paul G.": "uf-s-10",
  "Clara V.": "uf-s-11",
  "Helen A.": "uf-s-13",
  "Samira H.": "uf-s-14",
  "Lina T.": "uf-s-15",
  "David R.": "uf-s-16",
  "Sofia N.": "uf-s-17",
  "Ben L.": "uf-s-18",
  "Maya K.": "uf-s-19",
  "Greta F.": "uf-s-21",
  "Nico S.": "uf-s-22",
};

const SEED_COUNTS: Record<string, { positive: number; negative: number }> = {
  "Anna M.": { positive: 11, negative: 0 },
  "Jonas K.": { positive: 6, negative: 1 },
  "Lea S.": { positive: 2, negative: 0 },
  "Tom R.": { positive: 8, negative: 0 },
  "Nina B.": { positive: 14, negative: 1 },
  "Erik W.": { positive: 4, negative: 0 },
  "Studio Nord": { positive: 20, negative: 1 },
  "Mira P.": { positive: 5, negative: 0 },
  "Felix D.": { positive: 3, negative: 1 },
  "Paul G.": { positive: 1, negative: 0 },
  "Clara V.": { positive: 7, negative: 0 },
  "Helen A.": { positive: 9, negative: 0 },
  "Samira H.": { positive: 3, negative: 0 },
  "Lina T.": { positive: 12, negative: 0 },
  "David R.": { positive: 2, negative: 1 },
  "Sofia N.": { positive: 6, negative: 0 },
  "Ben L.": { positive: 1, negative: 0 },
  "Maya K.": { positive: 8, negative: 0 },
  "Greta F.": { positive: 4, negative: 0 },
  "Nico S.": { positive: 18, negative: 0 },
};

function seedStamp(index: number) {
  const day = 10 + (index % 18);
  return `2026-06-${String(day).padStart(2, "0")}T10:${String(index % 50).padStart(2, "0")}:00.000Z`;
}

function expand(name: string, positive: number, negative: number): SeedRating[] {
  const listingId = SELLER_LISTING[name] ?? "uf-s-01";
  const toKey = personKey(name);
  const rows: SeedRating[] = [];
  for (let i = 0; i < positive; i += 1) {
    rows.push({
      id: `seed-${toKey}-p${i}`,
      threadId: `seed-th-${toKey}-p${i}`,
      listingId,
      fromKey: `gast-p-${toKey}-${i}`,
      toKey,
      toRole: "seller",
      sentiment: "positive",
      createdAt: seedStamp(i),
    });
  }
  for (let i = 0; i < negative; i += 1) {
    rows.push({
      id: `seed-${toKey}-n${i}`,
      threadId: `seed-th-${toKey}-n${i}`,
      listingId,
      fromKey: `gast-n-${toKey}-${i}`,
      toKey,
      toRole: "seller",
      sentiment: "negative",
      createdAt: seedStamp(20 + i),
    });
  }
  return rows;
}

export const SEED_RATINGS: SeedRating[] = Object.entries(SEED_COUNTS).flatMap(([name, count]) =>
  expand(name, count.positive, count.negative),
);
