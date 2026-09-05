"use client";

import { PrivacyConsentProvider } from "@/components/PrivacyConsent";
import { MobileNavProvider } from "@/components/MobileNav";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return <PrivacyConsentProvider><MobileNavProvider>{children}</MobileNavProvider></PrivacyConsentProvider>;
}
