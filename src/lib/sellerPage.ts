import { BIO_MAX_LENGTH, DEFAULT_AVATAR, PROFILE_EVENT } from "@/lib/profile";
import { listingSellerEmoji } from "@/lib/seller";
import type { Listing } from "@/lib/types";

export const SELLER_PAGES_KEY = "used-fruit-seller-pages";
export { BIO_MAX_LENGTH };

export interface PublicSeller {
  name: string;
  emoji: string;
  bio: string;
}

const SEED_SELLER_PAGES: Record<string, PublicSeller> = {
  "studio-nord": {
    name: "Studio Nord",
    emoji: "🏢",
    bio: "Geprüfte Apple-Geräte aus Stuttgart. Ankauf, Verkauf und Abholung vor Ort.",
  },
  "anna-m": {
    name: "Anna M.",
    emoji: "🌸",
    bio: "Ich verkaufe nur Geräte, die ich selbst genutzt und gepflegt habe.",
  },
};

export function sellerSlug(name: string): string {
  return name
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sellerHref(name: string): string | undefined {
  const slug = sellerSlug(name);
  return slug ? `/anbieter/${slug}` : undefined;
}

export function listingsForSellerSlug(listings: Listing[], slug: string): Listing[] {
  if (!slug) return [];
  return listings.filter(
    (listing) =>
      sellerSlug(listing.sellerName) === slug &&
      !listing.soldAt &&
      (!listing.visibility || listing.visibility === "public"),
  );
}

function readStoredSellerPages(): Record<string, PublicSeller> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SELLER_PAGES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<PublicSeller>>;
    const next: Record<string, PublicSeller> = {};
    for (const [slug, value] of Object.entries(parsed)) {
      if (!slug || !value || typeof value !== "object") continue;
      const name = typeof value.name === "string" ? value.name.trim().slice(0, 40) : "";
      if (!name || sellerSlug(name) !== slug) continue;
      next[slug] = {
        name,
        emoji:
          typeof value.emoji === "string" && value.emoji.trim()
            ? value.emoji
            : DEFAULT_AVATAR,
        bio: typeof value.bio === "string" ? value.bio.trim().slice(0, BIO_MAX_LENGTH) : "",
      };
    }
    return next;
  } catch {
    return {};
  }
}

export function syncPublicSellerPage(
  input: { name: string; emoji: string; bio?: string },
  previousName?: string,
) {
  if (typeof window === "undefined") return;
  const name = input.name.trim().slice(0, 40);
  const slug = sellerSlug(name);
  const pages = readStoredSellerPages();
  const previousSlug = previousName ? sellerSlug(previousName) : "";
  if (previousSlug && previousSlug !== slug) delete pages[previousSlug];
  if (!slug) {
    localStorage.setItem(SELLER_PAGES_KEY, JSON.stringify(pages));
    window.dispatchEvent(new Event(PROFILE_EVENT));
    return;
  }
  pages[slug] = {
    name,
    emoji: input.emoji.trim() || DEFAULT_AVATAR,
    bio: (input.bio ?? "").trim().slice(0, BIO_MAX_LENGTH),
  };
  localStorage.setItem(SELLER_PAGES_KEY, JSON.stringify(pages));
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

export function resolveSellerPage(
  slug: string,
  listings: Listing[],
  viewer?: { name: string; emoji: string; bio?: string },
): { seller: PublicSeller; listings: Listing[]; isOwn: boolean } | null {
  const normalized = sellerSlug(slug);
  if (!normalized) return null;

  const mine = listingsForSellerSlug(listings, normalized);
  const isOwn = Boolean(viewer?.name && sellerSlug(viewer.name) === normalized);
  const stored = readStoredSellerPages()[normalized];
  const seed = SEED_SELLER_PAGES[normalized];
  const first = mine[0];

  if (!mine.length && !stored && !seed && !isOwn) return null;

  const seller: PublicSeller =
    isOwn && viewer
      ? {
          name: viewer.name.trim(),
          emoji: viewer.emoji,
          bio: (viewer.bio ?? "").trim().slice(0, BIO_MAX_LENGTH),
        }
      : stored ??
        seed ?? {
          name: first?.sellerName ?? "",
          emoji: first ? listingSellerEmoji(first) : DEFAULT_AVATAR,
          bio: "",
        };

  if (!seller.name) return null;
  return { seller, listings: mine, isOwn };
}
