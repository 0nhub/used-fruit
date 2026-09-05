"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

interface HeaderProps {
  onHome?: () => void;
  mobileSort?: ReactNode;
}

export function Header({ onHome, mobileSort }: HeaderProps) {
  return <SiteHeader onLogoClick={onHome} mobileSort={mobileSort} />;
}
