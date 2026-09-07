import { hasValidKeyboard } from "@/lib/keyboard";
import type { DesktopAccessoryId, Listing } from "@/lib/types";

export const DESKTOP_ACCESSORIES: { id: DesktopAccessoryId; label: string }[] = [
  { id: "keyboard", label: "Tastatur" },
  { id: "magic-mouse", label: "Magic Mouse" },
  { id: "magic-trackpad", label: "Magic Trackpad" },
];

export const ACCESSORY_FILTERS: { id: DesktopAccessoryId | "none"; label: string }[] = [
  ...DESKTOP_ACCESSORIES,
  { id: "none", label: "Kein Zubehör" },
];

export function acceptsDesktopAccessories(modelId: string): boolean {
  return ["imac", "mac-mini", "mac-studio", "mac-pro"].includes(modelId);
}

export function isDesktopAccessoryId(value: unknown): value is DesktopAccessoryId {
  return DESKTOP_ACCESSORIES.some((item) => item.id === value);
}

export function parseIncludedAccessories(value: unknown): DesktopAccessoryId[] | undefined {
  if (!Array.isArray(value)) return undefined;
  if (!value.every(isDesktopAccessoryId)) return undefined;
  return value;
}

export function needsKeyboardLayout(modelId: string, accessories?: DesktopAccessoryId[]): boolean {
  return ["macbook-neo", "macbook-air", "macbook-pro"].includes(modelId)
    || Boolean(accessories?.includes("keyboard"));
}

export function hasValidDesktopAccessories(
  modelId: string,
  listing: Pick<Listing, "includedAccessories" | "keyboardLayout" | "keyboardLayoutDetails">,
): boolean {
  if (!acceptsDesktopAccessories(modelId)) return true;
  const accessories = parseIncludedAccessories(listing.includedAccessories);
  if (!accessories) return false;
  if (accessories.includes("keyboard")) return hasValidKeyboard(listing);
  return true;
}

export function formatIncludedAccessories(
  listing: Pick<Listing, "includedAccessories">,
): string {
  const accessories = parseIncludedAccessories(listing.includedAccessories);
  if (!accessories) return "Nicht angegeben";
  if (accessories.length === 0) return "Kein Zubehör";
  return accessories
    .map((id) => DESKTOP_ACCESSORIES.find((item) => item.id === id)?.label ?? id)
    .join(", ");
}
