import type { KeyboardLayoutId, Listing } from "@/lib/types";

/** Physical key labels, never inferred from seller location or system language.
 * Apple groups German/Austrian together: https://support.apple.com/de-at/102743
 */
export const KEYBOARD_LAYOUTS: { id: KeyboardLayoutId; label: string; shortLabel: string }[] = [
  { id: "de-at", shortLabel: "DE / AT · QWERTZ", label: "Deutsch / Österreichisch (DE / AT) · QWERTZ" },
  { id: "ch", shortLabel: "CH · QWERTZ", label: "Schweizerisch (CH) · QWERTZ" },
  { id: "us", shortLabel: "US · QWERTY", label: "Englisch (US) · QWERTY" },
  { id: "uk", shortLabel: "UK / IE · QWERTY", label: "Britisch / Irisch (UK / IE) · QWERTY" },
  { id: "international", shortLabel: "International · QWERTY", label: "Englisch International · QWERTY" },
  { id: "fr", shortLabel: "FR · AZERTY", label: "Französisch (FR) · AZERTY" },
  { id: "other", shortLabel: "Anderes Layout", label: "Anderes Layout" },
];

export function hasBuiltInKeyboard(modelId: string): boolean {
  return ["macbook-neo", "macbook-air", "macbook-pro"].includes(modelId);
}

export function isKeyboardLayout(value: unknown): value is KeyboardLayoutId {
  return KEYBOARD_LAYOUTS.some((item) => item.id === value);
}

export function hasValidKeyboard(listing: Pick<Listing, "keyboardLayout" | "keyboardLayoutDetails">): boolean {
  if (!isKeyboardLayout(listing.keyboardLayout)) return false;
  if (listing.keyboardLayout !== "other") return true;
  const details = listing.keyboardLayoutDetails;
  return typeof details === "string" && details.trim().length > 0 && details.trim().length <= 100;
}

export function formatKeyboardLayout(listing: Pick<Listing, "keyboardLayout" | "keyboardLayoutDetails">): string {
  if (!hasValidKeyboard(listing)) return "Nicht angegeben";
  if (listing.keyboardLayout === "other") return `Anderes Layout: ${listing.keyboardLayoutDetails!.trim()}`;
  return KEYBOARD_LAYOUTS.find((item) => item.id === listing.keyboardLayout)!.label;
}
