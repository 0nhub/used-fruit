import { getAppleIdentity } from "@/data/appleIdentity";
import { MODELS } from "@/data/catalog";
import { getHardwareSpecs } from "@/data/hardware";
import type { CategoryId, Listing } from "@/lib/types";

export type CatalogModelRow = {
  model_id: string;
  size: string;
  name: string;
  category_id: CategoryId;
  apple_model: string;
  identifier: string;
  colors: string;
  storage_options: string;
  memory_options: string;
  chip_options: string;
  years: string;
  specs: string;
};

function dummyListing(modelId: string, categoryId: CategoryId, size?: string): Listing {
  return {
    id: `seed-${modelId}-${size ?? "default"}`,
    categoryId,
    modelId,
    title: "",
    colorId: "",
    condition: "sehr-gut",
    price: 0,
    city: "",
    postalCode: "",
    radiusKm: 0,
    shippingScope: "local",
    createdAt: "",
    sellerName: "",
    size,
    chip: undefined,
  };
}

export function buildCatalogModelRows(): CatalogModelRow[] {
  const rows: CatalogModelRow[] = [];

  for (const model of MODELS) {
    if (model.disabled) continue;
    const sizes = model.sizes?.length ? model.sizes : [""];
    for (const size of sizes) {
      const identity = getAppleIdentity(model.id, size || undefined);
      const specs = getHardwareSpecs(dummyListing(model.id, model.categoryId, size || undefined))
        .filter((row) => row.label !== "Identifier" && row.label !== "Apple-Modell")
        .map((row) => `${row.label}: ${row.value}`)
        .join("\n");

      rows.push({
        model_id: model.id,
        size,
        name: model.name,
        category_id: model.categoryId,
        apple_model: identity?.appleModel ?? "",
        identifier: identity?.identifier ?? "",
        colors: model.colors.map((color) => color.id).join(", "),
        storage_options: (model.storageOptions ?? []).join(", "),
        memory_options: (model.memoryOptions ?? []).join(", "),
        chip_options: (model.chipOptions ?? []).join(", "),
        years: (model.years ?? []).join(", "),
        specs,
      });
    }
  }

  return rows;
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function catalogModelsCsv() {
  const header = [
    "model_id",
    "size",
    "name",
    "category_id",
    "apple_model",
    "identifier",
    "colors",
    "storage_options",
    "memory_options",
    "chip_options",
    "years",
    "specs",
  ];
  const lines = [header.join(",")];
  for (const row of buildCatalogModelRows()) {
    lines.push(header.map((key) => csvEscape(row[key as keyof CatalogModelRow])).join(","));
  }
  return `${lines.join("\n")}\n`;
}
