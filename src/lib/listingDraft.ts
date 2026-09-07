import { normalizeConditionId } from "@/data/catalog";
import type {
  CategoryId,
  ConditionId,
  IpadConnectivity,
  SimLockStatus,
  KeyboardLayoutId,
  ShippingScope,
} from "@/lib/types";

export const LISTING_DRAFT_KEY = "used-fruit-listing-draft";

export interface ListingDraft {
  categoryId: CategoryId;
  modelId: string;
  chip?: string;
  colorId: string;
  size?: string;
  year?: number;
  memory?: string;
  storage?: string;
  connectivity?: IpadConnectivity;
  simLock?: SimLockStatus;
  keyboardLayout?: KeyboardLayoutId;
  keyboardLayoutDetails?: string;
  condition: ConditionId;
  originalBox: boolean;
  price: number;
  city: string;
  postalCode: string;
  locality?: string;
  street?: string;
  shippingScope: ShippingScope;
  appleWarrantyUntil?: string;
  batteryMaxCapacityPercent?: number;
  batteryCycleCount?: number;
}

export function readListingDraft(): ListingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LISTING_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as ListingDraft;
    return { ...draft, condition: normalizeConditionId(draft.condition) };
  } catch {
    return null;
  }
}

export function writeListingDraft(draft: ListingDraft) {
  sessionStorage.setItem(LISTING_DRAFT_KEY, JSON.stringify(draft));
}

export function clearListingDraft() {
  sessionStorage.removeItem(LISTING_DRAFT_KEY);
  sessionStorage.removeItem("used-fruit-publish-key");
}

export function safeNextPath(raw: string | null | undefined): string {
  if (!raw) return "/";
  try {
    const url = new URL(raw, "http://used-fruit.local");
    if (url.hostname !== "used-fruit.local") return "/";
    if (!url.pathname.startsWith("/")) return "/";
    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
}
