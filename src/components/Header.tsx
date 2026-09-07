"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

interface HeaderProps {
  onHome?: () => void;
  mobileSort?: ReactNode;
  desktopRail?: boolean;
}

export function Header({ onHome, mobileSort, desktopRail }: HeaderProps) {
  return <SiteHeader onLogoClick={onHome} mobileSort={mobileSort} desktopRail={desktopRail} />;
}
