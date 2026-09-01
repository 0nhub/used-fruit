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
    id: "wie-neu",
    label: "Wie neu",
    hint: "Kaum Gebrauchsspuren, sehr gepflegt.",
  },
  {
    id: "sehr-gut",
    label: "Sehr gut",
    hint: "Leichte Gebrauchsspuren, voll funktionsfähig.",
  },
  {
    id: "gut",
    label: "Gut",
    hint: "Sichtbare Spuren, einwandfreie Funktion.",
  },
  {
    id: "akzeptabel",
    label: "Akzeptabel",
    hint: "Deutliche Spuren, technisch in Ordnung.",
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

export const MODELS: ModelDefinition[] = [
  // Mac
  {
    id: "macbook-neo",
    categoryId: "mac",
    name: "MacBook Neo",
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
    sizes: ['13"', '15"'],
    years: [2018, 2019, 2020, 2022, 2023, 2024, 2025],
    colors: [midnight, starlight, skyBlue, silver, spaceGray, gold],
    memoryOptions: ["8 GB", "16 GB", "24 GB"],
    storageOptions: ["256 GB", "512 GB", "1 TB", "2 TB"],
    chipOptions: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "M1", "M2", "M3", "M4"],
  },
  {
    id: "macbook-pro",
    categoryId: "mac",
    name: "MacBook Pro",
    sizes: ['13"', '14"', '15"', '16"'],
    years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    colors: [spaceBlack, spaceGray, silver],
    memoryOptions: ["16 GB", "24 GB", "32 GB", "48 GB", "64 GB"],
    storageOptions: ["512 GB", "1 TB", "2 TB", "4 TB"],
    chipOptions: [
      "Intel Core i5",
      "Intel Core i7",
      "Intel Core i9",
      "M1",
      "M1 Pro",
      "M1 Max",
      "M2 Pro",
      "M2 Max",
      "M3 Pro",
      "M3 Max",
      "M4",
      "M4 Pro",
      "M4 Max",
    ],
  },
  {
    id: "imac",
    categoryId: "mac",
    name: "iMac",
    sizes: ['21,5"', '24"', '27"'],
    years: [2017, 2019, 2020, 2021, 2023, 2024],
    colors: [blue, green, pink, silver, yellow, purple, orange],
    memoryOptions: ["8 GB", "16 GB", "24 GB", "32 GB"],
    storageOptions: ["256 GB", "512 GB", "1 TB", "2 TB"],
    chipOptions: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "M1", "M3", "M4"],
  },
  {
    id: "mac-mini",
    categoryId: "mac",
    name: "Mac mini",
    years: [2018, 2020, 2023, 2024],
    colors: [silver, spaceGray],
    memoryOptions: ["8 GB", "16 GB", "24 GB", "32 GB"],
    storageOptions: ["256 GB", "512 GB", "1 TB", "2 TB"],
    chipOptions: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "M1", "M2", "M2 Pro", "M4", "M4 Pro"],
  },
  {
    id: "mac-studio",
    categoryId: "mac",
    name: "Mac Studio",
    years: [2022, 2023, 2025],
    colors: [silver],
    memoryOptions: ["32 GB", "64 GB", "128 GB"],
    storageOptions: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
    chipOptions: ["M1 Max", "M1 Ultra", "M2 Max", "M2 Ultra", "M4 Max"],
  },
  {
    id: "mac-pro",
    categoryId: "mac",
    name: "Mac Pro",
    years: [2019, 2023],
    colors: [silver],
    memoryOptions: ["32 GB", "64 GB", "192 GB", "384 GB"],
    storageOptions: ["1 TB", "2 TB", "4 TB", "8 TB"],
    chipOptions: ["Intel Xeon", "M2 Ultra"],
    disabled: true,
  },
  // iPad
  {
    id: "ipad-pro",
    categoryId: "ipad",
    name: "iPad Pro",
    sizes: ['11"', '13"'],
    years: [2022, 2024],
    colors: [spaceBlack, silver],
    storageOptions: ["256 GB", "512 GB", "1 TB", "2 TB"],
    chipOptions: ["M2", "M4"],
  },
  {
    id: "ipad-air",
    categoryId: "ipad",
    name: "iPad Air",
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
    sizes: ['10.9"', '11"'],
    years: [2022, 2025],
    colors: [blue, pink, yellow, silver],
    storageOptions: ["64 GB", "128 GB", "256 GB", "512 GB"],
    chipOptions: ["A14", "A16"],
  },
  {
    id: "ipad-mini",
    categoryId: "ipad",
    name: "iPad mini",
    sizes: ['8.3"'],
    years: [2021, 2024],
    colors: [spaceGray, pink, purple, starlight],
    storageOptions: ["64 GB", "256 GB"],
    chipOptions: ["A15", "A17 Pro"],
  },
  // iPhone
  {
    id: "iphone-16-pro",
    categoryId: "iphone",
    name: "iPhone 16 Pro",
    sizes: ["6,3\"", "6,9\""],
    years: [2024],
    colors: [natural, blackTi, whiteTi, blueTi],
    storageOptions: ["128 GB", "256 GB", "512 GB", "1 TB"],
    chipOptions: ["A18 Pro"],
  },
  {
    id: "iphone-16",
    categoryId: "iphone",
    name: "iPhone 16",
    sizes: ["6,1\"", "6,7\""],
    years: [2024],
    colors: [black, white, pink, teal, ultramarine],
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
    storageOptions: ["128 GB", "256 GB", "512 GB"],
    chipOptions: ["A15"],
  },
  {
    id: "iphone-se",
    categoryId: "iphone",
    name: "iPhone SE",
    sizes: ["4,7\""],
    years: [2022],
    colors: [midnight, starlight, red],
    storageOptions: ["64 GB", "128 GB", "256 GB"],
    chipOptions: ["A15"],
  },
];

export function getModelsByCategory(categoryId?: string) {
  if (!categoryId) return MODELS;
  return MODELS.filter((m) => m.categoryId === categoryId);
}

export function getModelById(modelId: string) {
  return MODELS.find((m) => m.id === modelId);
}

export function getColor(modelId: string, colorId: string) {
  return getModelById(modelId)?.colors.find((c) => c.id === colorId);
}

export function getCondition(id: ConditionId) {
  return CONDITIONS.find((c) => c.id === id);
}

export function isPartsListing(condition: ConditionId) {
  return condition === "defekt";
}
