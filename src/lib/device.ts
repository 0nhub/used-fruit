import { getModelById } from "@/data/catalog";
import type { BatteryMetric, CategoryId, Listing } from "@/lib/types";

const CYCLE_MODEL_IDS = new Set(["macbook-neo", "macbook-air", "macbook-pro"]);
const CAPACITY_CATEGORIES = new Set<CategoryId>(["iphone", "ipad"]);

export const BATTERY_CAPACITY_FILTERS = [95, 90, 85, 80] as const;
export const BATTERY_CYCLE_FILTERS = [50, 100, 300, 500] as const;

export function getBatteryMetricForModel(modelId: string): BatteryMetric | null {
  if (CYCLE_MODEL_IDS.has(modelId)) return "cycles";
  const model = getModelById(modelId);
  if (model && CAPACITY_CATEGORIES.has(model.categoryId)) return "capacity";
  return null;
}

export function getBatteryMetricForCategory(
  categoryId?: CategoryId,
  modelId?: string,
): BatteryMetric | null {
  if (modelId) return getBatteryMetricForModel(modelId);
  if (!categoryId) return null;
  if (categoryId === "mac") return "cycles";
  if (CAPACITY_CATEGORIES.has(categoryId)) return "capacity";
  return null;
}

export function isAppleWarrantyActive(until?: string, now = new Date()): boolean {
  if (!until) return false;
  const end = new Date(`${until}T23:59:59`);
  return !Number.isNaN(end.getTime()) && end >= now;
}

export function formatDeDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function formatWarrantyLabel(listing: Pick<Listing, "appleWarrantyUntil">): string {
  if (isAppleWarrantyActive(listing.appleWarrantyUntil)) {
    return `Garantie bis ${formatDeDate(listing.appleWarrantyUntil!)}`;
  }
  return "Abgelaufen";
}

export function formatBatteryLabel(listing: Listing): string | null {
  const metric = getBatteryMetricForModel(listing.modelId);
  if (metric === "capacity" && listing.batteryMaxCapacityPercent != null) {
    return `Batterie ${listing.batteryMaxCapacityPercent} %`;
  }
  if (metric === "cycles" && listing.batteryCycleCount != null) {
    const n = listing.batteryCycleCount;
    return `${n} ${n === 1 ? "Ladezyklus" : "Ladezyklen"}`;
  }
  return null;
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return "< 1 km";
  return `${Math.round(km)} km`;
}

export function formatListingPlace(listing: {
  city: string;
  locality?: string;
  street?: string;
}): string {
  const locality = listing.locality?.trim();
  const street = listing.street?.trim();
  const area =
    locality && locality.toLowerCase() !== listing.city.toLowerCase()
      ? `${listing.city} · ${locality}`
      : listing.city;
  return street ? `${area} · ${street}` : area;
}

export function formatPlaceWithDistance(city: string, km?: number): string {
  if (km == null) return city;
  return `${city} (${formatDistanceKm(km)})`;
}
