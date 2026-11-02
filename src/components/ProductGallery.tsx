"use client";

import { DEMO_SLIDE_COUNT, DemoDeviceSlide } from "@/components/DemoDeviceSlides";
import { ProductImage } from "@/components/ProductImage";
import { listingPhotoUrl } from "@/lib/listingPhotos";
import { useState, type ReactNode } from "react";

function Arrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const label = direction === "prev" ? "Vorheriges Bild" : "Nächstes Bild";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-uf-text shadow-sm hover:bg-white ${
        direction === "prev" ? "left-3" : "right-3"
      }`}
    >
      <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
        <path
          d={direction === "prev" ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function Carousel({ slides, label }: { slides: { key: string; node: ReactNode }[]; label: string }) {
  const [active, setActive] = useState(0);
  const count = slides.length;
  const index = ((active % count) + count) % count;
  const showControls = count > 1;

  return (
    <div>
      <div className="relative overflow-hidden bg-white" style={{ aspectRatio: "3 / 2" }}>
        <div className="absolute inset-0" aria-roledescription="Karussell" aria-label={label}>
          {slides[index]?.node}
        </div>
        {showControls ? (
          <>
            <Arrow direction="prev" onClick={() => setActive(index - 1)} />
            <Arrow direction="next" onClick={() => setActive(index + 1)} />
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {slides.map((slide, dot) => (
                <button
                  key={slide.key}
                  type="button"
                  aria-label={`Bild ${dot + 1}`}
                  aria-current={dot === index ? "true" : undefined}
                  onClick={() => setActive(dot)}
                  className={`h-1.5 w-1.5 rounded-full shadow-sm ${dot === index ? "bg-uf-text" : "bg-white"}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function ProductGallery({
  photoIds,
  photoUrls,
  modelId,
  colorId,
  alt,
  demo = false,
}: {
  photoIds?: string[];
  photoUrls?: string[];
  modelId?: string;
  colorId?: string;
  alt: string;
  demo?: boolean;
}) {
  const urls = photoUrls?.length ? photoUrls : (photoIds ?? []).map(listingPhotoUrl);

  if (urls.length > 0) {
    return (
      <Carousel
        label={alt}
        slides={urls.map((src, index) => ({
          key: src,
          node: (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={index === 0 ? alt : ""} className="h-full w-full object-contain" />
          ),
        }))}
      />
    );
  }

  if (demo && modelId && colorId) {
    return (
      <Carousel
        label={alt}
        slides={Array.from({ length: DEMO_SLIDE_COUNT }, (_, view) => ({
          key: String(view),
          node: <DemoDeviceSlide modelId={modelId} colorId={colorId} view={view} demo={demo} className="h-full" />,
        }))}
      />
    );
  }

  return <ProductImage alt={alt} demo={demo} />;
}
