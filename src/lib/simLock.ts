import type { CategoryId, IpadConnectivity, SimLockStatus } from "@/lib/types";

export const SIM_LOCK_OPTIONS: { id: SimLockStatus; label: string }[] = [
  { id: "unlocked", label: "Ohne SIM-Lock" },
  { id: "locked", label: "Mit SIM-Lock" },
];
export function needsSimLock(categoryId?: CategoryId, connectivity?: IpadConnectivity) {
  return categoryId === "iphone" || (categoryId === "ipad" && connectivity === "cellular");
}
export function isSimLockStatus(value: unknown): value is SimLockStatus {
  return SIM_LOCK_OPTIONS.some((option) => option.id === value);
}
export function formatSimLock(value?: SimLockStatus) {
  return SIM_LOCK_OPTIONS.find((option) => option.id === value)?.label ?? "Nicht angegeben";
}
