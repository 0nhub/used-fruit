"use client";

import { getModelById } from "@/data/catalog";
import { filterListings, sortListings } from "@/lib/format";
import { useUserLocation } from "@/lib/useUserLocation";
import type { CategoryId, ConditionId, Listing, SortId } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function useCatalogFilters(listings: Listing[]) {
  const [categoryId, setCategoryId] = useState<CategoryId | undefined>(undefined);
  const [modelId, setModelId] = useState<string | undefined>(undefined);
  const [sizes, setSizes] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [memory, setMemory] = useState<string[]>([]);
  const [storage, setStorage] = useState<string[]>([]);
  const [conditions, setConditions] = useState<ConditionId[]>([]);
  const [warrantyOnly, setWarrantyOnly] = useState(false);
  const [minBatteryCapacity, setMinBatteryCapacity] = useState<number | undefined>();
  const [maxBatteryCycles, setMaxBatteryCycles] = useState<number | undefined>();
  const [sortId, setSortId] = useState<SortId>("newest");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [shipping, setShipping] = useState<"yes" | "no" | undefined>();
  const { location, setLocation, userPlace } = useUserLocation();

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
    setConditions([]);
    setWarrantyOnly(false);
    setMinBatteryCapacity(undefined);
    setMaxBatteryCycles(undefined);
  };

  const resetFilters = () => {
    setCategoryId(undefined);
    clearModelFilters();
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setShipping(undefined);
  };

  const applyCategory = (id?: CategoryId) => {
    setCategoryId(id);
    clearModelFilters();
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
      conditions,
      warrantyOnly,
      minBatteryCapacity,
      maxBatteryCycles,
      userCity: location.city,
      userPostalCode: location.postalCode,
      userLat: userPlace?.lat,
      userLng: userPlace?.lng,
      maxRadiusKm: userPlace && location.radiusKm != null ? location.radiusKm : undefined,
      minPrice,
      maxPrice,
      shipping,
    });
    return sortListings(matches, sortId, userPlace);
  }, [
    listings,
    categoryId,
    modelId,
    sizes,
    years,
    colors,
    memory,
    storage,
    conditions,
    warrantyOnly,
    minBatteryCapacity,
    maxBatteryCycles,
    location,
    sortId,
    userPlace,
    minPrice,
    maxPrice,
    shipping,
  ]);

  const sidebar = {
    categoryId,
    modelId,
    sizes,
    years,
    colors,
    memory,
    storage,
    conditions,
    warrantyOnly,
    minBatteryCapacity,
    maxBatteryCycles,
    onModelChange: (id?: string) => {
      const model = id ? getModelById(id) : undefined;
      if (model) setCategoryId(model.categoryId);
      setModelId(id);
      setSizes([]);
      setYears([]);
      setColors([]);
      setMemory([]);
      setStorage([]);
      setMinBatteryCapacity(undefined);
      setMaxBatteryCycles(undefined);
    },
    onToggleSize: (v: string) => setSizes((s) => toggleValue(s, v)),
    onToggleYear: (v: number) => setYears((s) => toggleValue(s, v)),
    onToggleColor: (v: string) => setColors((s) => toggleValue(s, v)),
    onToggleMemory: (v: string) => setMemory((s) => toggleValue(s, v)),
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
