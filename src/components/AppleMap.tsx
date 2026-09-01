"use client";

import { useEffect, useRef, useState } from "react";

type MapkitMap = {
  addAnnotation: (annotation: unknown) => void;
  destroy?: () => void;
};

type MapkitNs = {
  Map: (new (
    el: HTMLElement,
    options: {
      center: unknown;
      cameraDistance?: number;
      isZoomEnabled?: boolean;
      isScrollEnabled?: boolean;
      showsMapTypeControl?: boolean;
      showsCompass?: string;
      colorScheme?: string;
      mapType?: string;
    },
  ) => MapkitMap) & {
    MapTypes?: { MutedStandard?: string };
    ColorSchemes?: { Light?: string };
  };
  Coordinate: new (lat: number, lng: number) => unknown;
  MarkerAnnotation: new (
    coord: unknown,
    options: { title?: string; color?: string },
  ) => unknown;
  FeatureVisibility?: { Hidden?: string };
};

declare global {
  interface Window {
    mapkit?: MapkitNs;
    initUsedFruitMapKit?: () => void;
  }
}

let mapkitLoad: Promise<void> | null = null;

function appleMapsUrl(lat: number, lng: number, label: string) {
  const q = encodeURIComponent(label);
  return `https://maps.apple.com/?ll=${lat},${lng}&q=${q}&z=14`;
}

function loadMapKit(token: string) {
  if (window.mapkit?.Map) return Promise.resolve();
  if (mapkitLoad) return mapkitLoad;

  mapkitLoad = new Promise<void>((resolve, reject) => {
    window.initUsedFruitMapKit = () => resolve();
    const existing = document.querySelector<HTMLScriptElement>("script[data-uf-mapkit]");
    if (existing) {
      if (window.mapkit?.Map) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.apple-mapkit.com/mk/6/mapkit.core.js";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.dataset.ufMapkit = "1";
    script.dataset.callback = "initUsedFruitMapKit";
    script.dataset.libraries = "map,annotations";
    script.dataset.token = token;
    script.dataset.language = "de";
    script.onerror = () => {
      mapkitLoad = null;
      reject(new Error("MapKit JS konnte nicht geladen werden."));
    };
    document.head.appendChild(script);
  });

  return mapkitLoad;
}

export function AppleMap({
  lat,
  lng,
  label,
  exactAddress = false,
}: {
  lat: number;
  lng: number;
  label: string;
  exactAddress?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const mapsHref = appleMapsUrl(lat, lng, label);

  useEffect(() => {
    let cancelled = false;
    let map: MapkitMap | null = null;

    const start = async () => {
      const res = await fetch("/api/mapkit-token").catch(() => null);
      const token = res?.ok ? (await res.text()).trim() : "";
      if (!token || cancelled || !hostRef.current) return;

      try {
        await loadMapKit(token);
        if (cancelled || !hostRef.current || !window.mapkit) return;

        const center = new window.mapkit.Coordinate(lat, lng);
        map = new window.mapkit.Map(hostRef.current, {
          center,
          cameraDistance: 1800,
          isZoomEnabled: true,
          isScrollEnabled: true,
          showsMapTypeControl: false,
          showsCompass: window.mapkit.FeatureVisibility?.Hidden ?? "Hidden",
          colorScheme: window.mapkit.Map.ColorSchemes?.Light ?? "light",
          mapType: window.mapkit.Map.MapTypes?.MutedStandard ?? "mutedStandard",
        });
        map.addAnnotation(
          new window.mapkit.MarkerAnnotation(center, {
            color: "#0071e3",
          }),
        );
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(false);
      }
    };

    void start();
    return () => {
      cancelled = true;
      setReady(false);
      map?.destroy?.();
    };
  }, [lat, lng, label]);

  return (
    <div className="overflow-hidden rounded-3xl bg-[#e8e8ed]">
      <div className="relative h-[220px] w-full">
        <div ref={hostRef} className="absolute inset-0" />
        {!ready && (
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(180deg,#edf3e8_0%,#e4ead8_42%,#d5e0d0_100%)]"
          >
            <span className="text-[28px] leading-none">📍</span>
            <span className="mt-2 text-[13px] font-medium text-uf-text">{label}</span>
            <span className="mt-1 text-[12px] text-uf-text-secondary">In Apple Maps öffnen</span>
          </a>
        )}
        {ready && (
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="absolute right-3 bottom-3 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-medium text-uf-text shadow-[0_1px_4px_rgba(0,0,0,0.12)] hover:bg-white"
          >
            In Apple Maps öffnen
          </a>
        )}
      </div>
      <div className="space-y-1 px-4 py-2.5">
        <p className="text-[13px] text-uf-text-secondary">{label}</p>
        <p className="text-[12px] leading-snug text-uf-text-tertiary">
          {exactAddress
            ? "Die Straße ist angegeben und wird veröffentlicht."
            : "Der Punkt zeigt nur Stadt und PLZ, nie die genaue Adresse. Für den Treffpunkt nimm direkt Kontakt auf."}
        </p>
      </div>
    </div>
  );
}
