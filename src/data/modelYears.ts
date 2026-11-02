import { getModelById } from "@/data/catalog";
import type { ModelDefinition } from "@/lib/types";

export interface SpecSlice {
  chips?: string[];
  sizes?: string[];
  storage?: string[];
  memory?: string[];
  colorIds?: string[];
}

export interface YearVariant {
  year: number;
  chips?: string[];
  sizes?: string[];
  colorIds?: string[];
  memory?: string[];
  storage?: string[];
  /** RAM and storage that only exist for a chip, size, or storage tier. */
  specs?: SpecSlice[];
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
      year: 2015,
      chips: ["Intel Core i5", "Intel Core i7"],
      sizes: ['11"', '13"'],
      colorIds: intelAirColors,
      memory: ["4 GB", "8 GB"],
      storage: ["128 GB", "256 GB", "512 GB"],
    },
    {
      year: 2017,
      chips: ["Intel Core i5", "Intel Core i7"],
      sizes: ['13"'],
      colorIds: intelAirColors,
      memory: ["8 GB"],
      storage: ["128 GB", "256 GB", "512 GB"],
    },
    {
      year: 2018,
      chips: ["Intel Core i5"],
      sizes: ['13"'],
      colorIds: intelAirColors,
      memory: ["8 GB", "16 GB"],
      storage: ["128 GB", "256 GB", "512 GB", "1,5 TB"],
    },
    {
      year: 2019,
      chips: ["Intel Core i5"],
      sizes: ['13"'],
      colorIds: intelAirColors,
      memory: ["8 GB", "16 GB"],
      storage: ["128 GB", "256 GB", "512 GB", "1 TB"],
    },
    {
      year: 2020,
      chips: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "M1"],
      sizes: ['13"'],
      colorIds: intelAirColors,
      memory: ["8 GB", "16 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2022,
      chips: ["M2"],
      sizes: ['13"'],
      colorIds: siliconAirColors,
      memory: ["8 GB", "16 GB", "24 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2023,
      chips: ["M2"],
      sizes: ['13"', '15"'],
      colorIds: siliconAirColors,
      memory: ["8 GB", "16 GB", "24 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2024,
      chips: ["M3"],
      sizes: ['13"', '15"'],
      colorIds: siliconAirColors,
      memory: ["8 GB", "16 GB", "24 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2025,
      chips: ["M4"],
      sizes: ['13"', '15"'],
      colorIds: [...siliconAirColors, "himmelblau"],
      memory: ["16 GB", "24 GB", "32 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2026,
      chips: ["M5"],
      sizes: ['13"', '15"'],
      colorIds: [...siliconAirColors, "himmelblau"],
      memory: ["16 GB", "24 GB", "32 GB"],
      storage: ["512 GB", "1 TB", "2 TB", "4 TB"],
    },
  ],
  "macbook-pro": [
    {
      year: 2015,
      chips: ["Intel Core i5", "Intel Core i7"],
      sizes: ['13"', '15"'],
      colorIds: mbpClassic,
      memory: ["8 GB", "16 GB"],
      storage: ["128 GB", "256 GB", "512 GB", "1 TB"],
    },
    {
      year: 2016,
      chips: ["Intel Core i5", "Intel Core i7"],
      sizes: ['13"', '15"'],
      colorIds: mbpClassic,
      memory: ["8 GB", "16 GB"],
      storage: ["256 GB", "512 GB", "1 TB"],
    },
    {
      year: 2017,
      chips: ["Intel Core i5", "Intel Core i7"],
      sizes: ['13"', '15"'],
      colorIds: mbpClassic,
      memory: ["8 GB", "16 GB"],
      storage: ["128 GB", "256 GB", "512 GB", "1 TB"],
    },
    {
      year: 2018,
      chips: ["Intel Core i5", "Intel Core i7", "Intel Core i9"],
      sizes: ['13"', '15"'],
      colorIds: mbpClassic,
      memory: ["8 GB", "16 GB", "32 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB", "4 TB"],
    },
    {
      year: 2019,
      chips: ["Intel Core i5", "Intel Core i7", "Intel Core i9"],
      sizes: ['13"', '15"', '16"'],
      colorIds: mbpClassic,
      memory: ["8 GB", "16 GB", "32 GB"],
      storage: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
      specs: [
        { sizes: ['13"'], memory: ["8 GB", "16 GB", "32 GB"], storage: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "4 TB"] },
        { sizes: ['15"'], memory: ["16 GB", "32 GB"], storage: ["256 GB", "512 GB", "1 TB", "2 TB", "4 TB"] },
        { sizes: ['16"'], memory: ["16 GB", "32 GB", "64 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
      ],
    },
    {
      year: 2020,
      chips: ["Intel Core i5", "Intel Core i7", "M1"],
      sizes: ['13"'],
      colorIds: mbpClassic,
      memory: ["8 GB", "16 GB", "32 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB", "4 TB"],
      specs: [
        { chips: ["Intel Core i5", "Intel Core i7"], memory: ["8 GB", "16 GB", "32 GB"], storage: ["256 GB", "512 GB", "1 TB", "2 TB", "4 TB"] },
        { chips: ["M1"], memory: ["8 GB", "16 GB"], storage: ["256 GB", "512 GB", "1 TB", "2 TB"] },
      ],
    },
    {
      year: 2021,
      chips: ["M1 Pro", "M1 Max"],
      sizes: ['14"', '16"'],
      colorIds: mbpClassic,
      memory: ["16 GB", "32 GB", "64 GB"],
      storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
      specs: [
        { chips: ["M1 Pro"], memory: ["16 GB", "32 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
        { chips: ["M1 Max"], memory: ["32 GB", "64 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
      ],
    },
    {
      year: 2022,
      chips: ["M2"],
      sizes: ['13"'],
      colorIds: mbpClassic,
      memory: ["8 GB", "16 GB", "24 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2023,
      chips: ["M2 Pro", "M2 Max", "M3", "M3 Pro", "M3 Max"],
      sizes: ['14"', '16"'],
      colorIds: [...mbpClassic, "space-schwarz"],
      memory: ["8 GB", "16 GB", "18 GB", "32 GB", "36 GB", "48 GB", "64 GB", "96 GB", "128 GB"],
      storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
      specs: [
        { chips: ["M2 Pro"], memory: ["16 GB", "32 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
        { chips: ["M2 Max"], memory: ["32 GB", "64 GB", "96 GB"], storage: ["1 TB", "2 TB", "4 TB", "8 TB"] },
        { chips: ["M3"], sizes: ['14"'], memory: ["8 GB", "16 GB", "24 GB"], storage: ["512 GB", "1 TB", "2 TB"] },
        { chips: ["M3 Pro"], memory: ["18 GB", "36 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB"] },
        { chips: ["M3 Max"], memory: ["36 GB", "48 GB", "64 GB", "96 GB", "128 GB"], storage: ["1 TB", "2 TB", "4 TB", "8 TB"] },
      ],
    },
    {
      year: 2024,
      chips: ["M4", "M4 Pro", "M4 Max"],
      sizes: ['14"', '16"'],
      colorIds: mbpRecent,
      memory: ["16 GB", "24 GB", "32 GB", "36 GB", "48 GB", "64 GB", "128 GB"],
      storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
      specs: [
        { chips: ["M4"], sizes: ['14"'], memory: ["16 GB", "24 GB", "32 GB"], storage: ["512 GB", "1 TB", "2 TB"] },
        { chips: ["M4 Pro"], memory: ["24 GB", "48 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB"] },
        { chips: ["M4 Max"], memory: ["36 GB", "48 GB", "64 GB", "128 GB"], storage: ["1 TB", "2 TB", "4 TB", "8 TB"] },
      ],
    },
    {
      year: 2025,
      chips: ["M4", "M4 Pro", "M4 Max"],
      sizes: ['14"', '16"'],
      colorIds: mbpRecent,
      memory: ["16 GB", "24 GB", "32 GB", "36 GB", "48 GB", "64 GB", "128 GB"],
      storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
      specs: [
        { chips: ["M4"], sizes: ['14"'], memory: ["16 GB", "24 GB", "32 GB"], storage: ["512 GB", "1 TB", "2 TB"] },
        { chips: ["M4 Pro"], memory: ["24 GB", "48 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB"] },
        { chips: ["M4 Max"], memory: ["36 GB", "48 GB", "64 GB", "128 GB"], storage: ["1 TB", "2 TB", "4 TB", "8 TB"] },
      ],
    },
    {
      year: 2026,
      chips: ["M5", "M5 Pro", "M5 Max"],
      sizes: ['14"', '16"'],
      colorIds: mbpRecent,
      memory: ["16 GB", "24 GB", "32 GB", "36 GB", "48 GB", "64 GB", "128 GB"],
      storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
      specs: [
        { chips: ["M5"], sizes: ['14"'], memory: ["16 GB", "24 GB", "32 GB"], storage: ["512 GB", "1 TB", "2 TB"] },
        { chips: ["M5 Pro"], memory: ["24 GB", "48 GB", "64 GB"], storage: ["1 TB", "2 TB", "4 TB"] },
        { chips: ["M5 Max"], memory: ["36 GB", "48 GB", "64 GB", "128 GB"], storage: ["1 TB", "2 TB", "4 TB", "8 TB"] },
      ],
    },
  ],
  imac: [
    {
      year: 2015,
      chips: ["Intel Core i5", "Intel Core i7"],
      sizes: ['21,5"', '27"'],
      colorIds: ["silber"],
      memory: ["8 GB", "16 GB", "32 GB"],
      storage: ["256 GB", "512 GB", "1 TB"],
    },
    {
      year: 2017,
      chips: ["Intel Core i5", "Intel Core i7"],
      sizes: ['21,5"', '27"'],
      colorIds: ["silber"],
      memory: ["8 GB", "16 GB", "32 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2019,
      chips: ["Intel Core i3", "Intel Core i5", "Intel Core i7"],
      sizes: ['21,5"', '27"'],
      colorIds: ["silber"],
      memory: ["8 GB", "16 GB", "32 GB", "64 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2020,
      chips: ["Intel Core i5", "Intel Core i7", "Intel Core i9"],
      sizes: ['27"'],
      colorIds: ["silber"],
      memory: ["8 GB", "16 GB", "32 GB", "64 GB", "128 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
    },
    {
      year: 2021,
      chips: ["M1"],
      sizes: ['24"'],
      colorIds: imacSiliconColors,
      memory: ["8 GB", "16 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2023,
      chips: ["M3"],
      sizes: ['24"'],
      colorIds: imacSiliconColors,
      memory: ["8 GB", "16 GB", "24 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2024,
      chips: ["M4"],
      sizes: ['24"'],
      colorIds: imacSiliconColors,
      memory: ["16 GB", "24 GB", "32 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
  ],
  "mac-mini": [
    {
      year: 2014,
      chips: ["Intel Core i5", "Intel Core i7"],
      colorIds: ["silber"],
      memory: ["4 GB", "8 GB", "16 GB"],
      storage: ["256 GB", "512 GB", "1 TB"],
    },
    {
      year: 2018,
      chips: ["Intel Core i3", "Intel Core i5", "Intel Core i7"],
      colorIds: ["space-grau"],
      memory: ["8 GB", "16 GB", "32 GB", "64 GB"],
      storage: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2020,
      chips: ["M1"],
      colorIds: ["silber"],
      memory: ["8 GB", "16 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    },
    {
      year: 2023,
      chips: ["M2", "M2 Pro"],
      colorIds: ["silber"],
      memory: ["8 GB", "16 GB", "24 GB", "32 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
      specs: [
        { chips: ["M2"], memory: ["8 GB", "16 GB", "24 GB"], storage: ["256 GB", "512 GB", "1 TB", "2 TB"] },
        { chips: ["M2 Pro"], memory: ["16 GB", "32 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
      ],
    },
    {
      year: 2024,
      chips: ["M4", "M4 Pro"],
      colorIds: ["silber"],
      memory: ["16 GB", "24 GB", "32 GB", "48 GB", "64 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
      specs: [
        { chips: ["M4"], memory: ["16 GB", "24 GB", "32 GB"], storage: ["256 GB", "512 GB", "1 TB", "2 TB"] },
        { chips: ["M4 Pro"], memory: ["24 GB", "48 GB", "64 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
      ],
    },
    {
      year: 2026,
      chips: ["M6", "M5 Pro"],
      colorIds: ["silber"],
      memory: ["16 GB", "24 GB", "32 GB", "48 GB", "64 GB"],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
      specs: [
        { chips: ["M6"], memory: ["16 GB", "24 GB", "32 GB"], storage: ["256 GB", "512 GB", "1 TB", "2 TB"] },
        { chips: ["M5 Pro"], memory: ["24 GB", "48 GB", "64 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
      ],
    },
  ],
  "mac-studio": [
    {
      year: 2022,
      chips: ["M1 Max", "M1 Ultra"],
      memory: ["32 GB", "64 GB", "128 GB"],
      storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
      specs: [
        { chips: ["M1 Max"], memory: ["32 GB", "64 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
        { chips: ["M1 Ultra"], memory: ["64 GB", "128 GB"], storage: ["1 TB", "2 TB", "4 TB", "8 TB"] },
      ],
    },
    {
      year: 2023,
      chips: ["M2 Max", "M2 Ultra"],
      memory: ["32 GB", "64 GB", "96 GB", "128 GB", "192 GB"],
      storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
      specs: [
        { chips: ["M2 Max"], memory: ["32 GB", "64 GB", "96 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
        { chips: ["M2 Ultra"], memory: ["64 GB", "128 GB", "192 GB"], storage: ["1 TB", "2 TB", "4 TB", "8 TB"] },
      ],
    },
    {
      year: 2025,
      chips: ["M4 Max", "M3 Ultra"],
      memory: ["36 GB", "48 GB", "64 GB", "96 GB", "128 GB", "256 GB"],
      storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB", "16 TB"],
      specs: [
        { chips: ["M4 Max"], memory: ["36 GB", "48 GB", "64 GB", "128 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
        { chips: ["M3 Ultra"], memory: ["96 GB", "128 GB", "256 GB"], storage: ["1 TB", "2 TB", "4 TB", "8 TB", "16 TB"] },
      ],
    },
    {
      year: 2026,
      chips: ["M5 Max", "M5 Ultra"],
      memory: ["36 GB", "48 GB", "64 GB", "96 GB", "128 GB", "256 GB", "512 GB"],
      storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB", "16 TB"],
      specs: [
        { chips: ["M5 Max"], memory: ["36 GB", "48 GB", "64 GB", "128 GB"], storage: ["512 GB", "1 TB", "2 TB", "4 TB", "8 TB"] },
        { chips: ["M5 Ultra"], memory: ["96 GB", "128 GB", "256 GB", "512 GB"], storage: ["1 TB", "2 TB", "4 TB", "8 TB", "16 TB"] },
      ],
    },
  ],
  "mac-pro": [
    {
      year: 2013,
      chips: ["Intel Xeon"],
      memory: ["16 GB", "32 GB", "64 GB"],
      storage: ["256 GB", "512 GB", "1 TB"],
    },
    {
      year: 2019,
      chips: ["Intel Xeon W"],
      memory: ["32 GB", "48 GB", "64 GB", "96 GB", "128 GB", "192 GB", "384 GB", "768 GB", "1,5 TB"],
      storage: ["256 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
    },
    {
      year: 2023,
      chips: ["M2 Ultra"],
      memory: ["64 GB", "128 GB", "192 GB", "256 GB", "384 GB", "512 GB"],
      storage: ["1 TB", "2 TB", "4 TB", "8 TB"],
    },
  ],
  macbook: [
    {
      year: 2015,
      chips: ["Intel Core m3", "Intel Core m5", "Intel Core m7"],
      sizes: ['12"'],
      memory: ["8 GB"],
      storage: ["256 GB", "512 GB"],
    },
    {
      year: 2016,
      chips: ["Intel Core m3", "Intel Core m5", "Intel Core m7"],
      sizes: ['12"'],
      memory: ["8 GB"],
      storage: ["256 GB", "512 GB"],
    },
    {
      year: 2017,
      chips: ["Intel Core m3", "Intel Core i5"],
      sizes: ['12"'],
      memory: ["8 GB", "16 GB"],
      storage: ["256 GB", "512 GB"],
    },
  ],
  "imac-pro": [
    {
      year: 2017,
      chips: ["Intel Xeon W"],
      sizes: ['27"'],
      memory: ["32 GB", "64 GB", "128 GB", "256 GB"],
      storage: ["1 TB", "2 TB", "4 TB"],
    },
  ],
  "ipad-pro": [
    {
      year: 2018,
      chips: ["A12X"],
      sizes: ['11"', '12,9"'],
      storage: ["64 GB", "256 GB", "512 GB", "1 TB"],
      memory: ["4 GB", "6 GB"],
      specs: [
        { storage: ["64 GB", "256 GB", "512 GB"], memory: ["4 GB"] },
        { storage: ["1 TB"], memory: ["6 GB"] },
      ],
    },
    {
      year: 2020,
      chips: ["A12Z"],
      sizes: ['11"', '12,9"'],
      storage: ["128 GB", "256 GB", "512 GB", "1 TB"],
      memory: ["6 GB"],
    },
    {
      year: 2021,
      chips: ["M1"],
      sizes: ['11"', '12,9"'],
      storage: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
      memory: ["8 GB", "16 GB"],
      specs: [
        { storage: ["128 GB", "256 GB", "512 GB"], memory: ["8 GB"] },
        { storage: ["1 TB", "2 TB"], memory: ["16 GB"] },
      ],
    },
    {
      year: 2022,
      chips: ["M2"],
      sizes: ['11"', '13"'],
      storage: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
      memory: ["8 GB", "16 GB"],
      specs: [
        { storage: ["128 GB", "256 GB", "512 GB"], memory: ["8 GB"] },
        { storage: ["1 TB", "2 TB"], memory: ["16 GB"] },
      ],
    },
    {
      year: 2024,
      chips: ["M4"],
      sizes: ['11"', '13"'],
      storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
      memory: ["8 GB", "16 GB"],
      specs: [
        { storage: ["256 GB", "512 GB"], memory: ["8 GB"] },
        { storage: ["1 TB", "2 TB"], memory: ["16 GB"] },
      ],
    },
  ],
  "ipad-air": [
    {
      year: 2019,
      chips: ["A12"],
      sizes: ['10.5"'],
      colorIds: ["space-grau", "silber", "gold"],
      memory: ["3 GB"],
      storage: ["64 GB", "256 GB"],
    },
    {
      year: 2020,
      chips: ["A14"],
      sizes: ['10.9"'],
      colorIds: ["space-grau", "silber", "rosa", "gruen", "himmelblau"],
      memory: ["4 GB"],
      storage: ["64 GB", "256 GB"],
    },
    {
      year: 2022,
      chips: ["M1"],
      sizes: ['10.9"'],
      colorIds: ["space-grau", "rosa", "violett", "blau", "polarstern"],
      memory: ["8 GB"],
      storage: ["64 GB", "256 GB"],
    },
    {
      year: 2024,
      chips: ["M2"],
      sizes: ['11"', '13"'],
      colorIds: ["space-grau", "blau", "violett", "polarstern"],
      memory: ["8 GB"],
      storage: ["128 GB", "256 GB", "512 GB", "1 TB"],
    },
    {
      year: 2025,
      chips: ["M3"],
      sizes: ['11"', '13"'],
      colorIds: ["space-grau", "blau", "violett", "polarstern"],
      memory: ["8 GB"],
      storage: ["128 GB", "256 GB", "512 GB", "1 TB"],
    },
  ],
  ipad: [
    { year: 2018, chips: ["A10"], sizes: ['9,7"'], colorIds: ["space-grau", "silber", "gold"], memory: ["2 GB"], storage: ["32 GB", "128 GB"] },
    { year: 2019, chips: ["A10"], sizes: ['10,2"'], colorIds: ["space-grau", "silber", "gold"], memory: ["3 GB"], storage: ["32 GB", "128 GB"] },
    { year: 2020, chips: ["A12"], sizes: ['10,2"'], colorIds: ["space-grau", "silber", "gold"], memory: ["3 GB"], storage: ["32 GB", "128 GB"] },
    { year: 2021, chips: ["A13"], sizes: ['10,2"'], colorIds: ["space-grau", "silber"], memory: ["3 GB"], storage: ["64 GB", "256 GB"] },
    { year: 2022, chips: ["A14"], sizes: ['10.9"'], colorIds: ["blau", "rosa", "gelb", "silber"], memory: ["4 GB"], storage: ["64 GB", "256 GB"] },
    { year: 2025, chips: ["A16"], sizes: ['11"'], colorIds: ["blau", "rosa", "gelb", "silber"], memory: ["6 GB"], storage: ["128 GB", "256 GB", "512 GB"] },
  ],
  "ipad-mini": [
    { year: 2015, chips: ["A8"], sizes: ['7,9"'], colorIds: ["space-grau", "silber", "gold"], memory: ["2 GB"], storage: ["16 GB", "32 GB", "64 GB", "128 GB"] },
    { year: 2019, chips: ["A12"], sizes: ['7,9"'], colorIds: ["space-grau", "silber", "gold"], memory: ["3 GB"], storage: ["64 GB", "256 GB"] },
    { year: 2021, chips: ["A15"], sizes: ['8.3"'], colorIds: ["space-grau", "rosa", "violett", "polarstern"], memory: ["4 GB"], storage: ["64 GB", "256 GB"] },
    { year: 2024, chips: ["A17 Pro"], sizes: ['8.3"'], colorIds: ["space-grau", "rosa", "violett", "polarstern"], memory: ["8 GB"], storage: ["128 GB", "256 GB"] },
  ],
  "iphone-16-pro": [
    {
      year: 2024,
      chips: ["A18 Pro"],
      sizes: ['6,3"', '6,9"'],
      memory: ["8 GB"],
      storage: ["128 GB", "256 GB", "512 GB", "1 TB"],
      specs: [
        { sizes: ['6,3"'], storage: ["128 GB", "256 GB", "512 GB", "1 TB"] },
        { sizes: ['6,9"'], storage: ["256 GB", "512 GB", "1 TB"] },
      ],
    },
  ],
};

export function variantForYear(modelId: string, year?: number): YearVariant | undefined {
  if (year == null) return undefined;
  return VARIANTS[modelId]?.find((item) => item.year === year);
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
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

export function optionsForSelection(
  model: ModelDefinition | undefined,
  year?: number,
  chip?: string,
  size?: string,
  storage?: string,
) {
  const base = optionsForYear(model, year);
  const specs = variantForYear(model?.id ?? "", year)?.specs;
  if (!specs?.length) return base;

  let pool = specs;
  if (chip) {
    const specific = specs.filter((spec) => spec.chips?.includes(chip));
    if (specific.length) pool = specific;
  }
  if (size) {
    const specific = pool.filter((spec) => spec.sizes?.includes(size));
    if (specific.length) pool = specific;
  }
  if (storage) {
    const specific = pool.filter((spec) => spec.storage?.includes(storage));
    if (specific.length) pool = specific;
  }

  const pick = (key: "memory" | "storage" | "sizes", fallback?: string[]) => {
    const values = unique(pool.flatMap((spec) => spec[key] ?? []));
    return values.length ? values : fallback;
  };
  const colorIds = unique(pool.flatMap((spec) => spec.colorIds ?? []));
  return {
    ...base,
    sizes: pick("sizes", base.sizes),
    memory: pick("memory", base.memory),
    storage: pick("storage", base.storage),
    colors: colorIds.length ? base.colors.filter((color) => colorIds.includes(color.id)) : base.colors,
  };
}

const CURRENT_CHIPS: Record<string, string[]> = {
  "macbook-air": ["M5", "M4"],
  "macbook-pro": ["M5", "M5 Pro", "M5 Max", "M4", "M4 Pro", "M4 Max"],
  imac: ["M4"],
  "mac-mini": ["M6", "M5 Pro"],
  "mac-studio": ["M5 Max", "M5 Ultra"],
  "mac-pro": ["M2 Ultra"],
  "ipad-pro": ["M4"],
  "ipad-air": ["M3"],
  ipad: ["A16"],
  "ipad-mini": ["A17 Pro"],
};

export function currentChipsForModel(model: ModelDefinition | undefined): string[] | undefined {
  if (!model) return undefined;
  const listed = CURRENT_CHIPS[model.id];
  if (!listed) return undefined;
  const available = chipsForModel(model);
  const current = listed.filter((chip) => available.includes(chip));
  if (!current.length || current.length === available.length) return undefined;
  return current;
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
