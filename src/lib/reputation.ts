import { createId } from "@/lib/format";
import { personKey, type Thread } from "@/lib/messages";
import { PROFILE_EVENT } from "@/lib/profile";
import { SEED_RATINGS } from "@/data/seedRatings";
import type { Listing } from "@/lib/types";

export const RATINGS_STORAGE_KEY = "used-fruit-ratings";
export const RATING_DELAY_MS = 2 * 24 * 60 * 60 * 1000;

export type RankId =
  | "bauer"
  | "haendler"
  | "kaufmann"
  | "grosshaendler"
  | "handelsmagnat"
  | "mogul";
export type RatingSentiment = "positive" | "negative";

export interface Rating {
  id: string;
  threadId: string;
  listingId: string;
  fromKey: string;
  toKey: string;
  toRole: "buyer" | "seller";
  sentiment: RatingSentiment;
  createdAt: string;
}

export interface PersonStats {
  listings: number;
  categories: number;
  sales: number;
  purchases: number;
  positive: number;
  negative: number;
}

export interface RankDef {
  id: RankId;
  label: string;
  tone: string;
  blurb: string;
}

export interface MedalDef {
  id: string;
  label: string;
  how: string;
  earned: (stats: PersonStats) => boolean;
}

export interface RankStep {
  label: string;
  done: boolean;
}

export interface PersonReputation {
  key: string;
  stats: PersonStats;
  rank: RankDef;
  nextRank?: RankDef;
  nextSteps: RankStep[];
  medals: { id: string; label: string; how: string; earned: boolean }[];
  ratingCount: number;
  percentPositive: number | undefined;
  ratingLabel: string;
}

export const RANKS: RankDef[] = [
  {
    id: "bauer",
    label: "Bauer",
    tone: "#7d7a5c",
    blurb: "Frisch auf dem Hof. Ein Inserat oder der erste Handel macht dich zum Händler.",
  },
  {
    id: "haendler",
    label: "Händler",
    tone: "#c4783a",
    blurb: "Du handelst schon. Drei Aktivitäten oder drei gute Bewertungen machen daraus einen Kaufmann.",
  },
  {
    id: "kaufmann",
    label: "Kaufmann",
    tone: "#3f7d4e",
    blurb: "Fest im Geschäft. Sechs überwiegend gute Bewertungen — oder fünf Abschlüsse — machen dich zum Großhändler.",
  },
  {
    id: "grosshaendler",
    label: "Großhändler",
    tone: "#c44b3a",
    blurb: "Vertraut im Handel. Zwölf sehr gute Bewertungen und ein paar Abschlüsse führen zum Handelsmagnaten.",
  },
  {
    id: "handelsmagnat",
    label: "Handelsmagnat",
    tone: "#6b3d6a",
    blurb: "Weit oben. Zwanzig sehr gute Bewertungen und mehr Abschlüsse machen den Mogul.",
  },
  {
    id: "mogul",
    label: "Mogul",
    tone: "#3d4a6b",
    blurb: "Höchster Rang. Andere handeln bei dir, als wärst du das Haus selbst.",
  },
];

export const MEDALS: MedalDef[] = [
  {
    id: "erstes-inserat",
    label: "Erster Apfel",
    how: "Lege dein erstes Inserat in den Korb.",
    earned: (s) => s.listings >= 1,
  },
  {
    id: "anbieter",
    label: "Voller Korb",
    how: "Halte fünf Inserate im Angebot.",
    earned: (s) => s.listings >= 5,
  },
  {
    id: "vielseitig",
    label: "Mixkiste",
    how: "Inseriere in mindestens zwei Kategorien.",
    earned: (s) => s.categories >= 2,
  },
  {
    id: "erster-verkauf",
    label: "Erster Handel",
    how: "Verkaufe zum ersten Mal über Used Fruit.",
    earned: (s) => s.sales >= 1,
  },
  {
    id: "haendler",
    label: "Standbesitzer",
    how: "Schließe fünf Verkäufe ab.",
    earned: (s) => s.sales >= 5,
  },
  {
    id: "erster-kauf",
    label: "Erster Bissen",
    how: "Kaufe zum ersten Mal über Used Fruit.",
    earned: (s) => s.purchases >= 1,
  },
  {
    id: "stammkaeufer",
    label: "Stammkunde",
    how: "Schließe drei Käufe ab.",
    earned: (s) => s.purchases >= 3,
  },
  {
    id: "gut-bewertet",
    label: "Süß",
    how: "Erhalte deine erste positive Bewertung.",
    earned: (s) => s.positive >= 1,
  },
  {
    id: "vertrauenswuerdig",
    label: "Reif",
    how: "Erhalte fünf positive Bewertungen.",
    earned: (s) => s.positive >= 5,
  },
  {
    id: "makellos",
    label: "Ohne Druckstelle",
    how: "Zehn Bewertungen, alle positiv.",
    earned: (s) => s.positive >= 10 && s.negative === 0,
  },
];

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

function readStoredRatings(): Rating[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RATINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Rating[]) : [];
  } catch {
    return [];
  }
}

export function readRatings(): Rating[] {
  return [...SEED_RATINGS, ...readStoredRatings()];
}

function writeStoredRatings(ratings: Rating[]) {
  localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratings));
  notify();
}

export function rankById(id: RankId): RankDef {
  return RANKS.find((rank) => rank.id === id) ?? RANKS[0];
}

export function computeStats(
  name: string,
  listings: Listing[],
  threads: Thread[],
  ratings: Rating[],
): PersonStats {
  const key = personKey(name);
  const mine = key ? listings.filter((listing) => personKey(listing.sellerName) === key) : [];
  const categories = new Set(mine.map((listing) => listing.categoryId)).size;
  const sales = key
    ? threads.filter(
        (thread) => personKey(thread.sellerName) === key && thread.offer?.status === "accepted",
      ).length
    : 0;
  const purchases = key
    ? threads.filter(
        (thread) => personKey(thread.buyerName) === key && thread.offer?.status === "accepted",
      ).length
    : 0;
  const received = key ? ratings.filter((rating) => rating.toKey === key) : [];
  return {
    listings: mine.length,
    categories,
    sales,
    purchases,
    positive: received.filter((rating) => rating.sentiment === "positive").length,
    negative: received.filter((rating) => rating.sentiment === "negative").length,
  };
}

export function rankFromStats(stats: PersonStats): RankId {
  const deals = stats.sales + stats.purchases;
  const ratings = stats.positive + stats.negative;
  const share = ratings === 0 ? 1 : stats.positive / ratings;
  const activity = stats.listings + deals;

  if (ratings >= 20 && share >= 0.95 && (deals >= 6 || ratings >= 28)) return "mogul";
  if (ratings >= 12 && share >= 0.95 && (deals >= 3 || ratings >= 18)) return "handelsmagnat";
  if ((ratings >= 6 && share >= 0.9) || (deals >= 5 && ratings >= 4 && share >= 0.9)) return "grosshaendler";
  if ((ratings >= 3 && share >= 0.8) || (activity >= 3 && share >= 0.8)) return "kaufmann";
  if (activity >= 1 || ratings >= 1) return "haendler";
  return "bauer";
}

function nextRankId(id: RankId): RankId | undefined {
  const index = RANKS.findIndex((rank) => rank.id === id);
  return index >= 0 && index < RANKS.length - 1 ? RANKS[index + 1].id : undefined;
}

function nextSteps(stats: PersonStats, current: RankId): RankStep[] {
  const deals = stats.sales + stats.purchases;
  const ratings = stats.positive + stats.negative;
  const share = ratings === 0 ? 1 : stats.positive / ratings;
  const activity = stats.listings + deals;

  if (current === "bauer") {
    return [
      { label: "Ein Inserat veröffentlichen", done: stats.listings >= 1 },
      { label: "Oder den ersten Kauf oder Verkauf abschließen", done: deals >= 1 },
    ];
  }
  if (current === "haendler") {
    return [
      { label: "Drei Aktivitäten (Inserate plus Abschlüsse)", done: activity >= 3 },
      { label: "Oder drei Bewertungen, davon mindestens 80 % positiv", done: ratings >= 3 && share >= 0.8 },
    ];
  }
  if (current === "kaufmann") {
    return [
      { label: "Sechs Bewertungen, davon mindestens 90 % positiv", done: ratings >= 6 && share >= 0.9 },
      { label: "Oder fünf Abschlüsse und vier gute Bewertungen", done: deals >= 5 && ratings >= 4 && share >= 0.9 },
    ];
  }
  if (current === "grosshaendler") {
    return [
      { label: "Zwölf Bewertungen, davon mindestens 95 % positiv", done: ratings >= 12 && share >= 0.95 },
      { label: "Mindestens drei Abschlüsse — oder 18 Bewertungen", done: deals >= 3 || ratings >= 18 },
    ];
  }
  if (current === "handelsmagnat") {
    return [
      { label: "Zwanzig Bewertungen, davon mindestens 95 % positiv", done: ratings >= 20 && share >= 0.95 },
      { label: "Mindestens sechs Abschlüsse — oder 28 Bewertungen", done: deals >= 6 || ratings >= 28 },
    ];
  }
  return [];
}

export function formatRatingLabel(stats: PersonStats): string {
  const count = stats.positive + stats.negative;
  if (count === 0) return "Noch keine Bewertungen";
  const percent = Math.round((stats.positive / count) * 100);
  return `${count} ${count === 1 ? "Bewertung" : "Bewertungen"} · ${percent} % positiv`;
}

export function buildReputation(
  name: string,
  listings: Listing[],
  threads: Thread[],
  ratings: Rating[],
): PersonReputation {
  const key = personKey(name);
  const stats = computeStats(name, listings, threads, ratings);
  const rankId = rankFromStats(stats);
  const next = nextRankId(rankId);
  const ratingCount = stats.positive + stats.negative;
  return {
    key,
    stats,
    rank: rankById(rankId),
    nextRank: next ? rankById(next) : undefined,
    nextSteps: nextSteps(stats, rankId),
    medals: MEDALS.map((medal) => ({
      id: medal.id,
      label: medal.label,
      how: medal.how,
      earned: medal.earned(stats),
    })),
    ratingCount,
    percentPositive: ratingCount ? Math.round((stats.positive / ratingCount) * 100) : undefined,
    ratingLabel: formatRatingLabel(stats),
  };
}

export function counterpartName(thread: Thread, myName: string): string {
  return personKey(myName) === personKey(thread.sellerName) ? thread.buyerName : thread.sellerName;
}

export function counterpartRole(thread: Thread, myName: string): "buyer" | "seller" {
  return personKey(myName) === personKey(thread.sellerName) ? "buyer" : "seller";
}

export function acceptTimestamp(thread: Thread): string | undefined {
  if (thread.offer?.status !== "accepted") return undefined;
  const accept = [...thread.messages].reverse().find((message) => message.kind === "accept");
  return accept?.at ?? thread.updatedAt;
}

export function ratingUnlockAt(thread: Thread): number | undefined {
  const at = acceptTimestamp(thread);
  if (!at) return undefined;
  const stamp = Date.parse(at);
  if (Number.isNaN(stamp)) return undefined;
  return stamp + RATING_DELAY_MS;
}

export function daysUntilRating(thread: Thread, now = Date.now()): number {
  const unlock = ratingUnlockAt(thread);
  if (unlock == null) return 0;
  return Math.max(0, Math.ceil((unlock - now) / (24 * 60 * 60 * 1000)));
}

export function hasRatedThread(ratings: Rating[], threadId: string, fromName: string): boolean {
  const from = personKey(fromName);
  return ratings.some((rating) => rating.threadId === threadId && rating.fromKey === from);
}

export function canRateThread(
  thread: Thread,
  fromName: string,
  ratings: Rating[],
  now = Date.now(),
): boolean {
  if (thread.offer?.status !== "accepted") return false;
  const from = personKey(fromName);
  const to = personKey(counterpartName(thread, fromName));
  if (!from || !to || from === to) return false;
  const unlock = ratingUnlockAt(thread);
  if (unlock == null || unlock > now) return false;
  return !hasRatedThread(ratings, thread.id, fromName);
}

export interface PendingRating {
  thread: Thread;
  counterpart: string;
  daysLeft: number;
  ready: boolean;
}

export function pendingRatingsFor(
  myName: string,
  threads: Thread[],
  ratings: Rating[],
  now = Date.now(),
): PendingRating[] {
  const me = personKey(myName);
  if (!me) return [];
  return threads
    .filter((thread) => thread.offer?.status === "accepted")
    .filter((thread) => {
      const other = personKey(counterpartName(thread, myName));
      return Boolean(other) && other !== me && !hasRatedThread(ratings, thread.id, myName);
    })
    .map((thread) => {
      const daysLeft = daysUntilRating(thread, now);
      return {
        thread,
        counterpart: counterpartName(thread, myName),
        daysLeft,
        ready: canRateThread(thread, myName, ratings, now),
      };
    })
    .sort((a, b) => Number(b.ready) - Number(a.ready) || a.daysLeft - b.daysLeft);
}

export function addRating(input: {
  thread: Thread;
  fromName: string;
  sentiment: RatingSentiment;
}): Rating | undefined {
  const fromName = input.fromName.trim();
  const stored = readStoredRatings();
  const all = [...SEED_RATINGS, ...stored];
  if (!canRateThread(input.thread, fromName, all)) return undefined;
  const rating: Rating = {
    id: createId("rt"),
    threadId: input.thread.id,
    listingId: input.thread.listingId,
    fromKey: personKey(fromName),
    toKey: personKey(counterpartName(input.thread, fromName)),
    toRole: counterpartRole(input.thread, fromName),
    sentiment: input.sentiment,
    createdAt: new Date().toISOString(),
  };
  writeStoredRatings([rating, ...stored]);
  return rating;
}

export function renameRatedPerson(oldName: string, newName: string) {
  const from = personKey(oldName);
  const to = personKey(newName);
  if (!from || !to || from === to) return;
  const stored = readStoredRatings();
  writeStoredRatings(
    stored.map((rating) => ({
      ...rating,
      fromKey: rating.fromKey === from ? to : rating.fromKey,
      toKey: rating.toKey === from ? to : rating.toKey,
    })),
  );
}
