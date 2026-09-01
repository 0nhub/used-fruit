import { getModelById } from "@/data/catalog";
import type { IpadConnectivity } from "@/lib/types";

/** Public device identity — never invents color, RAM or storage. */
export interface DeviceIdentity {
  modelId: string;
  chip?: string;
  size?: string;
  year?: number;
  connectivity?: IpadConnectivity;
  label: string;
  appleModel?: string;
  identifier?: string;
}

function connectivityFromName(name: string): IpadConnectivity | undefined {
  const n = name.toLowerCase();
  if (n.includes("cellular") || n.includes("mobilfunk")) return "cellular";
  if (n.includes("wi-fi") || n.includes("wifi") || n.includes("wlan")) return "wifi";
  return undefined;
}

type IdentitySeed = Omit<DeviceIdentity, "label"> & { label?: string };

function seed(identity: IdentitySeed): DeviceIdentity {
  const model = getModelById(identity.modelId);
  return {
    ...identity,
    label: identity.label ?? model?.name ?? identity.modelId,
  };
}

/**
 * Modellnummern (Axxxx) und Modellkennungen aus öffentlichen Quellen:
 * Apple Support, appledb, The iPhone Wiki.
 */
const BY_KEY: Record<string, DeviceIdentity> = {};

function add(keys: string[], identity: IdentitySeed) {
  const value = seed(identity);
  for (const key of keys) {
    BY_KEY[key.toUpperCase().replace(/[^A-Z0-9]/g, "")] = value;
  }
}

add(
  ["A3083", "A3292", "A3293", "A3294", "IPHONE171"],
  { modelId: "iphone-16-pro", chip: "A18 Pro", size: '6,3"', year: 2024, label: "iPhone 16 Pro" },
);
add(
  ["A3084", "A3295", "A3296", "A3297", "IPHONE172"],
  { modelId: "iphone-16-pro", chip: "A18 Pro", size: '6,9"', year: 2024, label: "iPhone 16 Pro Max" },
);
add(
  ["A3081", "A3286", "A3287", "A3288", "IPHONE173"],
  { modelId: "iphone-16", chip: "A18", size: '6,1"', year: 2024, label: "iPhone 16" },
);
add(
  ["A3082", "A3289", "A3290", "A3291", "IPHONE174"],
  { modelId: "iphone-16", chip: "A18", size: '6,7"', year: 2024, label: "iPhone 16 Plus" },
);
add(
  ["A2846", "A3089", "A3090", "A3092", "IPHONE154"],
  { modelId: "iphone-15", chip: "A16", size: '6,1"', year: 2023, label: "iPhone 15" },
);
add(
  ["A2847", "A3093", "A3094", "A3096", "IPHONE155"],
  { modelId: "iphone-15", chip: "A16", size: '6,7"', year: 2023, label: "iPhone 15 Plus" },
);
add(
  ["A2649", "A2881", "A2882", "A2883", "A2884", "IPHONE147"],
  { modelId: "iphone-14", chip: "A15", size: '6,1"', year: 2022, label: "iPhone 14" },
);
add(
  ["A2632", "A2885", "A2886", "A2887", "A2888", "IPHONE148"],
  { modelId: "iphone-14", chip: "A15", size: '6,7"', year: 2022, label: "iPhone 14 Plus" },
);
add(
  ["A2595", "A2782", "A2783", "A2784", "A2785", "IPHONE146"],
  { modelId: "iphone-se", chip: "A15", size: '4,7"', year: 2022, label: "iPhone SE (3. Generation)" },
);

add(
  ["A2836", "A2837", "A3006", "IPAD163", "IPAD164"],
  { modelId: "ipad-pro", chip: "M4", size: '11"', year: 2024, label: "iPad Pro 11\" (M4)" },
);
add(
  ["A2925", "A2926", "A3007", "IPAD165", "IPAD166"],
  { modelId: "ipad-pro", chip: "M4", size: '13"', year: 2024, label: "iPad Pro 13\" (M4)" },
);
add(
  ["A2435", "A2759", "A2761", "A2762", "IPAD143", "IPAD144"],
  { modelId: "ipad-pro", chip: "M2", size: '11"', year: 2022, label: "iPad Pro 11\" (M2)" },
);
add(
  ["A2436", "A2437", "A2764", "A2766", "IPAD145", "IPAD146"],
  { modelId: "ipad-pro", chip: "M2", size: '13"', year: 2022, label: "iPad Pro 12,9\" (M2)" },
);
add(
  ["A2902", "A2903", "A2904", "IPAD148", "IPAD149"],
  { modelId: "ipad-air", chip: "M2", size: '11"', year: 2024, label: "iPad Air 11\" (M2)" },
);
add(
  ["A2898", "A2899", "A2900", "IPAD1410", "IPAD1411"],
  { modelId: "ipad-air", chip: "M2", size: '13"', year: 2024, label: "iPad Air 13\" (M2)" },
);
add(
  ["A3266", "A3267", "A3270", "IPAD153", "IPAD154"],
  { modelId: "ipad-air", chip: "M3", size: '11"', year: 2025, label: "iPad Air 11\" (M3)" },
);
add(
  ["A3268", "A3269", "A3271", "IPAD155", "IPAD156"],
  { modelId: "ipad-air", chip: "M3", size: '13"', year: 2025, label: "iPad Air 13\" (M3)" },
);
add(
  ["A2696", "A2757", "A2777", "IPAD1318", "IPAD1319"],
  { modelId: "ipad", chip: "A14", size: '10.9"', year: 2022, label: "iPad (10. Generation)" },
);
add(
  ["A3354", "A3355", "A3356", "IPAD157", "IPAD158"],
  { modelId: "ipad", chip: "A16", size: '11"', year: 2025, label: "iPad (11. Generation)" },
);
add(
  ["A2567", "A2568", "A2569", "IPAD141", "IPAD142"],
  { modelId: "ipad-mini", chip: "A15", size: '8.3"', year: 2021, label: "iPad mini (6. Generation)" },
);
add(
  ["A2993", "A2994", "A2995", "A2996", "IPAD161", "IPAD162"],
  { modelId: "ipad-mini", chip: "A17 Pro", size: '8.3"', year: 2024, label: "iPad mini (7. Generation)" },
);

add(
  ["A1932"],
  { modelId: "macbook-air", chip: "Intel Core i5", size: '13"', year: 2019, label: "MacBook Air (13\", 2018/2019)" },
);
add(
  ["A2179"],
  { modelId: "macbook-air", chip: "Intel Core i5", size: '13"', year: 2020, label: "MacBook Air (13\", 2020, Intel)" },
);
add(
  ["A2337", "MACBOOKAIR101"],
  { modelId: "macbook-air", chip: "M1", size: '13"', year: 2020, label: "MacBook Air (13\", M1)" },
);
add(
  ["A2681", "MAC142"],
  { modelId: "macbook-air", chip: "M2", size: '13"', year: 2022, label: "MacBook Air (13\", M2)" },
);
add(
  ["A2941", "MAC1415"],
  { modelId: "macbook-air", chip: "M2", size: '15"', year: 2023, label: "MacBook Air (15\", M2)" },
);
add(
  ["A3113", "MAC1512"],
  { modelId: "macbook-air", chip: "M3", size: '13"', year: 2024, label: "MacBook Air (13\", M3)" },
);
add(
  ["A3114", "MAC1513"],
  { modelId: "macbook-air", chip: "M3", size: '15"', year: 2024, label: "MacBook Air (15\", M3)" },
);
add(
  ["A3240", "MAC1612"],
  { modelId: "macbook-air", chip: "M4", size: '13"', year: 2025, label: "MacBook Air (13\", M4)" },
);
add(
  ["A3241", "MAC1613"],
  { modelId: "macbook-air", chip: "M4", size: '15"', year: 2025, label: "MacBook Air (15\", M4)" },
);

add(
  ["A1706", "A1708", "MACBOOKPRO133", "MACBOOKPRO131"],
  { modelId: "macbook-pro", chip: "Intel Core i5", size: '13"', year: 2017, label: "MacBook Pro (13\", 2016/2017)" },
);
add(
  ["A1989", "MACBOOKPRO151"],
  { modelId: "macbook-pro", chip: "Intel Core i5", size: '13"', year: 2019, label: "MacBook Pro (13\", 2018/2019)" },
);
add(
  ["A2251", "A2289", "MACBOOKPRO164"],
  { modelId: "macbook-pro", chip: "Intel Core i5", size: '13"', year: 2020, label: "MacBook Pro (13\", 2020, Intel)" },
);
add(
  ["A2338", "MACBOOKPRO173", "MACBOOKPRO171"],
  { modelId: "macbook-pro", chip: "M1", size: '13"', year: 2020, label: "MacBook Pro (13\", M1/M2)" },
);
add(
  ["A1707", "MACBOOKPRO132"],
  { modelId: "macbook-pro", chip: "Intel Core i7", size: '15"', year: 2017, label: "MacBook Pro (15\", 2016/2017)" },
);
add(
  ["A1990", "MACBOOKPRO152"],
  { modelId: "macbook-pro", chip: "Intel Core i9", size: '15"', year: 2019, label: "MacBook Pro (15\", 2018/2019)" },
);
add(
  ["A2141", "MACBOOKPRO161"],
  { modelId: "macbook-pro", chip: "Intel Core i9", size: '16"', year: 2019, label: "MacBook Pro (16\", 2019)" },
);
add(
  ["A2442", "MACBOOKPRO183", "MACBOOKPRO184"],
  { modelId: "macbook-pro", chip: "M1 Pro", size: '14"', year: 2021, label: "MacBook Pro (14\", 2021)" },
);
add(
  ["A2485", "MACBOOKPRO181", "MACBOOKPRO182"],
  { modelId: "macbook-pro", chip: "M1 Pro", size: '16"', year: 2021, label: "MacBook Pro (16\", 2021)" },
);
add(
  ["A2779", "MAC145", "MAC149"],
  { modelId: "macbook-pro", chip: "M2 Pro", size: '14"', year: 2023, label: "MacBook Pro (14\", 2023)" },
);
add(
  ["A2780", "MAC146", "MAC1410"],
  { modelId: "macbook-pro", chip: "M2 Pro", size: '16"', year: 2023, label: "MacBook Pro (16\", 2023)" },
);
add(
  ["A2918", "A2992", "MAC153", "MAC156", "MAC158", "MAC1510"],
  { modelId: "macbook-pro", chip: "M3 Pro", size: '14"', year: 2023, label: "MacBook Pro (14\", 2023)" },
);
add(
  ["A2991", "MAC157", "MAC159", "MAC1511"],
  { modelId: "macbook-pro", chip: "M3 Pro", size: '16"', year: 2023, label: "MacBook Pro (16\", 2023)" },
);
add(
  ["A3112", "A3185", "A3401", "MAC161", "MAC166", "MAC168"],
  { modelId: "macbook-pro", chip: "M4 Pro", size: '14"', year: 2024, label: "MacBook Pro (14\", 2024)" },
);
add(
  ["A3186", "A3403", "MAC165", "MAC167"],
  { modelId: "macbook-pro", chip: "M4 Pro", size: '16"', year: 2024, label: "MacBook Pro (16\", 2024)" },
);

add(
  ["A1418"],
  { modelId: "imac", chip: "Intel Core i5", size: '21,5"', year: 2017, label: "iMac (21,5\", 2017)" },
);
add(
  ["A2116"],
  { modelId: "imac", chip: "Intel Core i5", size: '21,5"', year: 2019, label: "iMac (21,5\", 2019)" },
);
add(
  ["A1419"],
  { modelId: "imac", chip: "Intel Core i5", size: '27"', year: 2017, label: "iMac (27\", 2017)" },
);
add(
  ["A2115"],
  { modelId: "imac", chip: "Intel Core i7", size: '27"', year: 2020, label: "iMac (27\", 2019/2020)" },
);
add(
  ["A2438", "A2439", "IMAC211", "IMAC212"],
  { modelId: "imac", chip: "M1", size: '24"', year: 2021, label: "iMac (24\", 2021)" },
);
add(
  ["A2873", "A2874", "MAC154", "MAC155"],
  { modelId: "imac", chip: "M3", size: '24"', year: 2023, label: "iMac (24\", 2023)" },
);
add(
  ["A3137", "MAC162", "MAC163"],
  { modelId: "imac", chip: "M4", size: '24"', year: 2024, label: "iMac (24\", 2024)" },
);

add(
  ["A1993", "MACMINI81"],
  { modelId: "mac-mini", chip: "Intel Core i5", year: 2018, label: "Mac mini (2018)" },
);
add(
  ["A2348", "MACMINI91"],
  { modelId: "mac-mini", chip: "M1", year: 2020, label: "Mac mini (M1, 2020)" },
);
add(
  ["A2816", "MAC143"],
  { modelId: "mac-mini", chip: "M2", year: 2023, label: "Mac mini (M2, 2023)" },
);
add(
  ["A2817", "MAC1412"],
  { modelId: "mac-mini", chip: "M2 Pro", year: 2023, label: "Mac mini (M2 Pro, 2023)" },
);
add(
  ["A3238", "MAC1610"],
  { modelId: "mac-mini", chip: "M4", year: 2024, label: "Mac mini (M4, 2024)" },
);
add(
  ["A3239", "MAC1611"],
  { modelId: "mac-mini", chip: "M4 Pro", year: 2024, label: "Mac mini (M4 Pro, 2024)" },
);

add(
  ["A2615", "MAC131", "MAC132"],
  { modelId: "mac-studio", chip: "M1 Max", year: 2022, label: "Mac Studio (2022)" },
);
add(
  ["A2775", "A2891", "MAC1413", "MAC1414"],
  { modelId: "mac-studio", chip: "M2 Max", year: 2023, label: "Mac Studio (2023)" },
);
add(
  ["A3389", "MAC169"],
  { modelId: "mac-studio", chip: "M4 Max", year: 2025, label: "Mac Studio (2025)" },
);
add(
  ["A2140", "MACPRO71"],
  { modelId: "mac-pro", chip: "Intel Xeon W", year: 2019, label: "Mac Pro (2019)" },
);
add(
  ["A2787", "MAC148"],
  { modelId: "mac-pro", chip: "M2 Ultra", year: 2023, label: "Mac Pro (2023)" },
);

export function lookupKey(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function lookupPublicIdentity(value: string): DeviceIdentity | undefined {
  const key = lookupKey(value);
  if (!key) return undefined;
  if (BY_KEY[key]) return BY_KEY[key];
  const compact = value.toUpperCase().replace(/\s+/g, "");
  const identifier = compact.match(/^(IPHONE|IPAD|MAC|MACBOOKPRO|MACBOOKAIR|IMAC|MACMINI|MACSTUDIO|MACPRO)\d+,\d+$/);
  if (identifier) return BY_KEY[lookupKey(identifier[0])];
  return undefined;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/zoll/g, "inch")
    .replace(/,/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function parseInch(name: string): string | undefined {
  const match = name.match(/(\d+(?:\.\d+)?)\s*-?\s*inch/);
  if (!match) return undefined;
  const n = Number(match[1]);
  if (n === 12.9) return '13"';
  if (n === 10.9) return '10.9"';
  if (n === 8.3) return '8.3"';
  if (n === 21.5) return '21,5"';
  if (Number.isInteger(n)) return `${n}"`;
  return `${String(n).replace(".", ",")}"`;
}

function parseYear(name: string): number | undefined {
  const match = name.match(/\b(20[1-2]\d)\b/);
  return match ? Number(match[1]) : undefined;
}

function parseChip(name: string): string | undefined {
  const intel = name.match(/\b(?:intel\s+)?(?:core\s+)?(i[3579]|xeon(?:\s+w)?)\b/i);
  if (intel) {
    const part = intel[1].toLowerCase();
    if (part.startsWith("xeon")) return "Intel Xeon W";
    return `Intel Core ${part.replace(/^i/, "i")}`;
  }
  const match = name.match(/\b(m[1-4](?:\s*(?:pro|max|ultra))?|a1[4-8](?:\s*pro)?)\b/i);
  if (!match) return undefined;
  return match[1]
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^m/, "M")
    .replace(/^a/, "A")
    .replace(" pro", " Pro")
    .replace(" max", " Max")
    .replace(" ultra", " Ultra");
}

function iphoneSize(name: string, fallback: string): string {
  if (/\b(pro max|max)\b/.test(name) && name.includes("16")) return '6,9"';
  if (/\b(pro max|max)\b/.test(name)) return '6,7"';
  if (/\bplus\b/.test(name)) return '6,7"';
  const parsed = parseInch(name);
  return parsed ?? fallback;
}

export function identityFromAppleName(name: string): DeviceIdentity | undefined {
  const n = normalizeName(name);
  if (!n || n.includes("error") || n === "unknown") return undefined;

  const year = parseYear(n);
  const chip = parseChip(n);
  const inch = parseInch(n);

  if (n.includes("macbook air")) {
    return seed({
      modelId: "macbook-air",
      chip,
      size: inch === '15"' || inch === '13"' ? inch : undefined,
      year,
      label: name,
    });
  }
  if (n.includes("macbook pro")) {
    return seed({
      modelId: "macbook-pro",
      chip,
      size:
        inch === '13"' || inch === '14"' || inch === '15"' || inch === '16"'
          ? inch
          : undefined,
      year,
      label: name,
    });
  }
  if (n.includes("mac mini") || n.includes("macmini")) {
    return seed({ modelId: "mac-mini", chip, year, label: name });
  }
  if (n.includes("mac studio")) {
    return seed({ modelId: "mac-studio", chip, year, label: name });
  }
  if (n.includes("imac")) {
    return seed({
      modelId: "imac",
      chip,
      size: inch === '21,5"' || inch === '24"' || inch === '27"' ? inch : undefined,
      year,
      label: name,
    });
  }
  if (n.includes("ipad pro")) {
    return seed({
      modelId: "ipad-pro",
      chip: chip?.includes("M") ? chip : undefined,
      size: inch === '11"' || inch === '13"' ? inch : undefined,
      year,
      connectivity: connectivityFromName(n),
      label: name,
    });
  }
  if (n.includes("ipad air")) {
    return seed({
      modelId: "ipad-air",
      chip: chip?.includes("M") ? chip : undefined,
      size: inch === '11"' || inch === '13"' ? inch : undefined,
      year,
      connectivity: connectivityFromName(n),
      label: name,
    });
  }
  if (n.includes("ipad mini")) {
    return seed({
      modelId: "ipad-mini",
      chip,
      size: '8.3"',
      year,
      connectivity: connectivityFromName(n),
      label: name,
    });
  }
  if (/\bipad\b/.test(n) && !n.includes("iphone")) {
    return seed({
      modelId: "ipad",
      chip,
      size: inch === '11"' || inch === '10.9"' ? inch : undefined,
      year,
      connectivity: connectivityFromName(n),
      label: name,
    });
  }
  if (n.includes("iphone 16 pro")) {
    return seed({
      modelId: "iphone-16-pro",
      chip: "A18 Pro",
      size: iphoneSize(n, '6,3"'),
      year: 2024,
      label: name,
    });
  }
  if (n.includes("iphone 16")) {
    return seed({
      modelId: "iphone-16",
      chip: "A18",
      size: iphoneSize(n, '6,1"'),
      year: 2024,
      label: name,
    });
  }
  if (n.includes("iphone 15") && !n.includes("pro")) {
    return seed({
      modelId: "iphone-15",
      chip: "A16",
      size: iphoneSize(n, '6,1"'),
      year: 2023,
      label: name,
    });
  }
  if (n.includes("iphone 14") && !n.includes("pro")) {
    return seed({
      modelId: "iphone-14",
      chip: "A15",
      size: iphoneSize(n, '6,1"'),
      year: 2022,
      label: name,
    });
  }
  if (n.includes("iphone se")) {
    return seed({
      modelId: "iphone-se",
      chip: "A15",
      size: '4,7"',
      year: year ?? 2022,
      label: name,
    });
  }
  return undefined;
}

export function identityToPartial(identity: DeviceIdentity): {
  modelId: string;
  chip?: string;
  size?: string;
  year?: number;
  connectivity?: IpadConnectivity;
} {
  return {
    modelId: identity.modelId,
    chip: identity.chip,
    size: identity.size,
    year: identity.year,
    connectivity: identity.connectivity,
  };
}

/** Offizielle Apple-Modellnummern (A-Nummer) und Identifier aus support.apple.com. */
export function getAppleIdentity(modelId: string, size?: string) {
  const key = size ? `${modelId}|${size}` : modelId;
  return APPLE_IDENTITY[key] ?? APPLE_IDENTITY[modelId];
}

const APPLE_IDENTITY: Record<string, { appleModel: string; identifier: string }> = {
  'macbook-air|13"': {
    appleModel: "A3240 (M4, 2025) und Vorgänger je Baujahr",
    identifier: 'Mac16,12 (M4, 13")',
  },
  'macbook-air|15"': {
    appleModel: "je Baujahr, siehe Gehäuseunterseite",
    identifier: 'Mac16,13 (M4, 15")',
  },
  'macbook-pro|13"': {
    appleModel: "A1706, A1708, A1989, A2251, A2289, A2338 — Intel, M1 und M2",
    identifier: "MacBookPro13,1 / 14,1 / 15,2 / 16,2 / 17,1",
  },
  'macbook-pro|14"': {
    appleModel: "je Chip und Baujahr, siehe Gehäuseunterseite",
    identifier: 'Mac16,1 / Mac16,5 (M4 / M4 Pro, 14")',
  },
  'macbook-pro|15"': {
    appleModel: "A1707, A1990 — Intel Core i7 / i9",
    identifier: "MacBookPro13,3 / 14,3 / 15,1",
  },
  'macbook-pro|16"': {
    appleModel: "A2141 (Intel, 2019) sowie M1–M4 Pro/Max",
    identifier: "MacBookPro16,1 / Mac16,6 / Mac16,8",
  },
  'imac|21,5"': {
    appleModel: "A1418, A2116 — Intel",
    identifier: "iMac18,2 / iMac19,2",
  },
  'imac|24"': {
    appleModel: "je Chip und Baujahr, siehe Standfuß",
    identifier: 'Mac16,2 / Mac16,3 (M4, 24")',
  },
  'imac|27"': {
    appleModel: "A1419, A2115 — Intel Core i5 / i7 / i9",
    identifier: "iMac18,3 / iMac19,1 / iMac20,1 / iMac20,2",
  },
  "mac-pro": {
    appleModel: "A2140 (2019, Intel Xeon W), A2787 (2023, M2 Ultra)",
    identifier: "MacPro7,1 / Mac14,8",
  },
  "mac-mini": {
    appleModel: "je Chip und Baujahr, siehe Unterseite",
    identifier: "Mac16,10 / Mac16,11 (M4 / M4 Pro)",
  },
  "mac-studio": {
    appleModel: "je Chip und Baujahr, siehe Unterseite",
    identifier: "Mac16,9 (M4 Max / M3 Ultra, aktuell)",
  },
  'ipad-pro|11"': {
    appleModel: "A2836 (Wi‑Fi), A2837 (Cellular), A3006 (China)",
    identifier: 'iPad16,3 / iPad16,4 (M4, 11")',
  },
  'ipad-pro|13"': {
    appleModel: "A2925 (Wi‑Fi), A2926 (Cellular), A3007 (China)",
    identifier: 'iPad16,5 / iPad16,6 (M4, 13")',
  },
  'ipad-air|11"': {
    appleModel: "A3459 (Wi‑Fi), A3460 (Cellular), A3463 (China)",
    identifier: 'iPad15,3 / iPad15,4 (M3/M4, 11")',
  },
  'ipad-air|13"': {
    appleModel: "A3461 (Wi‑Fi), A3462 (Cellular), A3464 (China)",
    identifier: 'iPad15,5 / iPad15,6 (M3/M4, 13")',
  },
  'ipad|10.9"': {
    appleModel: "A2696 (Wi‑Fi), A2757 (Cellular) — 10. Generation",
    identifier: "iPad13,18 / iPad13,19",
  },
  'ipad|11"': {
    appleModel: "A3354 (Wi‑Fi), A3355 (Cellular), A3356 (China) — A16",
    identifier: "iPad15,7 / iPad15,8",
  },
  'ipad-mini|8.3"': {
    appleModel: "A2993 (Wi‑Fi), A2995 (Cellular), A2996 (China) — A17 Pro",
    identifier: "iPad16,1 / iPad16,2",
  },
  'iphone-16-pro|6,3"': {
    appleModel: "A3083, A3292, A3293, A3294",
    identifier: "iPhone17,1",
  },
  'iphone-16-pro|6,9"': {
    appleModel: "A3084, A3295, A3296, A3297",
    identifier: "iPhone17,2",
  },
  'iphone-16|6,1"': {
    appleModel: "A3081, A3286, A3287, A3288",
    identifier: "iPhone17,3",
  },
  'iphone-16|6,7"': {
    appleModel: "A3082, A3289, A3290, A3291",
    identifier: "iPhone17,4",
  },
  'iphone-15|6,1"': {
    appleModel: "A2846, A3089, A3090, A3092",
    identifier: "iPhone15,4",
  },
  'iphone-15|6,7"': {
    appleModel: "A2847, A3093, A3094, A3096",
    identifier: "iPhone15,5",
  },
  'iphone-14|6,1"': {
    appleModel: "A2649, A2881, A2882, A2883, A2884",
    identifier: "iPhone14,7",
  },
  'iphone-14|6,7"': {
    appleModel: "A2632, A2885, A2886, A2887, A2888",
    identifier: "iPhone14,8",
  },
  'iphone-se|4,7"': {
    appleModel: "A2595, A2782, A2783, A2784, A2785",
    identifier: "iPhone14,6",
  },
};
