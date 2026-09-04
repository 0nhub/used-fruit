"use client";

import {
  DEFAULT_PROFILE,
  PROFILE_EVENT,
  readProfile,
  readSignedIn,
  wipeAllUserData,
  writeProfile,
  writeSignedIn,
  type UserProfile,
} from "@/lib/profile";
import { syncPublicSellerPage } from "@/lib/sellerPage";
import { useCallback, useEffect, useState } from "react";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setProfile(readProfile());
    setSignedIn(readSignedIn());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(PROFILE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROFILE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const saveProfile = useCallback((next: UserProfile) => {
    const previousName = readProfile().name;
    const saved = writeProfile(next);
    if (saved.name) syncPublicSellerPage(saved, previousName);
    setProfile(saved);
    writeSignedIn(true);
    setSignedIn(true);
  }, []);

  const logout = useCallback(() => {
    writeSignedIn(false);
    setSignedIn(false);
  }, []);

  const login = useCallback(() => {
    writeSignedIn(true);
    setSignedIn(true);
    setProfile(readProfile());
  }, []);

  const deleteAccount = useCallback(() => {
    wipeAllUserData();
    setProfile(DEFAULT_PROFILE);
    setSignedIn(false);
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
