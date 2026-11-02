import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { sha256 } from "./accounts";
import { validateListing } from "./listingValidation";
import { ApiError, requireValue } from "./http";
import { listingNumber } from "@/lib/listingNumber";
import type { ApiListing } from "@/lib/apiTypes";

interface StoredListing extends Omit<ApiListing, "status"> {
  status: ApiListing["status"] | "deleted";
  privateSpecs: Record<string, string>;
}

interface StoredMedia {
  id: string;
  userId: string;
  filename: string;
  sizeBytes: number;
  deletedAt: string | null;
}

interface IdempotencyRow {
  userId: string;
  scope: string;
  key: string;
  hash: string;
  response: unknown;
}

interface StoredFavorite {
  userId: string;
  listingId: string;
}

interface LocalState {
  listings: StoredListing[];
  media: StoredMedia[];
  idempotency: IdempotencyRow[];
  favorites: StoredFavorite[];
}

const FILE = path.join(process.cwd(), ".data", "local-marketplace.json");
const empty = (): LocalState => ({ listings: [], media: [], idempotency: [], favorites: [] });
let chain: Promise<unknown> = Promise.resolve();

function exclusive<T>(work: () => Promise<T>): Promise<T> {
  const run = chain.then(work, work);
  chain = run.then(() => undefined, () => undefined);
  return run;
}

async function readState(): Promise<LocalState> {
  try {
    const parsed = JSON.parse(await readFile(FILE, "utf8")) as Partial<LocalState>;
    return { listings: parsed.listings ?? [], media: parsed.media ?? [], idempotency: parsed.idempotency ?? [], favorites: parsed.favorites ?? [] };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return empty();
    throw error;
  }
}

async function writeState(state: LocalState) {
  await mkdir(path.dirname(FILE), { recursive: true, mode: 0o750 });
  await writeFile(FILE, JSON.stringify(state), { mode: 0o640 });
}

function photoIdsOf(specs: { photoIds?: unknown }): string[] {
  return Array.isArray(specs.photoIds) ? specs.photoIds.filter((id): id is string => typeof id === "string") : [];
}

function visible(listing: StoredListing, userId: string | null): ApiListing {
  const status = listing.status === "deleted" ? "inactive" : listing.status;
  if (userId && userId === listing.sellerId) return { ...listing, status };
  const { privateSpecs: _privateSpecs, ...rest } = listing;
  return { ...rest, status };
}

export async function rememberLocalMedia(userId: string, id: string, filename: string, sizeBytes: number) {
  await exclusive(async () => {
    const state = await readState();
    const owned = state.media.filter((item) => item.userId === userId && !item.deletedAt).length;
    if (owned >= 80) throw new ApiError(409, "media_limit", "Bitte entferne zuerst ein nicht mehr benötigtes Bild.");
    state.media.push({ id, userId, filename, sizeBytes, deletedAt: null });
    await writeState(state);
  });
}

export async function localMediaRecord(id: string, userId: string | null) {
  const state = await readState();
  const media = state.media.find((item) => item.id === id && !item.deletedAt);
  if (!media) return null;
  const published = state.listings.some((listing) => (listing.status === "public" || listing.status === "sold") && Array.isArray(listing.specs.photoIds) && listing.specs.photoIds.includes(id));
  if (userId !== media.userId && !published) return null;
  return media;
}

export async function deleteLocalMedia(id: string, userId: string) {
  await exclusive(async () => {
    const state = await readState();
    const media = state.media.find((item) => item.id === id && item.userId === userId && !item.deletedAt);
    if (!media) throw new ApiError(404, "not_found", "Bild nicht gefunden.");
    media.deletedAt = new Date().toISOString();
    await writeState(state);
  });
  return { ok: true };
}

export async function listLocalListings(userId: string | null, own: boolean) {
  const state = await readState();
  return state.listings
    .filter((listing) => listing.status !== "deleted" && (own ? listing.sellerId === userId : listing.status === "public" || listing.sellerId === userId))
    .map((listing) => visible(listing, userId));
}

export async function readLocalListing(id: string, userId: string | null) {
  const state = await readState();
  const listing = state.listings.find((item) => item.id === id && item.status !== "deleted" && (item.status === "public" || item.status === "sold" || item.sellerId === userId));
  return listing ? visible(listing, userId) : null;
}

export async function createLocalListing(userId: string, input: Record<string, unknown>, key: string | null, seller: { name: string; emoji: string }) {
  requireValue(key && /^[A-Za-z0-9_-]{8,128}$/.test(key), "Idempotency-Key erforderlich.");
  const listing = validateListing(input);
  const hash = sha256(JSON.stringify(input));
  return exclusive(async () => {
    const state = await readState();
    const existing = state.idempotency.find((item) => item.userId === userId && item.scope === "listing:create" && item.key === key);
    if (existing) {
      if (existing.hash !== hash) throw new ApiError(409, "idempotency_conflict", "Diese Anfrage wurde bereits mit anderen Daten verwendet.");
      return existing.response as ApiListing;
    }
    const photoIds = photoIdsOf(listing.specs);
    for (const photoId of photoIds) {
      const media = state.media.find((item) => item.id === photoId && item.userId === userId && !item.deletedAt);
      if (!media) throw new ApiError(400, "invalid_input", "Ein Foto ist nicht mehr verfügbar. Bitte lade es erneut hoch.");
    }
    const requested = typeof input.id === "string" && /^uf-[a-z0-9]{4,12}$/.test(input.id) ? input.id : "";
    const taken = requested ? state.listings.find((item) => item.id === requested && item.status !== "deleted") : undefined;
    if (taken) {
      if (taken.sellerId !== userId) throw new ApiError(409, "listing_exists", "Dieses Inserat gehört zu einem anderen Konto.");
      return visible(taken, userId);
    }
    const now = new Date().toISOString();
    const stored: StoredListing = {
      id: requested || randomUUID(),
      number: "",
      sellerId: userId,
      categoryId: listing.categoryId,
      modelId: listing.modelId,
      title: listing.title,
      priceCents: listing.priceCents,
      currency: "EUR",
      specs: listing.specs,
      privateSpecs: listing.privateSpecs,
      city: listing.city,
      postalCode: listing.postalCode,
      status: "public",
      version: 1,
      createdAt: now,
      updatedAt: now,
      soldAt: null,
      sellerName: seller.name || "Anbieter",
      sellerEmoji: seller.emoji || "🍏",
      sellerJoinedAt: now,
    };
    stored.number = listingNumber(stored.id);
    state.listings.push(stored);
    const response = visible(stored, userId);
    state.idempotency.push({ userId, scope: "listing:create", key, hash, response });
    await writeState(state);
    return response;
  });
}

export async function updateLocalListing(id: string, userId: string, input: Record<string, unknown>, remove = false) {
  return exclusive(async () => {
    const state = await readState();
    const existing = state.listings.find((item) => item.id === id && item.sellerId === userId && item.status !== "deleted");
    if (!existing) throw new ApiError(404, "not_found", "Inserat nicht gefunden.");
    if (remove) {
      existing.status = "deleted";
      existing.version += 1;
      existing.updatedAt = new Date().toISOString();
      await writeState(state);
      return { ok: true };
    }
    requireValue(Number.isInteger(input.version), "Versionsnummer erforderlich.");
    if (input.version !== existing.version) throw new ApiError(409, "version_conflict", "Das Inserat wurde inzwischen geändert. Bitte lade es neu.");
    if (existing.status === "sold") throw new ApiError(409, "sold", "Das Gerät wurde bereits verkauft.");
    const status = input.status ?? existing.status;
    requireValue(["public", "reserved", "inactive"].includes(String(status)), "Ungültiger Status.");
    const next = validateListing({ categoryId: existing.categoryId, modelId: existing.modelId, priceCents: existing.priceCents, city: existing.city, postalCode: existing.postalCode, specs: { ...existing.specs, ...existing.privateSpecs }, ...input });
    const photoIds = photoIdsOf(next.specs);
    for (const photoId of photoIds) {
      const media = state.media.find((item) => item.id === photoId && item.userId === userId && !item.deletedAt);
      if (!media) throw new ApiError(400, "invalid_input", "Ein Foto ist nicht mehr verfügbar. Bitte lade es erneut hoch.");
    }
    existing.title = next.title;
    existing.categoryId = next.categoryId;
    existing.modelId = next.modelId;
    existing.priceCents = next.priceCents;
    existing.specs = next.specs;
    existing.privateSpecs = next.privateSpecs;
    existing.city = next.city;
    existing.postalCode = next.postalCode;
    existing.status = status as StoredListing["status"];
    existing.version += 1;
    existing.updatedAt = new Date().toISOString();
    await writeState(state);
    return visible(existing, userId);
  });
}

export async function localFavorites(userId: string) {
  const state = await readState();
  return state.favorites.filter((item) => item.userId === userId).map((item) => item.listingId);
}

export async function setLocalFavorite(userId: string, listingId: string, enabled: boolean) {
  await exclusive(async () => {
    const state = await readState();
    state.favorites = state.favorites.filter((item) => !(item.userId === userId && item.listingId === listingId));
    if (enabled) state.favorites.push({ userId, listingId });
    await writeState(state);
  });
}
