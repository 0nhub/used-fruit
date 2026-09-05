"use client";

import { PrivacyConsentProvider } from "@/components/PrivacyConsent";
import { MobileNavProvider } from "@/components/MobileNav";
import { WelcomeProfile } from "@/components/WelcomeProfile";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return <PrivacyConsentProvider><MobileNavProvider>{children}<WelcomeProfile /></MobileNavProvider></PrivacyConsentProvider>;
}
