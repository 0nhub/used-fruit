"use client";

import { usePrivacyConsent } from "@/components/PrivacyConsent";
import { createPortal } from "react-dom";
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

export function AppleMap(props: { lat: number; lng: number; label: string; exactAddress?: boolean; expanded?: boolean }) {
  const { maps, openSettings } = usePrivacyConsent();
  if (!maps) return <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-3xl bg-uf-bg-subtle p-5 text-center text-[14px]">
    <p className="font-medium">{props.label}</p>
    <p className="text-uf-text-secondary">Apple Karten sind deaktiviert. Erst mit deiner Zustimmung wird eine Verbindung zu Apple hergestellt.</p>
    <button type="button" onClick={openSettings} className="rounded-full border border-uf-border bg-white px-4 py-2">Karten-Einstellungen</button>
  </div>;
  return <EnabledAppleMap {...props} />;
}

function EnabledAppleMap({
  lat,
  lng,
  label,
  exactAddress = false,
  expanded = false,
}: {
  lat: number;
  lng: number;
  label: string;
  exactAddress?: boolean;
  expanded?: boolean;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fullscreenContentRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const mapsHref = appleMapsUrl(lat, lng, label);

  useEffect(() => {
    if (!fullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();
    fullscreenContentRef.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = previous; };
  }, [fullscreen]);

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
    <>
    <div className={expanded ? "flex min-h-0 flex-1 flex-col overflow-hidden bg-uf-bg-subtle" : "overflow-hidden rounded-3xl bg-uf-bg-subtle"}>
      <div className={expanded ? "relative min-h-0 w-full flex-1" : "relative h-[220px] w-full"}>
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

      </div>
      <div className="shrink-0 space-y-1 px-4 py-4">
        <p className="text-[13px] text-uf-text-secondary">{label}</p>
        <p className="text-[12px] leading-snug text-uf-text-tertiary">
          {exactAddress
            ? "Die Straße ist angegeben und wird veröffentlicht."
            : "Der Punkt zeigt nur Stadt und PLZ. Für den Treffpunkt nimm direkt Kontakt auf."}
        </p>
        <div className="flex gap-2 pt-3">
          {!expanded && <button type="button" onClick={() => setFullscreen(true)} className="uf-panel-action flex-1">Vollbild</button>}
          <a href={mapsHref} target="_blank" rel="noreferrer" className="uf-panel-action flex-1">Apple Maps</a>
        </div>
      </div>
    </div>
    {fullscreen && createPortal(
      <dialog ref={dialogRef} onCancel={() => setFullscreen(false)} onClose={() => setFullscreen(false)} aria-label="Karte im Vollbild"
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-white p-0 backdrop:bg-black/30">
        <div ref={fullscreenContentRef} tabIndex={-1} className="relative flex h-full flex-col pb-[env(safe-area-inset-bottom)] outline-none">
          <button type="button" aria-label="Karte schließen" onClick={() => setFullscreen(false)}
            className="absolute left-[calc(env(safe-area-inset-left)+16px)] top-[calc(env(safe-area-inset-top)+16px)] z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/95 text-uf-text shadow-md backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uf-text focus-visible:ring-offset-2">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <AppleMap lat={lat} lng={lng} label={label} exactAddress={exactAddress} expanded />
        </div>
      </dialog>, document.body)}
    </>
  );
}
