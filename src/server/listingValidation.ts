import { getModelById, CONDITIONS } from "@/data/catalog";
import { chipsForModel, optionsForYear, yearsForChip } from "@/data/modelYears";
import { hasBuiltInKeyboard, hasValidKeyboard } from "@/lib/keyboard";
import { isSimLockStatus, needsSimLock } from "@/lib/simLock";
import { getBatteryMetricForModel } from "@/lib/device";
import type { Listing } from "@/lib/types";
import { requireValue, string } from "./http";

export function validateListing(input: Record<string, unknown>) {
  const modelId = string(input.modelId, 100);
  const model = getModelById(modelId);
  requireValue(model && !model.disabled, "Bitte wähle ein verfügbares Modell.");
  requireValue(input.categoryId === model.categoryId, "Kategorie und Modell passen nicht zusammen.");
  requireValue(Number.isInteger(input.priceCents) && Number(input.priceCents) > 0 && Number(input.priceCents) <= 100000000, "Bitte gib einen gültigen Preis an.");
  const raw = input.specs;
  requireValue(raw && typeof raw === "object" && !Array.isArray(raw), "Geräteangaben fehlen.");
  const s = raw as Record<string, unknown>;
  for (const key of ["chip","colorId","size","memory","storage","condition","connectivity","simLock","keyboardLayout","keyboardLayoutDetails"]) {
    if (s[key] !== undefined) requireValue(typeof s[key] === "string" && (s[key] as string).length <= 200, "Ungültige Geräteangabe: " + key);
  }
  const chips = chipsForModel(model);
  if (chips.length) requireValue(chips.includes(String(s.chip)), "Ungültiger Chip.");
  const years = yearsForChip(model, typeof s.chip === "string" ? s.chip : undefined);
  if (years.length) requireValue(years.includes(Number(s.year)) && typeof s.year === "number", "Ungültiges Modelljahr.");
  const options = optionsForYear(model, typeof s.year === "number" ? s.year : undefined);
  requireValue(options.colors.some(color => color.id === s.colorId), "Ungültige Farbe.");
  for (const [key, allowed] of [["size", options.sizes], ["memory", options.memory], ["storage", options.storage]] as const) {
    if (allowed?.length) requireValue(allowed.includes(String(s[key])), "Ungültige Gerätevariante: " + key);
  }
  requireValue(CONDITIONS.some(condition => condition.id === s.condition), "Bitte wähle den Zustand.");
  requireValue(typeof s.originalBox === "boolean", "Bitte gib an, ob die Originalverpackung vorhanden ist.");
  requireValue(s.shippingScope === "local" || s.shippingScope === "deutschland", "Bitte wähle die Versandart.");
  if (model.categoryId === "ipad") requireValue(s.connectivity === "wifi" || s.connectivity === "cellular", "Bitte wähle WLAN oder Cellular.");
  const connectivity = s.connectivity === "cellular" ? "cellular" : "wifi";
  if (needsSimLock(model.categoryId, connectivity)) requireValue(isSimLockStatus(s.simLock), "Bitte gib mit oder ohne SIM-Lock an.");
  if (hasBuiltInKeyboard(modelId)) requireValue(hasValidKeyboard(s as unknown as Listing), "Bitte gib das Tastaturlayout an.");
  for (const [key,max] of [["batteryMaxCapacityPercent",100],["batteryCycleCount",100000]] as const) if(s[key]!==undefined) requireValue(Number.isInteger(s[key])&&Number(s[key])>=0&&Number(s[key])<=max,"Ungültiger Batteriezustand.");
  if(s.year!==undefined) requireValue(Number.isInteger(s.year)&&Number(s.year)>=1980&&Number(s.year)<=2200,"Ungültiges Modelljahr.");
  if(s.simLock!==undefined) requireValue(isSimLockStatus(s.simLock),"Bitte gib mit oder ohne SIM-Lock an.");
  const metric = getBatteryMetricForModel(modelId);
  if (metric === "capacity") requireValue(Number.isInteger(s.batteryMaxCapacityPercent) && Number(s.batteryMaxCapacityPercent) >= 0 && Number(s.batteryMaxCapacityPercent) <= 100, "Ungültiger Batteriezustand.");
  if (metric === "cycles") requireValue(Number.isInteger(s.batteryCycleCount) && Number(s.batteryCycleCount) >= 0 && Number(s.batteryCycleCount) <= 100000, "Ungültige Ladezyklen.");
  if (s.appleWarrantyUntil) requireValue(typeof s.appleWarrantyUntil === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s.appleWarrantyUntil) && Number.isFinite(Date.parse(s.appleWarrantyUntil)) && new Date(s.appleWarrantyUntil).toISOString().slice(0,10) === s.appleWarrantyUntil, "Ungültiges Garantiedatum.");
  const publicKeys = ["chip","year","colorId","size","memory","storage","condition","originalBox","shippingScope","connectivity","simLock","keyboardLayout","keyboardLayoutDetails","batteryMaxCapacityPercent","batteryCycleCount","appleWarrantyUntil"];
  const specs = Object.fromEntries(publicKeys.filter(key => s[key] !== undefined && !(key === "appleWarrantyUntil" && !s[key])).map(key => [key,s[key]]));
  const privateSpecs: Record<string,string> = {};
  for (const key of ["serialNumber", "street", "locality"]) if (s[key]) privateSpecs[key] = string(s[key], 200);
  const city = string(input.city, 80);
  const postalCode = string(input.postalCode, 5);
  requireValue(/^\d{5}$/.test(postalCode), "Bitte gib eine deutsche Postleitzahl ein.");
  return { modelId, categoryId: model.categoryId, title: model.name, priceCents: Number(input.priceCents), specs, privateSpecs, city, postalCode };
}
