import { resolveImageUrl, type CatalogPhoto } from "@/lib/catalogPhotos";

type AppbackendRow = {
  _id?: string;
  model_id?: unknown;
  color_id?: unknown;
  view?: unknown;
  position?: unknown;
  image?: unknown;
};

type AppbackendList = {
  data?: AppbackendRow[];
  page?: number;
  count?: number;
  perPage?: number;
};

const TABLE_ID = process.env.APPBACKEND_TABLE_ID || "aMYWSrgiDN8b";
const PAGE_SIZE = 100;
const CACHE_MS = 60_000;

let cache: { at: number; photos: CatalogPhoto[] } | null = null;

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asPosition(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 999;
}

function toPhoto(row: AppbackendRow): CatalogPhoto | null {
  const modelId = asText(row.model_id);
  const colorId = asText(row.color_id);
  const url = resolveImageUrl(row.image);
  if (!modelId || !colorId || !url || !row._id) return null;
  return {
    id: row._id,
    modelId,
    colorId,
    view: asText(row.view).toLowerCase(),
    position: asPosition(row.position),
    url,
  };
}

function rowsUrl(page: number) {
  const url = new URL(`https://v1.appbackend.io/v1/rows/${TABLE_ID}`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(PAGE_SIZE));
  const apiKey = process.env.APPBACKEND_API_KEY;
  if (apiKey) url.searchParams.set("api_key", apiKey);
  return url;
}

async function loadAll(): Promise<CatalogPhoto[]> {
  const photos: CatalogPhoto[] = [];
  let page = 1;
  let total = Infinity;

  while ((page - 1) * PAGE_SIZE < total) {
    const response = await fetch(rowsUrl(page), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) break;
    const json = (await response.json()) as AppbackendList;
    const rows = Array.isArray(json.data) ? json.data : [];
    for (const row of rows) {
      const photo = toPhoto(row);
      if (photo) photos.push(photo);
    }
    total = typeof json.count === "number" ? json.count : rows.length;
    if (rows.length === 0) break;
    page += 1;
  }

  return photos.sort((a, b) => {
    if (a.modelId !== b.modelId) return a.modelId.localeCompare(b.modelId);
    if (a.colorId !== b.colorId) return a.colorId.localeCompare(b.colorId);
    if (a.position !== b.position) return a.position - b.position;
    return a.view.localeCompare(b.view);
  });
}

export async function fetchCatalogPhotos(): Promise<CatalogPhoto[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.photos;
  const photos = await loadAll();
  cache = { at: Date.now(), photos };
  return photos;
}
