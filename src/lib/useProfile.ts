"use client";

import {
  DEFAULT_PROFILE,
  PROFILE_EVENT,
  readProfile,
  writeProfile,
  type UserProfile,
} from "@/lib/profile";
import { currentIdentity, endSession, refreshIdentity } from "@/lib/authClient";
import { syncPublicSellerPage } from "@/lib/sellerPage";
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

  const saveProfile = useCallback((next: UserProfile) => {
    if (!currentIdentity()) { window.location.assign("/anmelden?next=/profil"); return; }
    const previousName = readProfile().name;
    const saved = writeProfile(next);
    if (saved.name) syncPublicSellerPage(saved, previousName);
    setProfile(saved);

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
    signedIn,
    ready,
    saveProfile,
    logout,
    login,
    deleteAccount,
  };
}
