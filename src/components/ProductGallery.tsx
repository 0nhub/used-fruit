"use client";

import { ProductImage } from "@/components/ProductImage";
import { useCatalogPhotos } from "@/lib/useCatalogPhotos";
import { useState } from "react";

export function ProductGallery({
  modelId,
  colorId,
  alt,
}: {
  modelId: string;
  colorId: string;
  alt: string;
}) {
  const { photosFor } = useCatalogPhotos();
  const photos = photosFor(modelId, colorId);
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return <ProductImage modelId={modelId} colorId={colorId} alt={alt} />;
  }

  return (
    <div>
      <div
        className="uf-scroll-hidden flex snap-x snap-mandatory overflow-x-auto"
        onScroll={(event) => {
          const el = event.currentTarget;
          if (el.clientWidth === 0) return;
          setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative w-full shrink-0 snap-center bg-white"
            style={{ aspectRatio: "3 / 2" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={alt}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 py-3">
          {photos.map((photo, index) => (
            <span
              key={photo.id}
              className={`h-1.5 w-1.5 rounded-full ${
                index === active ? "bg-uf-text" : "bg-uf-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
