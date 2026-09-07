"use client";

import {
  DEFAULT_PROFILE,
  PROFILE_EVENT,
  readProfile,
  type UserProfile,
} from "@/lib/profile";
import { currentIdentity, endSession, refreshIdentity } from "@/lib/authClient";
import { api, invalidateApi } from "./apiClient";
import { useCallback, useEffect, useState } from "react";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setProfile(readProfile());
    setSignedIn(Boolean(currentIdentity()));
  }, []);

  useEffect(() => {
    const verify = () => { void refreshIdentity().then(() => { refresh(); setReady(true); }); };
    verify();
    const interval = window.setInterval(verify, 60000);
    window.addEventListener("focus", verify);
    window.addEventListener(PROFILE_EVENT, refresh);
    window.addEventListener("storage", verify);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", verify);
      window.removeEventListener(PROFILE_EVENT, refresh);
      window.removeEventListener("storage", verify);
    };
  }, [refresh]);

  const saveProfile = useCallback(async (next: UserProfile, completeOnboarding = false) => {
    if (!currentIdentity()) { window.location.assign("/anmelden?next=/profil"); throw new Error("Bitte melde dich an."); }
    let coverMediaId = next.coverImage?.startsWith("/api/v1/media/") ? next.coverImage.split("/").at(-1) : null;
    if (next.coverImage?.startsWith("data:")) {
      const image = await (await fetch(next.coverImage)).blob();
      const response = await fetch("/api/v1/media", { method: "POST", headers: { "Content-Type": image.type }, body: image });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Bild konnte nicht gespeichert werden.");
      coverMediaId = result.id;
    }
    await api("/me", { method: "PATCH", body: { name: next.name, emoji: next.emoji, bio: next.bio, city: next.city, postalCode: next.postalCode, coverMediaId,
      emailNotifications: next.notifyOnMessage, ...(completeOnboarding ? { onboardingCompleted: true } : {}) } });
    await refreshIdentity();
    setProfile(readProfile());
    invalidateApi();
  }, []);

  const logout = useCallback(() => {
    void endSession().catch(() => window.alert("Abmeldung fehlgeschlagen. Bitte erneut versuchen."));
  }, []);

  const login = useCallback(() => {
    window.location.assign("/anmelden");
  }, []);

  const deleteAccount = useCallback(() => {
    void endSession(true).catch(() => window.alert("Abmeldung fehlgeschlagen. Bitte erneut versuchen."));
  }, []);

  return {
    profile,
    onboardingCompleted: currentIdentity()?.onboardingCompleted ?? false,
    signedIn,
    ready,
    saveProfile,
    logout,
    login,
    deleteAccount,
  };
}
