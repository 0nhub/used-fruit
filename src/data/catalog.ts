import { LEGACY_MACS, MORE_IPHONES } from "@/data/catalogDevices";
import type { Category, ConditionId, IpadConnectivity, ModelDefinition } from "@/lib/types";

export const CATEGORIES: Category[] = [
  { id: "mac", label: "Mac" },
  { id: "ipad", label: "iPad" },
  { id: "iphone", label: "iPhone" },
];

export const CONDITIONS: { id: ConditionId; label: string; hint: string }[] = [
  {
    id: "neu",
    label: "Neu (original verpackt)",
    hint: "Nagelneu, unbenutzt und noch originalverpackt.",
  },
  {
    id: "sehr-gut",
    label: "Sehr gut",
    hint: "Leichte Gebrauchsspuren, sehr gepflegt und voll funktionsfähig.",
  },
  {
    id: "gut",
    label: "Gebraucht",
    hint: "Sichtbare Gebrauchsspuren, voll funktionsfähig.",
  },
  {
    id: "akzeptabel",
    label: "Akzeptabel",
    hint: "Deutliche Spuren oder Abnutzung, technisch in Ordnung.",
  },
  {
    id: "defekt",
    label: "Defekt (Ersatzteil)",
    hint: "Massive Schäden, Displayschaden oder ähnlich. Wird als Ersatzteil angeboten, nicht als voll funktionsfähiges Gerät.",
  },
];

export const RADIUS_OPTIONS = [10, 25, 50, 100, 200, 400] as const;

export const IPAD_CONNECTIVITY: { id: IpadConnectivity; label: string }[] = [
  { id: "wifi", label: "WLAN" },
  { id: "cellular", label: "WLAN + Cellular" },
];

export function formatConnectivity(value?: IpadConnectivity): string | undefined {
  return IPAD_CONNECTIVITY.find((item) => item.id === value)?.label;
}

export function parseRadiusKm(value: unknown): number | undefined {
  const n = Number(value);
  return (RADIUS_OPTIONS as readonly number[]).includes(n) ? n : undefined;
}

const silver = { id: "silber", label: "Silber", hex: "#C0C0C5" };
const gold = { id: "gold", label: "Gold", hex: "#D4AF77" };
const spaceGray = { id: "space-grau", label: "Space Grau", hex: "#7D7E80" };
const spaceBlack = { id: "space-schwarz", label: "Space Schwarz", hex: "#2E2E2E" };
const midnight = { id: "mitternacht", label: "Mitternacht", hex: "#232A31" };
const starlight = { id: "polarstern", label: "Polarstern", hex: "#F0E4D3" };
const skyBlue = { id: "himmelblau", label: "Himmelblau", hex: "#A8C5DA" };
const citrus = { id: "zitrus", label: "Zitrus", hex: "#D4E157" };
const indigo = { id: "indigo", label: "Indigo", hex: "#4B5C8A" };
const pink = { id: "rosa", label: "Rosa", hex: "#E8B4B8" };
const blue = { id: "blau", label: "Blau", hex: "#A8BDD4" };
const purple = { id: "violett", label: "Violett", hex: "#B8A9C9" };
const yellow = { id: "gelb", label: "Gelb", hex: "#F5D76E" };
const green = { id: "gruen", label: "Grün", hex: "#A8C5A0" };
const red = { id: "rot", label: "Rot", hex: "#C41E3A" };
const natural = { id: "natural", label: "Natural Titanium", hex: "#C2BCB2" };
const blackTi = { id: "schwarz-ti", label: "Black Titanium", hex: "#3C3C3C" };
const whiteTi = { id: "weiss-ti", label: "White Titanium", hex: "#F5F5F0" };
const blueTi = { id: "blau-ti", label: "Blue Titanium", hex: "#3B4455" };
const white = { id: "weiss", label: "Weiß", hex: "#F5F5F7" };
const black = { id: "schwarz", label: "Schwarz", hex: "#1D1D1F" };
const orange = { id: "orange", label: "Orange", hex: "#F5A26F" };
const teal = { id: "teal", label: "Blaugrün", hex: "#5F9EA0" };
const ultramarine = { id: "ultramarine", label: "Ultramarin", hex: "#3D5A80" };
const desert = { id: "desert", label: "Desert Titanium", hex: "#C2A37A" };

export const MODELS: ModelDefinition[] = [
  // Mac
  {
    id: "macbook-neo",
    categoryId: "mac",
    name: "MacBook Neo",
    featured: true,
    sizes: ['13"', '15"'],
    years: [2025, 2026],
    colors: [silver, citrus, indigo, pink],
    memoryOptions: ["16 GB", "24 GB", "32 GB"],
    storageOptions: ["256 GB", "512 GB", "1 TB", "2 TB"],
    chipOptions: ["A18 Pro", "A18 Pro mit Touch ID"],
  },
  {
    id: "macbook-air",
    categoryId: "mac",
    name: "MacBook Air",
    featured: true,
    sizes: ['11"', '13"', '15"'],
    years: [2015, 2017, 2018, 2019, 2020, 2022, 2023, 2024, 2025, 2026],
    colors: [midnight, starlight, skyBlue, silver, spaceGray, gold],
    memoryOptions: ["4 GB", "8 GB", "16 GB", "24 GB", "32 GB"],
    storageOptions: ["128 GB", "256 GB", "512 GB", "1 TB", "1,5 TB", "2 TB", "4 TB"],
    chipOptions: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "M1", "M2", "M3", "M4", "M5"],
  },
  {
    id: "macbook-pro",
    categoryId: "mac",
    name: "MacBook Pro",
    featured: true,
    sizes: ['13"', '14"', '15"', '16"'],
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
    colors: [spaceBlack, spaceGray, silver],
    memoryOptions: ["8 GB", "16 GB", "18 GB", "24 GB", "32 GB", "36 GB", "48 GB", "64 GB", "96 GB", "128 GB"],
    storageOptions: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
    chipOptions: [
      "Intel Core i5",
      "Intel Core i7",
      "Intel Core i9",
      "M1",
      "M1 Pro",
      "M1 Max",
      "M2",
      "M2 Pro",
      "M2 Max",
      "M3",
      "M3 Pro",
      "M3 Max",
      "M4",
      "M4 Pro",
      "M4 Max",
      "M5",
      "M5 Pro",
      "M5 Max",
    ],
  },
  {
    id: "imac",
    categoryId: "mac",
    name: "iMac",
    featured: true,
    sizes: ['21,5"', '24"', '27"'],
    years: [2015, 2017, 2019, 2020, 2021, 2023, 2024],
    colors: [blue, green, pink, silver, yellow, purple, orange],
    memoryOptions: ["8 GB", "16 GB", "24 GB", "32 GB", "64 GB", "128 GB"],
    storageOptions: ["256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
    chipOptions: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "M1", "M3", "M4"],
  },
  {
    id: "mac-mini",
    categoryId: "mac",
    name: "Mac mini",
    featured: true,
    years: [2014, 2018, 2020, 2023, 2024, 2026],
    colors: [silver, spaceGray],
    memoryOptions: ["4 GB", "8 GB", "16 GB", "24 GB", "32 GB", "48 GB", "64 GB"],
    storageOptions: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
    chipOptions: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "M1", "M2", "M2 Pro", "M4", "M4 Pro", "M6", "M5 Pro"],
  },
  {
    id: "mac-studio",
    categoryId: "mac",
    name: "Mac Studio",
    featured: true,
    years: [2022, 2023, 2025, 2026],
    colors: [silver],
    memoryOptions: ["32 GB", "36 GB", "48 GB", "64 GB", "96 GB", "128 GB", "192 GB", "256 GB", "512 GB"],
    storageOptions: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB", "16 TB"],
    chipOptions: ["M1 Max", "M1 Ultra", "M2 Max", "M2 Ultra", "M4 Max", "M3 Ultra", "M5 Max", "M5 Ultra"],
  },
  {
    id: "mac-pro",
    categoryId: "mac",
    name: "Mac Pro",
    featured: true,
    years: [2013, 2019, 2023],
    colors: [silver, spaceGray],
    memoryOptions: ["16 GB", "32 GB", "48 GB", "64 GB", "96 GB", "128 GB", "192 GB", "256 GB", "384 GB", "512 GB", "768 GB", "1,5 TB"],
    storageOptions: ["256 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
    chipOptions: ["Intel Xeon", "Intel Xeon W", "M2 Ultra"],
  },
  ...LEGACY_MACS,
  // iPad
  {
    id: "ipad-pro",
    categoryId: "ipad",
    name: "iPad Pro",
    featured: true,
    sizes: ['11"', '12,9"', '13"'],
    years: [2018, 2020, 2021, 2022, 2024],
    colors: [spaceBlack, silver, spaceGray],
    memoryOptions: ["4 GB", "6 GB", "8 GB", "16 GB"],
    storageOptions: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
    chipOptions: ["A12X", "A12Z", "M1", "M2", "M4"],
  },
  {
    id: "ipad-air",
    categoryId: "ipad",
    name: "iPad Air",
    featured: true,
    sizes: ['10.5"', '10.9"', '11"', '13"'],
    years: [2019, 2020, 2022, 2024, 2025],
    colors: [spaceGray, silver, gold, blue, purple, starlight, pink, green, skyBlue],
    storageOptions: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"],
    chipOptions: ["A12", "A14", "M1", "M2", "M3"],
  },
  {
    id: "ipad",
    categoryId: "ipad",
    name: "iPad",
    featured: true,
    sizes: ['9,7"', '10,2"', '10.9"', '11"'],
    years: [2018, 2019, 2020, 2021, 2022, 2025],
    colors: [blue, pink, yellow, silver, spaceGray, gold],
    memoryOptions: ["2 GB", "3 GB", "4 GB", "6 GB"],
    storageOptions: ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB"],
    chipOptions: ["A10", "A12", "A13", "A14", "A16"],
  },
  {
    id: "ipad-mini",
    categoryId: "ipad",
    name: "iPad mini",
    featured: true,
    sizes: ['7,9"', '8.3"'],
    years: [2015, 2019, 2021, 2024],
    colors: [spaceGray, pink, purple, starlight, silver, gold],
    memoryOptions: ["2 GB", "3 GB", "4 GB", "8 GB"],
    storageOptions: ["16 GB", "32 GB", "64 GB", "128 GB", "256 GB"],
    chipOptions: ["A8", "A12", "A15", "A17 Pro"],
  },
  // iPhone
  ...MORE_IPHONES,
  {
    id: "iphone-16-pro",
    categoryId: "iphone",
    name: "iPhone 16 Pro",
    sizes: ["6,3\"", "6,9\""],
    years: [2024],
    colors: [natural, blackTi, whiteTi, desert],
    memoryOptions: ["8 GB"],
    storageOptions: ["128 GB", "256 GB", "512 GB", "1 TB"],
    chipOptions: ["A18 Pro"],
  },
  {
    id: "iphone-16",
    categoryId: "iphone",
    name: "iPhone 16",
    featured: true,
    sizes: ["6,1\"", "6,7\""],
    years: [2024],
    colors: [black, white, pink, teal, ultramarine],
    memoryOptions: ["8 GB"],
    storageOptions: ["128 GB", "256 GB", "512 GB"],
    chipOptions: ["A18"],
  },
  {
    id: "iphone-15",
    categoryId: "iphone",
    name: "iPhone 15",
    sizes: ["6,1\"", "6,7\""],
    years: [2023],
    colors: [black, blue, green, yellow, pink],
    memoryOptions: ["6 GB"],
    storageOptions: ["128 GB", "256 GB", "512 GB"],
    chipOptions: ["A16"],
  },
  {
    id: "iphone-14",
    categoryId: "iphone",
    name: "iPhone 14",
    sizes: ["6,1\"", "6,7\""],
    years: [2022],
    colors: [midnight, starlight, blue, purple, red, yellow],
    memoryOptions: ["6 GB"],
    storageOptions: ["128 GB", "256 GB", "512 GB"],
    chipOptions: ["A15"],
  },
  {
    id: "iphone-se",
    categoryId: "iphone",
    name: "iPhone SE (3. Generation)",
    sizes: ["4,7\""],
    years: [2022],
    colors: [midnight, starlight, red],
    memoryOptions: ["4 GB"],
    storageOptions: ["64 GB", "128 GB", "256 GB"],
    chipOptions: ["A15"],
  },
];

export function getModelsByCategory(categoryId?: string) {
  if (!categoryId) return MODELS;
  return MODELS.filter((m) => m.categoryId === categoryId);
}

/** Newest generation first. Same year keeps the catalog order, not the alphabet. */
export function sortModelsByAge<T extends { years?: readonly number[] }>(models: readonly T[]): T[] {
  return models
    .map((model, index) => ({ model, index, year: model.years?.reduce((max, year) => Math.max(max, year), 0) ?? 0 }))
    .sort((a, b) => b.year - a.year || a.index - b.index)
    .map((item) => item.model);
}

export function getModelById(modelId: string) {
  return MODELS.find((m) => m.id === modelId);
}

export function getColor(modelId: string, colorId: string) {
  return getModelById(modelId)?.colors.find((c) => c.id === colorId);
}

export function normalizeConditionId(id: string): ConditionId {
  if (id === "wie-neu") return "sehr-gut";
  return id as ConditionId;
}

export function getCondition(id: ConditionId | string) {
  return CONDITIONS.find((c) => c.id === normalizeConditionId(id));
}

export function isPartsListing(condition: ConditionId) {
  return condition === "defekt";
}
