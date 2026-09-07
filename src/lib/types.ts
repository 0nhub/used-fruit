export type CategoryId = "mac" | "ipad" | "iphone";

export type ConditionId =
  | "neu"
  | "sehr-gut"
  | "gut"
  | "akzeptabel"
  | "defekt";

export type ShippingScope = "local" | "deutschland";

export type SimLockStatus = "unlocked" | "locked";

export type IpadConnectivity = "wifi" | "cellular";

export type KeyboardLayoutId = "de-at" | "ch" | "us" | "uk" | "international" | "fr" | "other";

export type DesktopAccessoryId = "keyboard" | "magic-mouse" | "magic-trackpad";

export type AccessoryFilterId = DesktopAccessoryId | "none";

export type ListingVisibility = "public" | "reserved" | "inactive";

export interface Category {
  id: CategoryId;
  label: string;
}

export interface ModelDefinition {
  id: string;
  categoryId: CategoryId;
  name: string;
  sizes?: string[];
  years?: number[];
  colors: { id: string; label: string; hex: string }[];
  memoryOptions?: string[];
  storageOptions?: string[];
  chipOptions?: string[];
  disabled?: boolean;
}

export type BatteryMetric = "capacity" | "cycles";

export interface Listing {
  id: string;
  sellerId?: string;
  number?: string;
  version?: number;
  categoryId: CategoryId;
  modelId: string;
  title: string;
  chip?: string;
  colorId: string;
  size?: string;
  year?: number;
  memory?: string;
  storage?: string;
  /** iPad: WLAN oder WLAN + Cellular. */
  connectivity?: IpadConnectivity;
  simLock?: SimLockStatus;
  /** Physical built-in keyboard; missing means unknown, never DE by default. */
  keyboardLayout?: KeyboardLayoutId;
  keyboardLayoutDetails?: string;
  /** Desktop Mac extras. Empty array means none included. */
  includedAccessories?: DesktopAccessoryId[];
  condition: ConditionId;
  /** Originalkarton / Originalverpackung vorhanden. */
  originalBox?: boolean;
  price: number;
  city: string;
  postalCode: string;
  locality?: string;
  street?: string;
  radiusKm: number;
  shippingScope: ShippingScope;
  createdAt: string;
  sellerName: string;
  sellerEmoji?: string;
  sellerJoinedAt?: string;
  appleWarrantyUntil?: string;
  batteryMaxCapacityPercent?: number;
  batteryCycleCount?: number;
  serialNumber?: string;
  /** ISO-Zeitpunkt nach angenommenem Angebot. Inserat ist dann weg. */
  soldAt?: string;
  /** Öffentlich, reserviert oder deaktiviert. Fehlt der Wert, gilt öffentlich. */
  visibility?: ListingVisibility;
}

export type SortId = "newest" | "price-asc" | "nearest";

export interface ListingFilters {
  categoryId?: CategoryId;
  modelId?: string;
  sizes: string[];
  years: number[];
  colors: string[];
  memory: string[];
  storage: string[];
  keyboardLayouts?: KeyboardLayoutId[];
  accessories?: AccessoryFilterId[];
  conditions: ConditionId[];
  warrantyOnly?: boolean;
  minBatteryCapacity?: number;
  maxBatteryCycles?: number;
  query?: string;
  maxRadiusKm?: number;
  userCity?: string;
  userPostalCode?: string;
  userLat?: number;
  userLng?: number;
  minPrice?: number;
  maxPrice?: number;
  shipping?: "yes" | "no";
  originalBox?: "yes" | "no";
}
