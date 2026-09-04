import { getModelById } from "@/data/catalog";
import { chipsForModel, optionsForYear, yearsForChip } from "@/data/modelYears";
import { getBatteryMetricForModel } from "@/lib/device";
import type { ModelDefinition } from "@/lib/types";

export type WizardStep =
  | "category"
  | "model"
  | "chip"
  | "color"
  | "size"
  | "year"
  | "memory"
  | "storage"
  | "connectivity"
  | "condition"
  | "packaging"
  | "warranty"
  | "battery"
  | "price"
  | "location"
  | "shipping";

function onlyChoice<T>(items?: readonly T[]): T | undefined {
  return items?.length === 1 ? items[0] : undefined;
}

export function soleSpecValues(
  model: ModelDefinition | undefined,
  year?: number,
  chip?: string,
) {
  if (!model) return {};
  const chips = chipsForModel(model);
  const resolvedChip = chip || onlyChoice(chips);
  const years = yearsForChip(model, resolvedChip);
  const resolvedYear = year ?? onlyChoice(years);
  const options = optionsForYear(model, resolvedYear);
  return {
    chip: onlyChoice(chips),
    colorId: onlyChoice(options.colors)?.id,
    size: onlyChoice(options.sizes),
    year: onlyChoice(years),
    memory: onlyChoice(options.memory),
    storage: onlyChoice(options.storage),
  };
}

function needsChoice<T>(items: readonly T[] | undefined) {
  return (items?.length ?? 0) > 1;
}

export function buildWizardSteps(
  modelId: string | undefined,
  year?: number,
  chip?: string,
): WizardStep[] {
  const steps: WizardStep[] = ["category", "model"];
  const model = modelId ? getModelById(modelId) : undefined;
  const chips = chipsForModel(model);
  if (needsChoice(chips)) steps.push("chip");

  const resolvedChip = chip || onlyChoice(chips);
  const years = yearsForChip(model, resolvedChip);
  if (resolvedChip && needsChoice(years)) steps.push("year");

  const resolvedYear = year ?? onlyChoice(years);
  const ready = Boolean(model && (resolvedYear != null || !model.years?.length));
  const options = ready ? optionsForYear(model, resolvedYear) : undefined;
  if (needsChoice(options?.colors)) steps.push("color");
  if (needsChoice(options?.sizes)) steps.push("size");
  if (needsChoice(options?.memory)) steps.push("memory");
  if (needsChoice(options?.storage)) steps.push("storage");
  if (model?.categoryId === "ipad") steps.push("connectivity");

  steps.push("condition", "packaging", "warranty");
  if (modelId && getBatteryMetricForModel(modelId)) steps.push("battery");
  steps.push("price", "location", "shipping");
  return steps;
}

export const STEP_COPY: Record<
  WizardStep,
  { title: string; subtitle: string; tip?: string }
> = {
  category: {
    title: "Kategorie",
    subtitle: "Um welches Apple-Gerät handelt es sich?",
  },
  model: {
    title: "Modell",
    subtitle: "Prüfe das Gerätemodell.",
    tip: "Einstellungen → Allgemein → Info → Modellname",
  },
  chip: {
    title: "Chip",
    subtitle: "Welcher Chip ist verbaut?",
    tip: "Einstellungen → Allgemein → Info",
  },
  color: {
    title: "Farbe",
    subtitle: "Welche Farbe hat das Gerät?",
  },
  size: {
    title: "Größe",
    subtitle: "Welche Bildschirm- oder Gehäusegröße hat das Gerät?",
  },
  year: {
    title: "Erscheinungsjahr",
    subtitle: "Diesen Chip gab es in mehreren Jahren. Welches Gerät hast du?",
    tip: "Einstellungen → Allgemein → Info, oder auf der Unterseite des Geräts.",
  },
  memory: {
    title: "Arbeitsspeicher",
    subtitle: "Wie viel Arbeitsspeicher hat das Gerät?",
    tip: "Einstellungen → Allgemein → Info",
  },
  storage: {
    title: "Speicherkapazität",
    subtitle: "Prüfe die Speichergröße des Geräts.",
    tip: "Einstellungen → Allgemein → Info",
  },
  connectivity: {
    title: "Verbindung",
    subtitle: "Hat das iPad nur WLAN oder auch Cellular?",
    tip: "Einstellungen → Allgemein → Info — oder auf der Rückseite: Cellular-Modelle haben eine SIM-/eSIM-Angabe.",
  },
  condition: {
    title: "Zustand",
    subtitle: "Wähle den Zustand. Die Erklärung steht direkt unter jeder Kachel.",
  },
  packaging: {
    title: "Originalverpackung",
    subtitle: "Ist die Originalverpackung noch vorhanden?",
  },
  warranty: {
    title: "Garantie",
    subtitle: "Hat das Gerät noch eine gültige Apple-Garantie oder AppleCare+?",
  },
  battery: {
    title: "Batterie",
    subtitle: "Wie steht es um den Akku?",
  },
  price: {
    title: "Preis",
    subtitle: "Zu welchem Preis möchtest du das Gerät anbieten?",
  },
  location: {
    title: "Standort",
    subtitle: "PLZ oder Stadt wählen, danach den Ortsteil eingrenzen.",
  },
  shipping: {
    title: "Versand",
    subtitle: "Nur Abholung oder auch Versand innerhalb Deutschlands?",
  },
};

export const BATTERY_GUIDES = {
  capacity: {
    title: "So findest du den Wert auf iPhone oder iPad",
    steps: [
      "Einstellungen öffnen",
      "Batterie",
      "Batteriezustand — auf iPhone 14 und älter: Batteriezustand & Ladevorgang",
      "Maximale Kapazität ablesen",
    ],
  },
  cycles: {
    title: "So findest du die Zyklen auf dem Mac",
    steps: [
      "Apple-Menü  → Über diesen Mac",
      "Mehr Infos → Systembericht",
      "In der Seitenleiste Stromversorgung",
      "Zyklenanzahl ablesen",
    ],
  },
} as const;
