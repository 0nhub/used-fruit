import { DEFAULT_AVATAR } from "@/lib/profile";
import type { Listing } from "@/lib/types";

const SEED_EMOJIS: Record<string, string> = {
  "Anna M.": "🌸",
  "Jonas K.": "🎧",
  "Lea S.": "🌿",
  "Tom R.": "⚽️",
  "Nina B.": "🌙",
  "Erik W.": "🦊",
  "Studio Nord": "🏢",
  "Mira P.": "🍓",
  "Felix D.": "🎸",
  "Paul G.": "🚲",
  "Clara V.": "🦋",
  "Omar T.": "☕",
  "Helen A.": "🌻",
  "Samira H.": "💫",
  "Lina T.": "🧁",
  "David R.": "📚",
  "Sofia N.": "🌊",
  "Ben L.": "🎯",
  "Maya K.": "🎨",
  "Jan P.": "🌲",
  "Greta F.": "🌼",
  "Nico S.": "🚀",
};

export function listingSellerEmoji(listing: Listing, fallback = DEFAULT_AVATAR): string {
  if (listing.sellerEmoji) return listing.sellerEmoji;
  return SEED_EMOJIS[listing.sellerName] ?? fallback;
}

export function listingJoinedAt(listing: Listing) {
  return listing.sellerJoinedAt ?? listing.createdAt;
}
