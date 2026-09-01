"use client";

import type { UserLocation } from "@/components/LocationPicker";
import { findPlace, formatPlaceLabel } from "@/data/locations";
import { parseRadiusKm } from "@/data/catalog";
import {
  LOCATION_STORAGE_KEY,
  PROFILE_EVENT,
  readProfile,
  writeProfile,
} from "@/lib/profile";
import { useCallback, useEffect, useMemo, useState } from "react";

function locationFromProfile(): UserLocation {
  const profile = readProfile();
  const city = profile.city || undefined;
  const postalCode = profile.postalCode || undefined;
  const place = findPlace(postalCode, city);
  return {
    query: profile.locationQuery || (place ? formatPlaceLabel(place) : city ?? ""),
    city,
    postalCode,
    radiusKm: parseRadiusKm(profile.radiusKm),
    place,
  };
}

function migrateLegacyLocation() {
  if (typeof window === "undefined") return;
  const profile = readProfile();
  if (profile.city || profile.postalCode) return;
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<UserLocation>;
    if (!parsed.city && !parsed.postalCode) return;
    writeProfile({
      ...profile,
      city: parsed.city ?? "",
      postalCode: parsed.postalCode ?? "",
      locationQuery: parsed.query ?? "",
      radiusKm: parseRadiusKm(parsed.radiusKm),
    });
  } catch {
    /* ignore */
  }
}

function readLocation(): UserLocation {
  if (typeof window === "undefined") {
    return { query: "" };
  }
  migrateLegacyLocation();
  return locationFromProfile();
}

export function useUserLocation() {
  const [location, setLocationState] = useState<UserLocation>({ query: "" });

  useEffect(() => {
    const sync = () => setLocationState(readLocation());
    sync();
    window.addEventListener(PROFILE_EVENT, sync);
    return () => window.removeEventListener(PROFILE_EVENT, sync);
  }, []);

  const setLocation = useCallback((next: UserLocation) => {
    const profile = readProfile();
    writeProfile({
      ...profile,
      city: next.city?.trim() ?? "",
      postalCode: next.postalCode?.trim() ?? "",
      locationQuery: next.query.trim(),
      radiusKm: parseRadiusKm(next.radiusKm),
    });
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(next));
    setLocationState({
      ...next,
      radiusKm: parseRadiusKm(next.radiusKm),
    });
  }, []);

  const userPlace = useMemo(
    () => location.place ?? findPlace(location.postalCode, location.city),
    [location],
  );

  return { location, setLocation, userPlace };
}
