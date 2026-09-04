import { parseRadiusKm } from "@/data/catalog";

export const PROFILE_STORAGE_KEY = "used-fruit-profile";
export const SESSION_STORAGE_KEY = "used-fruit-session";
export const LISTINGS_STORAGE_KEY = "used-fruit-listings";
export const FAVORITES_STORAGE_KEY = "used-fruit-favorites";
export const LISTING_NOTES_STORAGE_KEY = "used-fruit-listing-notes";
export const LISTING_NOTE_MAX_LENGTH = 200;
export const LOCATION_STORAGE_KEY = "used-fruit-location";
export const BLOCKED_STORAGE_KEY = "used-fruit-blocked";
export const MUTED_STORAGE_KEY = "used-fruit-muted";
export const INBOX_WIDTH_KEY = "used-fruit-inbox-width";
export const SOLD_STORAGE_KEY = "used-fruit-sold";
export const PROFILE_EVENT = "used-fruit-data";

export const DEFAULT_AVATAR = "🍏";
export const BIO_MAX_LENGTH = 220;

function graphemesOf(value: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return [...new Intl.Segmenter("de", { granularity: "grapheme" }).segment(value)].map(
      (part) => part.segment,
    );
  }
  return [...value];
}

function isEmojiCluster(value: string): boolean {
  if (!value) return false;
  if (/\p{Extended_Pictographic}/u.test(value)) return true;
  if (/^\p{Regional_Indicator}{2}$/u.test(value)) return true;
  if (/^[0-9#*]\uFE0F?\u20E3$/u.test(value)) return true;
  return /\p{Emoji}/u.test(value) && /\uFE0F/.test(value);
}

export function extractAvatarEmoji(value: string): string | undefined {
  const trimmed = value.normalize("NFC").trim();
  if (!trimmed) return undefined;
  for (const cluster of graphemesOf(trimmed)) {
    if (isEmojiCluster(cluster)) return cluster;
  }
  return undefined;
}

export function isAvatarEmoji(value: string): boolean {
  const trimmed = value.normalize("NFC").trim();
  if (!trimmed) return false;
  const clusters = graphemesOf(trimmed);
  return clusters.length === 1 && isEmojiCluster(clusters[0]);
}

export interface UserProfile {
  name: string;
  emoji: string;
  bio: string;
  notifyOnMessage: boolean;
  city: string;
  postalCode: string;
  locationQuery: string;
  radiusKm?: number;
}

export interface UserSession {
  signedIn: boolean;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  emoji: DEFAULT_AVATAR,
  bio: "",
  notifyOnMessage: false,
  city: "",
  postalCode: "",
  locationQuery: "",
};

function notifyProfileChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

export function readProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    const emoji =
      typeof parsed.emoji === "string"
        ? extractAvatarEmoji(parsed.emoji) ?? DEFAULT_AVATAR
        : DEFAULT_AVATAR;
    return {
      name: typeof parsed.name === "string" ? parsed.name.trim().slice(0, 40) : "",
      emoji,
      bio: typeof parsed.bio === "string" ? parsed.bio.trim().slice(0, BIO_MAX_LENGTH) : "",
      notifyOnMessage: parsed.notifyOnMessage === true,
      city: typeof parsed.city === "string" ? parsed.city.trim().slice(0, 80) : "",
      postalCode:
        typeof parsed.postalCode === "string" ? parsed.postalCode.trim().slice(0, 10) : "",
      locationQuery:
        typeof parsed.locationQuery === "string" ? parsed.locationQuery.trim().slice(0, 80) : "",
      radiusKm: parseRadiusKm(parsed.radiusKm),
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function writeProfile(profile: UserProfile) {
  const next: UserProfile = {
    name: profile.name.trim().slice(0, 40),
    emoji: extractAvatarEmoji(profile.emoji) ?? DEFAULT_AVATAR,
    bio: (profile.bio ?? "").trim().slice(0, BIO_MAX_LENGTH),
    notifyOnMessage: profile.notifyOnMessage === true,
    city: profile.city.trim().slice(0, 80),
    postalCode: profile.postalCode.trim().slice(0, 10),
    locationQuery: profile.locationQuery.trim().slice(0, 80),
    radiusKm: parseRadiusKm(profile.radiusKm),
  };
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
  notifyProfileChange();
  return next;
}

export function readSignedIn(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<UserSession>;
    return parsed.signedIn === true;
  } catch {
    return true;
  }
}

export function writeSignedIn(signedIn: boolean) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ signedIn } satisfies UserSession));
  notifyProfileChange();
}

export function wipeAllUserData() {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith("used-fruit-")) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
  writeSignedIn(false);
}
