export type CatalogPhoto = {
  id: string;
  modelId: string;
  colorId: string;
  view: string;
  position: number;
  url: string;
};

export function resolveImageUrl(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = resolveImageUrl(item);
      if (url) return url;
    }
    return null;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["url", "src", "href", "link", "path", "secure_url"]) {
      const url = resolveImageUrl(record[key]);
      if (url) return url;
    }
  }
  return null;
}

export function photosForModelColor(photos: CatalogPhoto[], modelId: string, colorId: string) {
  return photos.filter((photo) => photo.modelId === modelId && photo.colorId === colorId);
}

export function coverPhoto(photos: CatalogPhoto[], modelId: string, colorId: string) {
  const matches = photosForModelColor(photos, modelId, colorId);
  return matches.find((photo) => photo.view === "front" || photo.position === 1) ?? matches[0];
}
