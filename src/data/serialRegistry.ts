import { MODELS, getModelById } from "@/data/catalog";
import type { CategoryId } from "@/lib/types";

export interface SerialRecord {
  modelId: string;
  colorId: string;
  chip?: string;
  size?: string;
  year?: number;
  memory?: string;
  storage?: string;
}

export function normalizeSerial(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isPlausibleAppleSerial(value: string): boolean {
  const serial = normalizeSerial(value);
  return serial.length >= 8 && serial.length <= 14;
}

function recordFromModel(
  modelId: string,
  overrides: Partial<SerialRecord> = {},
): SerialRecord | undefined {
  const model = getModelById(modelId);
  if (!model || model.disabled) return undefined;
  return {
    modelId: model.id,
    colorId: overrides.colorId ?? model.colors[0].id,
    chip: overrides.chip ?? model.chipOptions?.[0],
    size: overrides.size ?? model.sizes?.[0],
    year: overrides.year ?? model.years?.[0],
    memory: overrides.memory ?? model.memoryOptions?.[0],
    storage: overrides.storage ?? model.storageOptions?.[0],
  };
}

const KNOWN: { serial: string; modelId: string; extra?: Partial<SerialRecord> }[] = [
  { serial: "G7YQ2XH91L", modelId: "iphone-16-pro", extra: { colorId: "natural", storage: "256 GB", size: '6,3"' } },
  { serial: "H3K9P2LM4Q", modelId: "iphone-16-pro", extra: { colorId: "schwarz-ti", storage: "512 GB", size: '6,9"' } },
  { serial: "F2K8M1QP4C", modelId: "iphone-16", extra: { colorId: "ultramarine", storage: "128 GB" } },
  { serial: "J8N4R0TW2B", modelId: "iphone-15", extra: { colorId: "blau", storage: "256 GB" } },
  { serial: "D5C1V7XA9M", modelId: "iphone-14", extra: { colorId: "mitternacht", storage: "128 GB" } },
  { serial: "S3E6B8YH2P", modelId: "iphone-se", extra: { colorId: "polarstern", storage: "128 GB" } },
  { serial: "C02YL0XGJ1", modelId: "macbook-air", extra: { colorId: "mitternacht", storage: "512 GB", year: 2024, chip: "M3", memory: "16 GB", size: '13"' } },
  { serial: "C02YK8HNQ6", modelId: "macbook-pro", extra: { colorId: "space-schwarz", storage: "1 TB", year: 2024, chip: "M4 Pro", memory: "24 GB", size: '14"' } },
  { serial: "FVFH2X9Q0D", modelId: "macbook-neo", extra: { colorId: "silber", storage: "256 GB", year: 2025, memory: "16 GB", size: '13"' } },
  { serial: "FVFK4P1R8L", modelId: "macbook-neo", extra: { colorId: "indigo", storage: "512 GB", year: 2026, memory: "24 GB", size: '15"' } },
  { serial: "IMAC24M4K2", modelId: "imac", extra: { colorId: "blau", storage: "512 GB", year: 2024, chip: "M4", memory: "16 GB" } },
  { serial: "MM4N256S01", modelId: "mac-mini", extra: { colorId: "silber", storage: "256 GB", year: 2024, chip: "M4", memory: "16 GB" } },
  { serial: "MS25MAX1TB", modelId: "mac-studio", extra: { storage: "1 TB", year: 2025, chip: "M4 Max", memory: "64 GB" } },
  { serial: "IPADPRO11M", modelId: "ipad-pro", extra: { colorId: "space-schwarz", storage: "256 GB", size: '11"', year: 2024, chip: "M4" } },
  { serial: "IPADAIR13B", modelId: "ipad-air", extra: { colorId: "blau", storage: "256 GB", size: '13"', year: 2024 } },
  { serial: "IPAD11A160", modelId: "ipad", extra: { colorId: "gelb", storage: "128 GB", year: 2025 } },
  { serial: "IPADMINI24", modelId: "ipad-mini", extra: { colorId: "violett", storage: "256 GB", year: 2024 } },
];

const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function serialForIndex(index: number): string {
  let n = index * 7919 + 104729;
  let out = "";
  for (let i = 0; i < 10; i += 1) {
    out += ALPH[n % ALPH.length];
    n = Math.floor(n / 7) + (i + 3) * 97;
  }
  return out;
}

function buildRegistry(): Map<string, SerialRecord> {
  const map = new Map<string, SerialRecord>();
  MODELS.filter((model) => !model.disabled).forEach((model, index) => {
    const record = recordFromModel(model.id);
    if (record) map.set(serialForIndex(index), record);
  });
  for (const entry of KNOWN) {
    const record = recordFromModel(entry.modelId, entry.extra);
    if (record) map.set(normalizeSerial(entry.serial), record);
  }
  return map;
}

const REGISTRY = buildRegistry();

export function lookupSerial(value: string): SerialRecord | undefined {
  const key = normalizeSerial(value);
  if (!key) return undefined;
  return REGISTRY.get(key);
}

export function serialCategory(record: SerialRecord): CategoryId | undefined {
  return getModelById(record.modelId)?.categoryId;
}
