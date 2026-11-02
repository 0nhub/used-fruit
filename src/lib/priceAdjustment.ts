import type { Listing, ListingVisibility, PriceAdjustment } from "@/lib/types";

export const PRICE_ADJUSTMENT_PRESETS = [
  { amount: 10, everyDays: 7, label: "10 € pro Woche" },
  { amount: 20, everyDays: 7, label: "20 € pro Woche" },
  { amount: 10, everyDays: 4, label: "10 € alle 4 Tage" },
] as const;

const DAY_MS = 86_400_000;
const MIN_CENTS = 100;

export function parsePriceAdjustment(raw: unknown): PriceAdjustment | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const value = raw as Record<string, unknown>;
  const amount = Number(value.amount);
  const everyDays = Number(value.everyDays);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000) return undefined;
  if (!Number.isInteger(everyDays) || everyDays < 1 || everyDays > 90) return undefined;
  const adjustment: PriceAdjustment = { amount, everyDays };
  if (value.floor != null && value.floor !== "") {
    const floor = Number(value.floor);
    if (!Number.isFinite(floor) || floor <= 0 || floor > 100_000) return undefined;
    adjustment.floor = floor;
  }
  return adjustment;
}

export function priceAdjustmentError(adjustment: PriceAdjustment, startPrice: number): string | undefined {
  if (!Number.isFinite(startPrice) || startPrice <= 0) return "Bitte zuerst einen gültigen Preis angeben.";
  if (adjustment.amount <= 0) return "Die Senkung muss größer als 0 € sein.";
  if (adjustment.amount >= startPrice) return "Die Senkung muss kleiner als der Angebotspreis sein.";
  if (!Number.isInteger(adjustment.everyDays) || adjustment.everyDays < 1 || adjustment.everyDays > 90) {
    return "Der Abstand muss zwischen 1 und 90 Tagen liegen.";
  }
  if (adjustment.floor != null && (adjustment.floor < 1 || adjustment.floor >= startPrice)) {
    return "Der Mindestpreis muss unter dem Angebotspreis liegen.";
  }
  return undefined;
}

export function priceAdjustmentAsOf(input: {
  createdAt: string;
  soldAt?: string | null;
  status?: string | null;
  visibility?: ListingVisibility;
  updatedAt?: string | null;
  pendingAt?: string | Date | null;
  now?: Date;
}): Date {
  if (input.soldAt) return new Date(input.soldAt);
  const status = input.visibility ?? input.status ?? undefined;
  if (status === "reserved" || status === "inactive" || status === "sold") {
    return input.updatedAt ? new Date(input.updatedAt) : new Date(input.createdAt);
  }
  if (input.pendingAt) return new Date(input.pendingAt);
  return input.now ?? new Date();
}

export function effectivePriceCents(input: {
  listedCents: number;
  adjustment?: PriceAdjustment;
  createdAt: string;
  asOf: Date;
}): number {
  const listed = Math.max(MIN_CENTS, Math.round(input.listedCents));
  if (!input.adjustment) return listed;
  const elapsedDays = Math.floor(Math.max(0, input.asOf.getTime() - new Date(input.createdAt).getTime()) / DAY_MS);
  const steps = Math.floor(elapsedDays / Math.max(1, input.adjustment.everyDays));
  const drop = steps * Math.max(0, Math.round(input.adjustment.amount * 100));
  const floor = Math.max(
    MIN_CENTS,
    Math.min(listed, input.adjustment.floor != null ? Math.round(input.adjustment.floor * 100) : MIN_CENTS),
  );
  return Math.max(floor, listed - drop);
}

export function listingDisplayPrice(
  listing: Pick<Listing, "price" | "listedPrice" | "priceAdjustment" | "createdAt" | "soldAt" | "visibility"> & {
    updatedAt?: string;
    pendingAt?: string | null;
    status?: string;
  },
  now?: Date,
): number {
  const listed = listing.listedPrice ?? listing.price;
  return (
    effectivePriceCents({
      listedCents: Math.round(listed * 100),
      adjustment: listing.priceAdjustment,
      createdAt: listing.createdAt,
      asOf: priceAdjustmentAsOf({ ...listing, now }),
    }) / 100
  );
}

export function presentListingPrice<T extends {
  priceCents: number;
  specs?: unknown;
  createdAt: string;
  soldAt?: string | null;
  status?: string;
  updatedAt?: string;
  pendingAt?: string | Date | null;
  listedPriceCents?: number;
}>(row: T): T & { listedPriceCents: number; priceCents: number } {
  const listedPriceCents = row.listedPriceCents ?? row.priceCents;
  const specs = row.specs && typeof row.specs === "object" ? (row.specs as { priceAdjustment?: unknown }) : undefined;
  return {
    ...row,
    listedPriceCents,
    priceCents: effectivePriceCents({
      listedCents: listedPriceCents,
      adjustment: parsePriceAdjustment(specs?.priceAdjustment),
      createdAt: row.createdAt,
      asOf: priceAdjustmentAsOf(row),
    }),
  };
}

export function formatPriceAdjustment(adjustment: PriceAdjustment): string {
  const amount = `${trimEuro(adjustment.amount)} €`;
  const interval =
    adjustment.everyDays === 1
      ? "täglich"
      : adjustment.everyDays === 7
        ? "pro Woche"
        : adjustment.everyDays % 7 === 0
          ? `alle ${adjustment.everyDays / 7} Wochen`
          : `alle ${adjustment.everyDays} Tage`;
  const floor = adjustment.floor != null ? `, nicht unter ${trimEuro(adjustment.floor)} €` : "";
  return `${amount} ${interval}${floor}`;
}

export function formatPriceAdjustmentSentence(adjustment: PriceAdjustment): string {
  return `Sinkt automatisch um ${formatPriceAdjustment(adjustment)}.`;
}

function trimEuro(value: number) {
  return Number.isInteger(value) ? String(value) : value.toLocaleString("de-DE");
}
