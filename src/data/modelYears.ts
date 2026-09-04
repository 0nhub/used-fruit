import { getModelById } from "@/data/catalog";
import type { ModelDefinition } from "@/lib/types";

export interface YearVariant {
  year: number;
  chips?: string[];
  sizes?: string[];
  colorIds?: string[];
  memory?: string[];
  storage?: string[];
}

const intelAirColors = ["gold", "silber", "space-grau"];
const siliconAirColors = ["mitternacht", "polarstern", "space-grau", "silber"];
const imacSiliconColors = ["silber", "blau", "gruen", "rosa", "gelb", "violett", "orange"];
const mbpClassic = ["space-grau", "silber"];
const mbpRecent = ["space-schwarz", "silber"];

const VARIANTS: Record<string, YearVariant[]> = {
  "macbook-neo": [
    {
      year: 2025,
      chips: ["A18 Pro", "A18 Pro mit Touch ID"],
      sizes: ['13"', '15"'],
    },
    {
      year: 2026,
      chips: ["A18 Pro", "A18 Pro mit Touch ID"],
      sizes: ['13"', '15"'],
    },
  ],
  "macbook-air": [
    {
      year: 2018,
      chips: ["Intel Core i5"],
      sizes: ['13"'],
      colorIds: intelAirColors,
      memory: ["8 GB", "16 GB"],
    },
    {
      year: 2019,
      chips: ["Intel Core i5"],
      sizes: ['13"'],
      colorIds: intelAirColors,
      memory: ["8 GB", "16 GB"],
    },
    {
      year: 2020,
      chips: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "M1"],
      sizes: ['13"'],
      colorIds: intelAirColors,
      memory: ["8 GB", "16 GB"],
    },
    {
      year: 2022,
      chips: ["M2"],
      sizes: ['13"'],
      colorIds: siliconAirColors,
      memory: ["8 GB", "16 GB", "24 GB"],
    },
    {
      year: 2023,
      chips: ["M2", "M3"],
      sizes: ['13"', '15"'],
      colorIds: siliconAirColors,
      memory: ["8 GB", "16 GB", "24 GB"],
    },
    {
      year: 2024,
      chips: ["M3"],
      sizes: ['13"', '15"'],
      colorIds: siliconAirColors,
      memory: ["8 GB", "16 GB", "24 GB"],
    },
    {
      year: 2025,
      chips: ["M4"],
      sizes: ['13"', '15"'],
      colorIds: [...siliconAirColors, "himmelblau"],
      memory: ["16 GB", "24 GB"],
    },
  ],
  "macbook-pro": [
    {
      year: 2016,
      chips: ["Intel Core i5", "Intel Core i7"],
      sizes: ['13"', '15"'],
      colorIds: mbpClassic,
    },
    {
      year: 2017,
      chips: ["Intel Core i5", "Intel Core i7"],
      sizes: ['13"', '15"'],
      colorIds: mbpClassic,
    },
    {
      year: 2018,
      chips: ["Intel Core i5", "Intel Core i7", "Intel Core i9"],
      sizes: ['13"', '15"'],
      colorIds: mbpClassic,
    },
    {
      year: 2019,
      chips: ["Intel Core i5", "Intel Core i7", "Intel Core i9"],
      sizes: ['13"', '15"', '16"'],
      colorIds: mbpClassic,
    },
    {
      year: 2020,
      chips: ["Intel Core i5", "Intel Core i7", "Intel Core i9", "M1"],
      sizes: ['13"', '16"'],
      colorIds: mbpClassic,
    },
    {
      year: 2021,
      chips: ["M1 Pro", "M1 Max"],
      sizes: ['14"', '16"'],
      colorIds: mbpClassic,
    },
    {
      year: 2022,
      chips: ["M2"],
      sizes: ['13"'],
      colorIds: mbpClassic,
    },
    {
      year: 2023,
      chips: ["M2 Pro", "M2 Max", "M3", "M3 Pro", "M3 Max"],
      sizes: ['14"', '16"'],
      colorIds: [...mbpClassic, "space-schwarz"],
    },
    {
      year: 2024,
      chips: ["M4", "M4 Pro", "M4 Max"],
      sizes: ['14"', '16"'],
      colorIds: mbpRecent,
    },
    {
      year: 2025,
      chips: ["M4", "M4 Pro", "M4 Max"],
      sizes: ['14"', '16"'],
      colorIds: mbpRecent,
    },
  ],
  imac: [
    {
      year: 2017,
      chips: ["Intel Core i5", "Intel Core i7"],
      sizes: ['21,5"', '27"'],
      colorIds: ["silber"],
    },
    {
      year: 2019,
      chips: ["Intel Core i3", "Intel Core i5", "Intel Core i7"],
      sizes: ['21,5"', '27"'],
      colorIds: ["silber"],
    },
    {
      year: 2020,
      chips: ["Intel Core i5", "Intel Core i7", "Intel Core i9"],
      sizes: ['27"'],
      colorIds: ["silber"],
    },
    {
      year: 2021,
      chips: ["M1"],
      sizes: ['24"'],
      colorIds: imacSiliconColors,
      memory: ["8 GB", "16 GB"],
    },
    {
      year: 2023,
      chips: ["M3"],
      sizes: ['24"'],
      colorIds: imacSiliconColors,
      memory: ["8 GB", "16 GB", "24 GB"],
    },
    {
      year: 2024,
      chips: ["M4"],
      sizes: ['24"'],
      colorIds: imacSiliconColors,
      memory: ["16 GB", "24 GB", "32 GB"],
    },
  ],
  "mac-mini": [
    {
      year: 2018,
      chips: ["Intel Core i3", "Intel Core i5", "Intel Core i7"],
      colorIds: ["space-grau"],
    },
    { year: 2020, chips: ["M1"], colorIds: ["silber"], memory: ["8 GB", "16 GB"] },
    { year: 2023, chips: ["M2", "M2 Pro"], colorIds: ["silber"] },
    { year: 2024, chips: ["M4", "M4 Pro"], colorIds: ["silber"], memory: ["16 GB", "24 GB", "32 GB", "64 GB"] },
  ],
  "mac-studio": [
    { year: 2022, chips: ["M1 Max", "M1 Ultra"] },
    { year: 2023, chips: ["M2 Max", "M2 Ultra"] },
    { year: 2025, chips: ["M4 Max"] },
  ],
  "mac-pro": [
    { year: 2019, chips: ["Intel Xeon W"] },
    { year: 2023, chips: ["M2 Ultra"] },
  ],
  "ipad-pro": [
    { year: 2022, chips: ["M2"], sizes: ['11"', '13"'] },
    { year: 2024, chips: ["M4"], sizes: ['11"', '13"'] },
  ],
  "ipad-air": [
    {
      year: 2019,
      chips: ["A12"],
      sizes: ['10.5"'],
      colorIds: ["space-grau", "silber", "gold"],
      storage: ["64 GB", "256 GB"],
    },
    {
      year: 2020,
      chips: ["A14"],
      sizes: ['10.9"'],
      colorIds: ["space-grau", "silber", "rosa", "gruen", "himmelblau"],
      storage: ["64 GB", "256 GB"],
    },
    {
      year: 2022,
      chips: ["M1"],
      sizes: ['10.9"'],
      colorIds: ["space-grau", "rosa", "violett", "blau", "polarstern"],
      storage: ["64 GB", "256 GB"],
    },
    {
      year: 2024,
      chips: ["M2"],
      sizes: ['11"', '13"'],
      colorIds: ["space-grau", "blau", "violett", "polarstern"],
    },
    {
      year: 2025,
      chips: ["M3"],
      sizes: ['11"', '13"'],
      colorIds: ["space-grau", "blau", "violett", "polarstern"],
    },
  ],
  ipad: [
    { year: 2022, chips: ["A14"], sizes: ['10.9"'] },
    { year: 2025, chips: ["A16"], sizes: ['11"'] },
  ],
  "ipad-mini": [
    { year: 2021, chips: ["A15"], sizes: ['8.3"'] },
    { year: 2024, chips: ["A17 Pro"], sizes: ['8.3"'] },
  ],
};

export function variantForYear(modelId: string, year?: number): YearVariant | undefined {
  if (year == null) return undefined;
  return VARIANTS[modelId]?.find((item) => item.year === year);
}

export function optionsForYear(model: ModelDefinition | undefined, year?: number) {
  if (!model) {
    return { chips: undefined, sizes: undefined, colors: [], memory: undefined, storage: undefined };
  }
  const variant = variantForYear(model.id, year);
  return {
    chips: variant?.chips ?? model.chipOptions,
    sizes: variant?.sizes ?? model.sizes,
    colors: variant?.colorIds
      ? model.colors.filter((color) => variant.colorIds?.includes(color.id))
      : model.colors,
    memory: variant?.memory ?? model.memoryOptions,
    storage: variant?.storage ?? model.storageOptions,
  };
}

export function yearChoiceLabel(modelId: string, year: number): string {
  const chips = variantForYear(modelId, year)?.chips ?? getModelById(modelId)?.chipOptions ?? [];
  if (chips.length === 0) return String(year);
  if (chips.length <= 3) return `${year} · ${chips.join(" / ")}`;
  return `${year} · ${chips[0]} – ${chips[chips.length - 1]}`;
}

export function chipsForModel(model: ModelDefinition | undefined): string[] {
  if (!model) return [];
  const variants = VARIANTS[model.id];
  if (variants?.length) {
    const seen = new Set<string>();
    const chips: string[] = [];
    for (const variant of variants) {
      for (const chip of variant.chips ?? []) {
        if (!seen.has(chip)) {
          seen.add(chip);
          chips.push(chip);
        }
      }
    }
    return chips;
  }
  return model.chipOptions ?? [];
}

export function yearsForChip(model: ModelDefinition | undefined, chip?: string): number[] {
  if (!model?.years?.length) return [];
  const variants = VARIANTS[model.id];
  if (!variants?.length) {
    if (chip && model.chipOptions?.length && !model.chipOptions.includes(chip)) return [];
    return [...model.years];
  }
  if (!chip) return variants.map((variant) => variant.year);
  return variants.filter((variant) => variant.chips?.includes(chip)).map((variant) => variant.year);
}
