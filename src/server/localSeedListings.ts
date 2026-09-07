import { SEED_LISTINGS } from "@/data/listings";
import { listingToApi, type ApiListing } from "@/lib/apiTypes";
import { listingNumber } from "@/lib/listingNumber";
import { listingSellerEmoji } from "@/lib/seller";
import { ApiError } from "./http";

export function localSeedAvailable() {
  return !process.env.DATABASE_URL;
}

function toApi(listing: (typeof SEED_LISTINGS)[number]): ApiListing {
  const payload = listingToApi(listing);
  return {
    id: listing.id,
    number: listingNumber(listing.id),
    sellerId: listing.sellerName,
    categoryId: listing.categoryId,
    modelId: listing.modelId,
    title: listing.title,
    priceCents: payload.priceCents,
    currency: "EUR",
    specs: payload.specs,
    city: listing.city,
    postalCode: listing.postalCode,
    status: "public",
    version: 1,
    createdAt: listing.createdAt,
    updatedAt: listing.createdAt,
    soldAt: listing.soldAt ?? null,
    sellerName: listing.sellerName,
    sellerEmoji: listingSellerEmoji(listing),
    sellerJoinedAt: listing.createdAt,
  };
}

export function listLocalSeedListings(query: URLSearchParams, own = false) {
  if (own) return { items: [] as ApiListing[], nextCursor: null };
  let items = SEED_LISTINGS.filter((listing) => !listing.soldAt).map(toApi);
  const categoryId = query.get("categoryId");
  if (categoryId) items = items.filter((item) => item.categoryId === categoryId);
  const modelId = query.get("modelId");
  if (modelId) items = items.filter((item) => item.modelId === modelId);
  return { items, nextCursor: null };
}

export function getLocalSeedListing(id: string) {
  const listing = SEED_LISTINGS.find((item) => item.id === id && !item.soldAt);
  if (!listing) throw new ApiError(404, "not_found", "Inserat nicht gefunden.");
  return toApi(listing);
}
