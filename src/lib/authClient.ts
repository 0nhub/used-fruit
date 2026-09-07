import { DEFAULT_PROFILE, PROFILE_EVENT, readProfile, writeProfile, writeSignedIn } from "@/lib/profile";

import type { ApiProfile } from "./apiTypes";
import { api } from "./apiClient";
type Identity = ApiProfile;
let pending: Promise<Identity | null> | null = null;
let current: Identity | null = null;
const identityKey = "used-fruit-auth-identity";
const archiveKey = (id: string) => `used-fruit-account:${id}`;

// Preserve each account's local data across sign-out and account changes.
function switchAccount(user: Identity | null) {
  const previous = localStorage.getItem(identityKey);
  const next = user?.id ?? null;
  if (previous !== next) {
    const keys = Object.keys(localStorage).filter(key => key.startsWith("used-fruit-") && key !== identityKey && key !== "used-fruit-session" && !key.startsWith("used-fruit-account:"));
    const snapshot = Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]));
    // Keep legacy prototype data separately; do not assign it to a new identity.
    if (keys.length) localStorage.setItem(archiveKey(previous ?? "legacy"), JSON.stringify(snapshot));
    keys.forEach(key => localStorage.removeItem(key));
    if (next) {
      localStorage.setItem(identityKey, next);
    } else localStorage.removeItem(identityKey);
    // A guest draft must survive the OAuth callback; account switches/logouts clear it.
    if (previous !== null || next === null) sessionStorage.removeItem("used-fruit-listing-draft");
  }
  if (user) {
    const previousProfile = readProfile();
    localStorage.setItem("used-fruit-onboarding", user.onboardingCompleted ? "done" : "pending");
    writeProfile({ ...DEFAULT_PROFILE, ...previousProfile, name: user.name, emoji: user.emoji, bio: user.bio, city: user.city, postalCode: user.postalCode,
      coverImage: user.coverMediaId ? "/api/v1/media/" + user.coverMediaId : undefined,
      notifyOnMessage: user.onboardingCompleted ? user.emailNotifications : true });
    const favorite = sessionStorage.getItem("used-fruit-pending-favorite");
    if (favorite && /^[a-f0-9-]{36}$/.test(favorite)) {
      sessionStorage.removeItem("used-fruit-pending-favorite");
      void api("/favorites/" + favorite, { method: "PUT" }).catch(() => sessionStorage.setItem("used-fruit-pending-favorite", favorite));
    }
  }
  current = user;
  writeSignedIn(Boolean(user));
}
export function currentIdentity() { return current; }
export function refreshIdentity() {
  if (!pending) {
    pending = fetch("/api/auth/session", { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Session unavailable");
        const { user } = await response.json();
        const identity = user && typeof user.id === "string" && typeof user.name === "string" ? user as Identity : null;
        switchAccount(identity);
        return identity;
      })
      .catch(() => { current = null; writeSignedIn(false); return null; })
      .finally(() => { pending = null; });
  }
  return pending;
}
export async function endSession(deleteLocal = false) {
  if (deleteLocal) await api("/me", { method: "DELETE" });
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) throw new Error("Abmeldung fehlgeschlagen. Bitte erneut versuchen.");
  const previous = localStorage.getItem(identityKey);
  sessionStorage.removeItem("used-fruit-pending-favorite");
  switchAccount(null);
  if (deleteLocal && previous) localStorage.removeItem(archiveKey(previous));
  window.dispatchEvent(new Event(PROFILE_EVENT));
  window.location.assign("/");
}
