"use client";

import { DemoListingMark } from "@/components/DemoListingMark";

interface ProductImageProps {
  src?: string;
  className?: string;
  alt?: string;
  demo?: boolean;
  compact?: boolean;
}

export function ProductImage({ src, className, alt = "", demo, compact }: ProductImageProps) {
  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden bg-uf-bg-subtle ${className ?? ""}`}
      style={{ aspectRatio: "3 / 2" }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-contain" />
      ) : null}
      {demo ? <DemoListingMark compact={compact} /> : null}
    </div>
  );
}
