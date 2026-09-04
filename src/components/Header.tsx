"use client";

import { SiteHeader } from "@/components/SiteHeader";

interface HeaderProps {
  onHome?: () => void;
}

export function Header({ onHome }: HeaderProps) {
  return <SiteHeader onLogoClick={onHome} />;
}
