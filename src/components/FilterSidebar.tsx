"use client";

import { LegalNav } from "@/components/LegalNav";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import type { UserLocation } from "@/components/LocationPicker";
import { CATEGORIES, CONDITIONS, RADIUS_OPTIONS, getModelsByCategory } from "@/data/catalog";
import { formatPlaceLabel } from "@/data/locations";
import { ChevronIcon } from "@/components/icons";
import {
  BATTERY_CAPACITY_FILTERS,
  BATTERY_CYCLE_FILTERS,
  getBatteryMetricForCategory,
} from "@/lib/device";
import { KEYBOARD_LAYOUTS, hasBuiltInKeyboard } from "@/lib/keyboard";
import { SORT_OPTIONS } from "@/lib/format";
import type { CategoryId, ConditionId, KeyboardLayoutId, SortId } from "@/lib/types";
import { useMemo, useState, type ChangeEvent } from "react";

const fieldClass =
  "h-9 w-full rounded-lg border border-uf-border bg-uf-bg-subtle px-3 text-[13px] outline-none";
const selectClass =
  "uf-select h-9 w-auto min-w-[9.5rem] max-w-full rounded-lg border border-uf-border bg-uf-bg-subtle pl-3 text-[13px] outline-none";

function blurSelect(e: ChangeEvent<HTMLSelectElement>) {
  e.currentTarget.blur();
}

interface FilterSidebarProps {
  categoryId?: CategoryId;
  modelId?: string;
  sizes: string[];
  years: number[];
  colors: string[];
  memory: string[];
  storage: string[];
  keyboardLayouts: KeyboardLayoutId[];
  onToggleKeyboardLayout: (value: KeyboardLayoutId) => void;
  conditions: ConditionId[];
  warrantyOnly: boolean;
  minBatteryCapacity?: number;
  maxBatteryCycles?: number;
  onModelChange: (id?: string) => void;
  onCategoryChange?: (id?: CategoryId) => void;
  onToggleSize: (value: string) => void;
  onToggleYear: (value: number) => void;
  onToggleColor: (value: string) => void;
  onToggleMemory: (value: string) => void;
  onToggleStorage: (value: string) => void;
  onToggleCondition: (value: ConditionId) => void;
  onWarrantyOnlyChange: (value: boolean) => void;
  onMinBatteryCapacityChange: (value?: number) => void;
  onMaxBatteryCyclesChange: (value?: number) => void;
  location: UserLocation;
  onLocationChange: (next: UserLocation) => void;
  sortId: SortId;
  onSortChange: (id: SortId) => void;
  canSortByDistance: boolean;
  minPrice?: number;
  maxPrice?: number;
  onMinPriceChange: (value?: number) => void;
  onMaxPriceChange: (value?: number) => void;
  shipping?: "yes" | "no";
  onShippingChange: (value?: "yes" | "no") => void;
  originalBox?: "yes" | "no";
  onOriginalBoxChange: (value?: "yes" | "no") => void;
  hideLegal?: boolean;
  hideLocation?: boolean;
}

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-uf-border-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3.5 text-left text-[12px] tracking-wide text-uf-text-secondary uppercase"
      >
        <span>{title}</span>
        <ChevronIcon className="h-3 w-3 text-uf-text-tertiary" open={open} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  muted,
  title,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  muted?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={muted}
      onClick={onChange}
      className={`flex w-full items-center gap-2 py-1 text-left text-[13px] ${
        muted
          ? "cursor-not-allowed text-uf-text-tertiary"
          : checked
            ? "font-medium text-uf-text"
            : "text-uf-text hover:text-uf-link"
      }`}
    >
      <span
        className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border ${
          checked ? "border-uf-text bg-uf-text text-white" : "border-uf-border"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
            <path d="M2 5.2 4.2 7.4 8 3" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

function parseEuro(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function FilterSidebar(props: FilterSidebarProps) {
  const models = getModelsByCategory(props.categoryId);
  const activeModel = models.find((m) => m.id === props.modelId);

  const sizeOptions = useMemo(() => {
    if (activeModel?.sizes) return activeModel.sizes;
    return [...new Set(models.flatMap((m) => m.sizes ?? []))];
  }, [activeModel, models]);

  const yearOptions = useMemo(() => {
    if (activeModel?.years) return [...activeModel.years].sort((a, b) => b - a);
    return [...new Set(models.flatMap((m) => m.years ?? []))].sort((a, b) => b - a);
  }, [activeModel, models]);

  const colorOptions = useMemo(() => {
    if (activeModel) return activeModel.colors;
    const map = new Map<string, { id: string; label: string }>();
    models.forEach((m) => m.colors.forEach((c) => map.set(c.id, c)));
    return [...map.values()];
  }, [activeModel, models]);

  const memoryOptions = useMemo(() => {
    if (activeModel?.memoryOptions) return activeModel.memoryOptions;
    return [...new Set(models.flatMap((m) => m.memoryOptions ?? []))];
  }, [activeModel, models]);

  const storageOptions = useMemo(() => {
    if (activeModel?.storageOptions) return activeModel.storageOptions;
    return [...new Set(models.flatMap((m) => m.storageOptions ?? []))];
  }, [activeModel, models]);

  const batteryMetric = getBatteryMetricForCategory(props.categoryId, props.modelId);
  const showAllBatteryFilters = !props.categoryId && !props.modelId;
  const showCapacityFilter = batteryMetric === "capacity" || showAllBatteryFilters;
  const showCycleFilter = batteryMetric === "cycles" || showAllBatteryFilters;

  const groupedHomeModels = useMemo(() => {
    if (props.categoryId) return [];
    return CATEGORIES.map((category) => ({
      category,
      models: models.filter((m) => m.categoryId === category.id),
    })).filter((group) => group.models.length > 0);
  }, [models, props.categoryId]);

  const embedded = Boolean(props.hideLegal);

  return (
    <aside
      className={
        embedded
          ? "w-full"
          : "flex w-full shrink-0 flex-col lg:w-[220px]"
      }
    >
      <div>
      <div className={`${props.hideLocation ? "" : "hidden lg:block"} border-b border-uf-border-soft pb-4`}>
        <div className="pt-2 pb-3.5 text-[12px] tracking-wide text-uf-text-secondary uppercase">
          Sortierung
        </div>
        <label className="sr-only" htmlFor="uf-sort">
          Sortierung
        </label>
        <select
          id="uf-sort"
          value={props.sortId}
          onChange={(e) => {
            props.onSortChange(e.target.value as SortId);
            blurSelect(e);
          }}
          className={selectClass}
        >
          {SORT_OPTIONS.filter(option => !props.hideLocation || !option.needsLocation).map((option) => (
            <option
              key={option.id}
              value={option.id}
              disabled={option.needsLocation && !props.canSortByDistance}
            >
              {option.needsLocation && !props.canSortByDistance
                ? `${option.label} (Standort setzen)`
                : option.label}
            </option>
          ))}
        </select>
      </div>

      {!props.hideLocation && <Section title="Standort">
        <label className="block text-[12px] text-uf-text-tertiary">PLZ / Ort</label>
        <LocationAutocomplete
          className="mt-1.5"
          value={props.location.query}
          onChange={(q) =>
            props.onLocationChange({
              ...props.location,
              query: q,
              city: undefined,
              postalCode: undefined,
              place: undefined,
            })
          }
          onSelect={(place) =>
            props.onLocationChange({
              query: formatPlaceLabel(place),
              city: place.city,
              postalCode: place.postalCode,
              radiusKm: props.location.radiusKm,
              place,
            })
          }
          inputClassName={fieldClass}
          placeholder="z. B. München"
        />
        <label className="mt-3 block text-[12px] text-uf-text-tertiary">Umkreis (optional)</label>
        <select
          value={props.location.radiusKm ?? ""}
          onChange={(e) => {
            props.onLocationChange({
              ...props.location,
              radiusKm: e.target.value ? Number(e.target.value) : undefined,
            });
            blurSelect(e);
          }}
          className="uf-select mt-1.5 h-9 w-[5.25rem] rounded-lg border border-uf-border bg-uf-bg-subtle pl-2.5 text-[13px] outline-none"
        >
          <option value="">Keine</option>
          {RADIUS_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r} km
            </option>
          ))}
        </select>
      </Section>}

      <Section title="Preis">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
          <label className="sr-only" htmlFor="uf-price-min">
            Preis von
          </label>
          <input
            id="uf-price-min"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="von"
            value={props.minPrice ?? ""}
            onChange={(e) => props.onMinPriceChange(parseEuro(e.target.value))}
            className={fieldClass}
          />
          <span className="text-[13px] text-uf-text-tertiary">–</span>
          <label className="sr-only" htmlFor="uf-price-max">
            Preis bis
          </label>
          <input
            id="uf-price-max"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="bis"
            value={props.maxPrice ?? ""}
            onChange={(e) => props.onMaxPriceChange(parseEuro(e.target.value))}
            className={fieldClass}
          />
        </div>
      </Section>

      <Section title="Modelle">
        {props.categoryId ? (
          <ul>
            {models.map((model) => {
              const selected = props.modelId === model.id;
              return (
                <li key={model.id}>
                  <button
                    type="button"
                    disabled={model.disabled}
                    onClick={() =>
                      props.onModelChange(selected ? undefined : model.id)
                    }
                    className={`block w-full py-1 text-left text-[13px] ${
                      model.disabled
                        ? "cursor-not-allowed text-uf-text-tertiary"
                        : selected
                          ? "font-medium text-uf-text"
                          : "text-uf-text hover:text-uf-link"
                    }`}
                  >
                    {model.name}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="pb-3">
            {groupedHomeModels.map((group) => (
              <div key={group.category.id} className="mb-3 last:mb-0">
                <button
                  type="button"
                  onClick={() => props.onCategoryChange?.(group.category.id)}
                  className="block pb-1 text-left text-[11px] text-uf-text-tertiary hover:text-uf-text"
                >
                  {group.category.label}
                </button>
                <ul>
                  {group.models.map((model) => (
                    <li key={model.id}>
                      <button
                        type="button"
                        disabled={model.disabled}
                        onClick={() => props.onModelChange(model.id)}
                        className={`block w-full py-1 text-left text-[13px] ${
                          model.disabled
                            ? "cursor-not-allowed text-uf-text-tertiary"
                            : "text-uf-text hover:text-uf-link"
                        }`}
                      >
                        {model.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Section>

      {props.categoryId && sizeOptions.length > 0 && (
        <Section title="Größen">
          {sizeOptions.map((size) => (
            <CheckRow
              key={size}
              label={size}
              checked={props.sizes.includes(size)}
              onChange={() => props.onToggleSize(size)}
            />
          ))}
        </Section>
      )}

      {props.categoryId && yearOptions.length > 0 && (
        <Section title="Veröffentlicht">
          {yearOptions.map((year) => (
            <CheckRow
              key={year}
              label={String(year)}
              checked={props.years.includes(year)}
              onChange={() => props.onToggleYear(year)}
            />
          ))}
        </Section>
      )}

      {props.categoryId && colorOptions.length > 0 && (
        <Section title="Farbe">
          {colorOptions.map((color) => (
            <CheckRow
              key={color.id}
              label={color.label}
              checked={props.colors.includes(color.id)}
              onChange={() => props.onToggleColor(color.id)}
            />
          ))}
        </Section>
      )}

      {(!props.categoryId || props.categoryId === "mac") && (!props.modelId || hasBuiltInKeyboard(props.modelId)) && (
        <Section title="Tastaturlayout">
          {KEYBOARD_LAYOUTS.map((item) => (
            <CheckRow key={item.id} label={item.shortLabel} title={item.label}
              checked={props.keyboardLayouts.includes(item.id)}
              onChange={() => props.onToggleKeyboardLayout(item.id)} />
          ))}
        </Section>
      )}

      {props.categoryId && memoryOptions.length > 0 && (
        <Section title="Arbeitsspeicher">
          {memoryOptions.map((mem) => (
            <CheckRow
              key={mem}
              label={mem}
              checked={props.memory.includes(mem)}
              onChange={() => props.onToggleMemory(mem)}
            />
          ))}
        </Section>
      )}

      {props.categoryId && storageOptions.length > 0 && (
        <Section title="Kapazität">
          {storageOptions.map((storage) => (
            <CheckRow
              key={storage}
              label={storage}
              checked={props.storage.includes(storage)}
              onChange={() => props.onToggleStorage(storage)}
            />
          ))}
        </Section>
      )}

      <Section title="Zustand">
        {CONDITIONS.map((condition) => (
          <CheckRow
            key={condition.id}
            label={condition.label}
            checked={props.conditions.includes(condition.id)}
            onChange={() => props.onToggleCondition(condition.id)}
          />
        ))}
      </Section>

      <Section title="Originalverpackung">
        <CheckRow
          label="Nur mit Originalverpackung"
          checked={props.originalBox === "yes"}
          onChange={() =>
            props.onOriginalBoxChange(props.originalBox === "yes" ? undefined : "yes")
          }
        />
      </Section>

      <Section title="Garantie">
        <CheckRow
          label="Nur mit gültiger Garantie"
          checked={props.warrantyOnly}
          onChange={() => props.onWarrantyOnlyChange(!props.warrantyOnly)}
        />
      </Section>

      {showAllBatteryFilters ? (
        <Section title="Batterie">
          <p className="pb-1.5 text-[12px] text-uf-text-secondary">Kapazität</p>
          {BATTERY_CAPACITY_FILTERS.map((min) => (
            <CheckRow
              key={min}
              label={`Mind. ${min} %`}
              checked={props.minBatteryCapacity === min}
              onChange={() =>
                props.onMinBatteryCapacityChange(
                  props.minBatteryCapacity === min ? undefined : min,
                )
              }
            />
          ))}
          <p className="mt-3 pb-1.5 text-[12px] text-uf-text-secondary">Ladezyklen</p>
          {BATTERY_CYCLE_FILTERS.map((max) => (
            <CheckRow
              key={max}
              label={`Max. ${max} Zyklen`}
              checked={props.maxBatteryCycles === max}
              onChange={() =>
                props.onMaxBatteryCyclesChange(
                  props.maxBatteryCycles === max ? undefined : max,
                )
              }
            />
          ))}
        </Section>
      ) : (
        <>
          {showCapacityFilter && (
            <Section title="Batteriezustand">
              {BATTERY_CAPACITY_FILTERS.map((min) => (
                <CheckRow
                  key={min}
                  label={`Mind. ${min} % Kapazität`}
                  checked={props.minBatteryCapacity === min}
                  onChange={() =>
                    props.onMinBatteryCapacityChange(
                      props.minBatteryCapacity === min ? undefined : min,
                    )
                  }
                />
              ))}
            </Section>
          )}
          {showCycleFilter && (
            <Section title="Batteriezustand">
              {BATTERY_CYCLE_FILTERS.map((max) => (
                <CheckRow
                  key={max}
                  label={`Max. ${max} Ladezyklen`}
                  checked={props.maxBatteryCycles === max}
                  onChange={() =>
                    props.onMaxBatteryCyclesChange(
                      props.maxBatteryCycles === max ? undefined : max,
                    )
                  }
                />
              ))}
            </Section>
          )}
        </>
      )}

      <Section title="Versand">
        <CheckRow
          label="Versand möglich"
          checked={props.shipping === "yes"}
          onChange={() => props.onShippingChange(props.shipping === "yes" ? undefined : "yes")}
        />
      </Section>
      </div>
      {!props.hideLegal && (
        <div className="shrink-0">
          <LegalNav />
        </div>
      )}
    </aside>
  );
}
