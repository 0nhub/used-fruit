import { DemoListingMark } from "@/components/DemoListingMark";
import { getColor, getModelById } from "@/data/catalog";
import type { CategoryId } from "@/lib/types";

export const DEMO_SLIDE_COUNT = 3;

const SLIDE_LABEL = ["Vorderseite", "Rückseite", "Seite"];

function wallpaper(seed: string) {
  const n = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const hues = [200, 280, 40, 160, 320, 20];
  const h1 = hues[n % hues.length];
  const h2 = hues[(n + 2) % hues.length];
  return {
    a: `hsl(${h1} 70% 62%)`,
    b: `hsl(${h2} 65% 55%)`,
    c: `hsl(${(h1 + 40) % 360} 80% 70%)`,
  };
}

function Front({ category, color, seed }: { category: CategoryId; color: string; seed: string }) {
  const tone = wallpaper(seed);
  if (category === "iphone") {
    return (
      <>
        <rect x="138" y="18" width="84" height="196" rx="16" fill={color} />
        <rect x="144" y="26" width="72" height="180" rx="12" fill={tone.a} />
        <rect x="162" y="32" width="36" height="7" rx="3.5" fill="#1d1d1f" />
      </>
    );
  }
  if (category === "ipad") {
    return (
      <>
        <rect x="88" y="22" width="184" height="184" rx="16" fill={color} />
        <rect x="98" y="32" width="164" height="164" rx="8" fill={tone.c} />
        <circle cx="180" cy="188" r="3" fill="#6e6e73" />
      </>
    );
  }
  return (
    <>
      <rect x="48" y="28" width="264" height="158" rx="10" fill={color} />
      <rect x="58" y="38" width="244" height="132" rx="4" fill={tone.b} />
      <rect x="30" y="186" width="300" height="10" rx="2" fill={color} />
    </>
  );
}

function Back({ category, color }: { category: CategoryId; color: string }) {
  if (category === "iphone") {
    return (
      <>
        <rect x="138" y="18" width="84" height="196" rx="16" fill={color} />
        <rect x="150" y="36" width="28" height="28" rx="8" fill="#1d1d1f" />
        <circle cx="158" cy="46" r="4" fill="#3a3a3c" />
        <circle cx="170" cy="54" r="3" fill="#3a3a3c" />
      </>
    );
  }
  if (category === "ipad") {
    return (
      <>
        <rect x="88" y="22" width="184" height="184" rx="16" fill={color} />
        <circle cx="180" cy="114" r="10" fill="#1d1d1f" />
      </>
    );
  }
  return (
    <>
      <rect x="48" y="36" width="264" height="168" rx="12" fill={color} />
      <circle cx="180" cy="120" r="16" fill="#1d1d1f" />
      <circle cx="180" cy="120" r="6" fill="#3a3a3c" />
    </>
  );
}

function Side({ category, color, seed }: { category: CategoryId; color: string; seed: string }) {
  const tone = wallpaper(seed);
  if (category === "iphone") {
    return (
      <>
        <rect x="156" y="18" width="48" height="196" rx="12" fill={color} />
        <rect x="162" y="28" width="28" height="176" rx="6" fill={tone.a} />
      </>
    );
  }
  if (category === "ipad") {
    return (
      <>
        <rect x="132" y="22" width="96" height="184" rx="14" fill={color} />
        <rect x="142" y="34" width="68" height="160" rx="6" fill={tone.c} />
      </>
    );
  }
  return (
    <>
      <rect x="70" y="78" width="220" height="18" rx="4" fill={color} />
      <rect x="78" y="84" width="190" height="8" rx="2" fill={tone.b} />
      <rect x="40" y="96" width="280" height="8" rx="2" fill={color} />
    </>
  );
}

export function DemoDeviceSlide({
  modelId,
  colorId,
  view,
  demo = false,
  compact = false,
  className,
}: {
  modelId: string;
  colorId: string;
  view: number;
  demo?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const model = getModelById(modelId);
  const color = getColor(modelId, colorId)?.hex ?? "#C0C0C5";
  const category = (model?.categoryId ?? "mac") as CategoryId;
  const seed = `${modelId}-${colorId}`;
  const index = view % DEMO_SLIDE_COUNT;
  const art =
    index === 1 ? (
      <Back category={category} color={color} />
    ) : index === 2 ? (
      <Side category={category} color={color} seed={seed} />
    ) : (
      <Front category={category} color={color} seed={seed} />
    );

  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden bg-white ${className ?? ""}`}
      style={{ aspectRatio: "3 / 2" }}
    >
      <svg viewBox="0 0 360 240" className="absolute inset-0 h-full w-full" aria-hidden>
        {art}
      </svg>
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-uf-text-secondary">
        {SLIDE_LABEL[index]}
      </span>
      {demo ? <DemoListingMark compact={compact} /> : null}
    </div>
  );
}
