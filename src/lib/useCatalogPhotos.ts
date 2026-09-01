"use client";

import { coverPhoto, photosForModelColor, type CatalogPhoto } from "@/lib/catalogPhotos";
import { useCallback, useEffect, useState } from "react";

let inflight: Promise<CatalogPhoto[]> | null = null;

function loadPhotos() {
  if (!inflight) {
    inflight = fetch("/api/catalog-photos")
      .then((response) => (response.ok ? response.json() : { photos: [] }))
      .then((payload) => (Array.isArray(payload.photos) ? payload.photos : []))
      .catch(() => []);
  }
  return inflight;
}

export function useCatalogPhotos() {
  const [photos, setPhotos] = useState<CatalogPhoto[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPhotos().then((list) => {
      if (cancelled) return;
      setPhotos(list);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const photosFor = useCallback(
    (modelId: string, colorId: string) => photosForModelColor(photos, modelId, colorId),
    [photos],
  );

  const coverFor = useCallback(
    (modelId: string, colorId: string) => coverPhoto(photos, modelId, colorId),
    [photos],
  );

  return { photos, photosFor, coverFor, ready };
}
