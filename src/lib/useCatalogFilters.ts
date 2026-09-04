"use client";

import { parseCategoryParam } from "@/components/CategoryNav";
import { getModelById } from "@/data/catalog";
import { filterListings, sortListings } from "@/lib/format";
import { useUserLocation } from "@/lib/useUserLocation";
import type { CategoryId, ConditionId, Listing, SortId } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function useCatalogFilters(listings: Listing[]) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = parseCategoryParam(searchParams.get("kategorie"));
  const urlCategoryRef = useRef(urlCategory);
  const [categoryId, setCategoryId] = useState<CategoryId | undefined>(urlCategory);
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
  const [originalBox, setOriginalBox] = useState<"yes" | "no" | undefined>();
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
      originalBox,
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
