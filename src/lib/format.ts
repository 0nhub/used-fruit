import { findPlace, distanceKm, type Place } from "@/data/locations";
import { getModelById, isPartsListing, normalizeConditionId } from "@/data/catalog";
import { getBatteryMetricForModel, isAppleWarrantyActive } from "@/lib/device";
import { acceptsDesktopAccessories, formatIncludedAccessories, needsKeyboardLayout } from "@/lib/accessories";
import { formatKeyboardLayout } from "@/lib/keyboard";
import type { Listing, ListingFilters, SortId } from "@/lib/types";

export const SORT_OPTIONS: { id: SortId; label: string; needsLocation?: boolean }[] = [
  { id: "newest", label: "Neueste zuerst" },
  { id: "price-asc", label: "Preis aufsteigend" },
  { id: "nearest", label: "Entfernung", needsLocation: true },
];

export function listingDistanceKm(listing: Listing, userPlace?: Place): number | undefined {
  if (!userPlace) return undefined;
  const listingPlace = findPlace(listing.postalCode, listing.city);
  if (!listingPlace) return undefined;
  return distanceKm(userPlace, listingPlace);
}

export function sortListings(
  listings: Listing[],
  sort: SortId,
  userPlace?: Place,
): Listing[] {
  const ranked = [...listings];
  ranked.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price || b.createdAt.localeCompare(a.createdAt);
      case "nearest": {
        const da = listingDistanceKm(a, userPlace);
        const db = listingDistanceKm(b, userPlace);
        if (da == null && db == null) return b.createdAt.localeCompare(a.createdAt);
        if (da == null) return 1;
        if (db == null) return -1;
        return da - db || b.createdAt.localeCompare(a.createdAt);
      }
      case "newest":
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
  return ranked;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function formatListingName(listing: Listing): string {
  return getModelById(listing.modelId)?.name ?? listing.title.replace(/^Refurbished\s+/, "").replace(/\s+Apple$/, "");
}

export function formatListingMeta(listing: Listing): string {
  return [
    listing.year,
    listing.chip,
    listing.storage,
    listing.connectivity === "cellular"
      ? "Cellular"
      : listing.connectivity === "wifi"
        ? "WLAN"
        : undefined,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function formatListingHeadline(listing: Listing, options?: { includeParts?: boolean }) {
  return [
    formatListingName(listing),
    listing.year,
    listing.chip,
    listing.storage,
    listing.connectivity === "cellular"
      ? "Cellular"
      : listing.connectivity === "wifi"
        ? "WLAN"
        : undefined,
    options?.includeParts !== false && isPartsListing(listing.condition) ? "Ersatzteil" : undefined,
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatMemberSince(iso?: string) {
  if (!iso) return "2025";
  const year = new Date(iso).getFullYear();
  return Number.isFinite(year) ? String(year) : "2025";
}

export function buildListingTitle(modelId: string): string {
  return getModelById(modelId)?.name ?? "Apple";
}

export function filterListings(listings: Listing[], filters: ListingFilters): Listing[] {
  const userPlace = findPlace(filters.userPostalCode, filters.userCity);

  return listings.filter((listing) => {
    if (filters.categoryId && listing.categoryId !== filters.categoryId) return false;
    if (filters.keyboardLayouts?.length) {
      const hasKeyboard = needsKeyboardLayout(listing.modelId, listing.includedAccessories);
      if (!hasKeyboard || !listing.keyboardLayout || !filters.keyboardLayouts.includes(listing.keyboardLayout)) return false;
    }
    if (filters.accessories?.length) {
      if (!acceptsDesktopAccessories(listing.modelId) || !Array.isArray(listing.includedAccessories)) return false;
      const wantsNone = filters.accessories.includes("none");
      const wanted = filters.accessories.filter((item) => item !== "none");
      const listingNone = listing.includedAccessories.length === 0;
      const matchesNone = wantsNone && listingNone;
      const matchesSome = wanted.some((item) => listing.includedAccessories!.includes(item));
      if (!matchesNone && !matchesSome) return false;
    }
    if (filters.modelId && listing.modelId !== filters.modelId) return false;
    if (filters.sizes.length && (!listing.size || !filters.sizes.includes(listing.size))) return false;
    if (filters.years.length && (!listing.year || !filters.years.includes(listing.year))) return false;
    if (filters.colors.length && !filters.colors.includes(listing.colorId)) return false;
    if (filters.memory.length && (!listing.memory || !filters.memory.includes(listing.memory))) return false;
    if (filters.storage.length && (!listing.storage || !filters.storage.includes(listing.storage))) return false;
    if (
      filters.conditions.length &&
      !filters.conditions.includes(normalizeConditionId(listing.condition))
    ) {
      return false;
    }
    if (filters.originalBox === "yes" && listing.originalBox !== true) return false;
    if (filters.originalBox === "no" && listing.originalBox !== false) return false;
    if (filters.warrantyOnly && !isAppleWarrantyActive(listing.appleWarrantyUntil)) return false;
    if (filters.minPrice != null && listing.price < filters.minPrice) return false;
    if (filters.maxPrice != null && listing.price > filters.maxPrice) return false;
    if (filters.shipping === "yes" && listing.shippingScope !== "deutschland") return false;
    if (filters.shipping === "no" && listing.shippingScope !== "local") return false;
    {
      const metric = getBatteryMetricForModel(listing.modelId);
      const matchesCapacity =
        filters.minBatteryCapacity != null &&
        metric === "capacity" &&
        listing.batteryMaxCapacityPercent != null &&
        listing.batteryMaxCapacityPercent >= filters.minBatteryCapacity;
      const matchesCycles =
        filters.maxBatteryCycles != null &&
        metric === "cycles" &&
        listing.batteryCycleCount != null &&
        listing.batteryCycleCount <= filters.maxBatteryCycles;
      if (filters.minBatteryCapacity != null && filters.maxBatteryCycles != null) {
        if (!matchesCapacity && !matchesCycles) return false;
      } else if (filters.minBatteryCapacity != null && !matchesCapacity) {
        return false;
      } else if (filters.maxBatteryCycles != null && !matchesCycles) {
        return false;
      }
    }
    if (filters.query?.trim()) {
      const q = filters.query.trim().toLowerCase();
      const modelName = getModelById(listing.modelId)?.name ?? "";
      const haystack = [
        listing.title,
        modelName,
        listing.city,
        listing.locality,
        listing.postalCode,
        listing.chip,
        listing.storage,
        needsKeyboardLayout(listing.modelId, listing.includedAccessories) ? `Tastatur: ${formatKeyboardLayout(listing)}` : undefined,
        acceptsDesktopAccessories(listing.modelId) ? formatIncludedAccessories(listing) : undefined,
        listing.memory,
        listing.colorId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.maxRadiusKm != null) {
      const origin =
        filters.userLat != null && filters.userLng != null
          ? { lat: filters.userLat, lng: filters.userLng }
          : userPlace;
      if (!origin) return true;
      const listingPlace = findPlace(listing.postalCode, listing.city);
      if (!listingPlace) return false;
      const dist = distanceKm(origin, listingPlace);
      if (Math.round(dist) > filters.maxRadiusKm) return false;
    }
    return true;
  });
}

export function createId(prefix = "uf"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
}

export function formatMessageDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  const diff = Math.round((today - day) / 86_400_000);
  if (diff === 0) return "Heute";
  if (diff === 1) return "Gestern";
  return date.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export function isSameMessageDay(a: string, b: string) {
  const left = new Date(a);
  const right = new Date(b);
  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) return false;
  return startOfDay(left) === startOfDay(right);
}
