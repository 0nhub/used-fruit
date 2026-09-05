"use client";

import { parseCategoryParam } from "@/components/CategoryNav";
import { getModelById } from "@/data/catalog";
import { filterListings, sortListings } from "@/lib/format";
import { useUserLocation } from "@/lib/useUserLocation";
import type { CategoryId, ConditionId, KeyboardLayoutId, Listing, SortId } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const filterSnapshots = new Map<string, Record<string, unknown>>();

export function useCatalogFilters(listings: Listing[], { ignoreLocation = false }: { ignoreLocation?: boolean } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const snapshotKey = pathname + "?" + searchParams.toString();
  const saved = filterSnapshots.get(snapshotKey);
  const urlCategory = parseCategoryParam(searchParams.get("kategorie"));
  const urlCategoryRef = useRef(urlCategory);
  const [categoryId, setCategoryId] = useState<CategoryId | undefined>(urlCategory);
  const [modelId, setModelId] = useState<string | undefined>(() => saved && "modelId" in saved ? saved.modelId as string | undefined : undefined);
  const [sizes, setSizes] = useState<string[]>(() => saved && "sizes" in saved ? saved.sizes as string[] : []);
  const [years, setYears] = useState<number[]>(() => saved && "years" in saved ? saved.years as number[] : []);
  const [colors, setColors] = useState<string[]>(() => saved && "colors" in saved ? saved.colors as string[] : []);
  const [memory, setMemory] = useState<string[]>(() => saved && "memory" in saved ? saved.memory as string[] : []);
  const [keyboardLayouts, setKeyboardLayouts] = useState<KeyboardLayoutId[]>(() => saved && "keyboardLayouts" in saved ? saved.keyboardLayouts as KeyboardLayoutId[] : []);
  const [storage, setStorage] = useState<string[]>(() => saved && "storage" in saved ? saved.storage as string[] : []);
  const [conditions, setConditions] = useState<ConditionId[]>(() => saved && "conditions" in saved ? saved.conditions as ConditionId[] : []);
  const [warrantyOnly, setWarrantyOnly] = useState<boolean>(() => saved && "warrantyOnly" in saved ? saved.warrantyOnly as boolean : false);
  const [minBatteryCapacity, setMinBatteryCapacity] = useState<number | undefined>(() => saved && "minBatteryCapacity" in saved ? saved.minBatteryCapacity as number | undefined : undefined);
  const [maxBatteryCycles, setMaxBatteryCycles] = useState<number | undefined>(() => saved && "maxBatteryCycles" in saved ? saved.maxBatteryCycles as number | undefined : undefined);
  const [sortId, setSortId] = useState<SortId>(() => saved && "sortId" in saved ? saved.sortId as SortId : "newest");
  const [minPrice, setMinPrice] = useState<number | undefined>(() => saved && "minPrice" in saved ? saved.minPrice as number | undefined : undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(() => saved && "maxPrice" in saved ? saved.maxPrice as number | undefined : undefined);
  const [shipping, setShipping] = useState<"yes" | "no" | undefined>(() => saved && "shipping" in saved ? saved.shipping as "yes" | "no" | undefined : undefined);
  const [originalBox, setOriginalBox] = useState<"yes" | "no" | undefined>(() => saved && "originalBox" in saved ? saved.originalBox as "yes" | "no" | undefined : undefined);
  const { location, setLocation, userPlace } = useUserLocation();

  useEffect(() => {
    filterSnapshots.set(snapshotKey, { modelId, sizes, years, colors, memory, keyboardLayouts, storage, conditions, warrantyOnly, minBatteryCapacity, maxBatteryCycles, sortId, minPrice, maxPrice, shipping, originalBox });
  }, [snapshotKey, modelId, sizes, years, colors, memory, keyboardLayouts, storage, conditions, warrantyOnly, minBatteryCapacity, maxBatteryCycles, sortId, minPrice, maxPrice, shipping, originalBox]);

  useEffect(() => {
    if (sortId === "nearest" && !userPlace) {
      setSortId("newest");
    }
  }, [sortId, userPlace]);

  const clearModelFilters = () => {
    setModelId(undefined);
    setSizes([]);
    setYears([]);
    setColors([]);
    setMemory([]);
    setStorage([]);
    setKeyboardLayouts([]);
    setConditions([]);
    setWarrantyOnly(false);
    setOriginalBox(undefined);
    setMinBatteryCapacity(undefined);
    setMaxBatteryCycles(undefined);
  };

  useEffect(() => {
    if (urlCategoryRef.current === urlCategory) {
      setCategoryId(urlCategory);
      return;
    }
    urlCategoryRef.current = urlCategory;
    setCategoryId(urlCategory);
    clearModelFilters();
  }, [urlCategory]);

  const resetFilters = () => {
    setKeyboardLayouts([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setShipping(undefined);
    setOriginalBox(undefined);
    router.replace(pathname);
  };

  const applyCategory = (id?: CategoryId) => {
    const next = id ? `${pathname}?kategorie=${id}` : pathname;
    router.replace(next);
  };

  const filtered = useMemo(() => {
    const matches = filterListings(listings, {
      categoryId,
      modelId,
      sizes,
      years,
      colors,
      memory,
      storage,
      keyboardLayouts,
      conditions,
      warrantyOnly,
      minBatteryCapacity,
      maxBatteryCycles,
      userCity: location.city,
      userPostalCode: location.postalCode,
      userLat: userPlace?.lat,
      userLng: userPlace?.lng,
      maxRadiusKm: !ignoreLocation && userPlace && location.radiusKm != null ? location.radiusKm : undefined,
      minPrice,
      maxPrice,
      shipping,
      originalBox,
    });
    return sortListings(matches, ignoreLocation && sortId === "nearest" ? "newest" : sortId, userPlace);
  }, [
    listings,
    categoryId,
    modelId,
    sizes,
    years,
    colors,
    memory,
    storage,
    keyboardLayouts,
    conditions,
    warrantyOnly,
    minBatteryCapacity,
    maxBatteryCycles,
    ignoreLocation,
    location,
    sortId,
    userPlace,
    minPrice,
    maxPrice,
    shipping,
    originalBox,
  ]);

  const sidebar = {
    categoryId,
    modelId,
    sizes,
    years,
    colors,
    memory,
    storage,
    keyboardLayouts,
    conditions,
    warrantyOnly,
    minBatteryCapacity,
    maxBatteryCycles,
    onCategoryChange: applyCategory,
    onModelChange: (id?: string) => {
      const model = id ? getModelById(id) : undefined;
      if (model) {
        setCategoryId(model.categoryId);
        if (urlCategory !== model.categoryId) {
          urlCategoryRef.current = model.categoryId;
          router.replace(`${pathname}?kategorie=${model.categoryId}`);
        }
      } else {
        setCategoryId(urlCategory);
      }
      setModelId(id);
      setSizes([]);
      setYears([]);
      setColors([]);
      setMemory([]);
      setStorage([]);
      setKeyboardLayouts([]);
      setMinBatteryCapacity(undefined);
      setMaxBatteryCycles(undefined);
    },
    onToggleSize: (v: string) => setSizes((s) => toggleValue(s, v)),
    onToggleYear: (v: number) => setYears((s) => toggleValue(s, v)),
    onToggleColor: (v: string) => setColors((s) => toggleValue(s, v)),
    onToggleMemory: (v: string) => setMemory((s) => toggleValue(s, v)),
    onToggleKeyboardLayout: (v: KeyboardLayoutId) => setKeyboardLayouts((s) => toggleValue(s, v)),
    onToggleStorage: (v: string) => setStorage((s) => toggleValue(s, v)),
    onToggleCondition: (v: ConditionId) => setConditions((s) => toggleValue(s, v)),
    onWarrantyOnlyChange: setWarrantyOnly,
    onMinBatteryCapacityChange: setMinBatteryCapacity,
    onMaxBatteryCyclesChange: setMaxBatteryCycles,
    location,
    onLocationChange: setLocation,
    sortId,
    onSortChange: setSortId,
    canSortByDistance: !!userPlace,
    minPrice,
    maxPrice,
    onMinPriceChange: setMinPrice,
    onMaxPriceChange: setMaxPrice,
    shipping,
    onShippingChange: setShipping,
    originalBox,
    onOriginalBoxChange: setOriginalBox,
  };

  return {
    filtered,
    userPlace,
    categoryId,
    resetFilters,
    applyCategory,
    sidebar,
  };
}
