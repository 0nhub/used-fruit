"use client";

import { DemoListingMark } from "@/components/DemoListingMark";
import { getColor, getModelById } from "@/data/catalog";
import type { CategoryId } from "@/lib/types";

interface ProductImageProps {
  modelId: string;
  colorId: string;
  className?: string;
  alt?: string;
  demo?: boolean;
  compact?: boolean;
}

function wallpaper(seed: string) {
  const n = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hues = [200, 280, 40, 160, 320, 20];
  const h1 = hues[n % hues.length];
  const h2 = hues[(n + 2) % hues.length];
  return {
    a: `hsl(${h1} 70% 62%)`,
    b: `hsl(${h2} 65% 55%)`,
    c: `hsl(${(h1 + 40) % 360} 80% 70%)`,
  };
}

function MacBookArt({ color, seed }: { color: string; seed: string }) {
  const w = wallpaper(seed);
  return (
    <>
      <defs>
        <linearGradient id={`scr-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={w.a} />
          <stop offset="45%" stopColor={w.b} />
          <stop offset="100%" stopColor={w.c} />
        </linearGradient>
      </defs>
      <rect x="48" y="28" width="264" height="158" rx="10" fill={color} />
      <rect x="58" y="38" width="244" height="132" rx="4" fill={`url(#scr-${seed})`} />
      <rect x="30" y="186" width="300" height="10" rx="2" fill={color} />
      <rect x="140" y="188" width="80" height="4" rx="1" fill="#9a9aa0" opacity="0.45" />
      <ellipse cx="180" cy="208" rx="70" ry="3" fill="#000" opacity="0.08" />
    </>
  );
}

function IPhoneArt({ color, seed }: { color: string; seed: string }) {
  const w = wallpaper(seed);
  return (
    <>
      <defs>
        <linearGradient id={`ph-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={w.a} />
          <stop offset="100%" stopColor={w.b} />
        </linearGradient>
      </defs>
      <rect x="138" y="18" width="84" height="196" rx="16" fill={color} />
      <rect x="144" y="26" width="72" height="180" rx="12" fill={`url(#ph-${seed})`} />
      <rect x="162" y="32" width="36" height="7" rx="3.5" fill="#1d1d1f" opacity="0.85" />
      <ellipse cx="180" cy="220" rx="28" ry="3" fill="#000" opacity="0.08" />
    </>
  );
}

function IPadArt({ color, seed }: { color: string; seed: string }) {
  const w = wallpaper(seed);
  return (
    <>
      <defs>
        <linearGradient id={`pad-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={w.c} />
          <stop offset="100%" stopColor={w.a} />
        </linearGradient>
      </defs>
      <rect x="88" y="22" width="184" height="184" rx="16" fill={color} />
      <rect x="98" y="32" width="164" height="164" rx="8" fill={`url(#pad-${seed})`} />
      <circle cx="180" cy="188" r="3" fill="#6e6e73" />
      <ellipse cx="180" cy="216" rx="48" ry="3" fill="#000" opacity="0.08" />
    </>
  );
}

export function ProductImage({ modelId, colorId, className, demo, compact }: ProductImageProps) {
  const model = getModelById(modelId);
  const color = getColor(modelId, colorId)?.hex ?? "#C0C0C5";
  const category = (model?.categoryId ?? "mac") as CategoryId;
  const seed = `${modelId}-${colorId}`;

  let art;
  switch (category) {
    case "iphone":
      art = <IPhoneArt color={color} seed={seed} />;
      break;
    case "ipad":
      art = <IPadArt color={color} seed={seed} />;
      break;
    default:
      art = <MacBookArt color={color} seed={seed} />;
  }

  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden bg-white ${className ?? ""}`}
      style={{ aspectRatio: "3 / 2" }}
    >
      <svg
        viewBox="0 0 360 240"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {art}
      </svg>
      {demo ? <DemoListingMark compact={compact} /> : null}
    </div>
  );
}
