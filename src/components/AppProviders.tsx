"use client";

import { MobileNavProvider } from "@/components/MobileNav";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return <MobileNavProvider>{children}</MobileNavProvider>;
}
