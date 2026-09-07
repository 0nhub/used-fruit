"use client";

import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { RADIUS_OPTIONS } from "@/data/catalog";
import { formatPlaceLabel, type Place } from "@/data/locations";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface UserLocation {
  query: string;
  city?: string;
  postalCode?: string;
  radiusKm?: number;
  place?: Place;
}

interface LocationPickerProps {
  value: UserLocation;
  onChange: (next: UserLocation) => void;
  align?: "left" | "right";
  variant?: "toolbar" | "pill";
}

function summary(value: UserLocation) {
  const place = value.city || value.postalCode || value.query.trim();
  if (!place) return "Ort wählen";
  return value.radiusKm ? `${place} · ${value.radiusKm} km` : place;
}

export function LocationPicker({ value, onChange, align = "right", variant = "toolbar" }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [draftQuery, setDraftQuery] = useState(value.query);
  const [draftRadius, setDraftRadius] = useState<number | undefined>(value.radiusKm);
  const [draftPlace, setDraftPlace] = useState<Place | undefined>(value.place);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const current = valueRef.current;
    setDraftQuery(current.query);
    setDraftRadius(current.radiusKm);
    setDraftPlace(current.place);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setPanelPos(null);
      return;
    }
    const placePanel = () => {
      const trigger = rootRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(window.innerWidth * 0.92, 320);
      const left = Math.max(
        12,
        Math.min(align === "left" ? rect.left : rect.right - width, window.innerWidth - width - 12),
      );
      const top = Math.min(rect.bottom + 8, window.innerHeight - 12);
      setPanelPos({ top, left, width });
    };
    placePanel();
    window.addEventListener("resize", placePanel);
    window.addEventListener("scroll", placePanel, true);
    return () => {
      window.removeEventListener("resize", placePanel);
      window.removeEventListener("scroll", placePanel, true);
    };
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const apply = () => {
    onChange({
      query: draftPlace ? formatPlaceLabel(draftPlace) : draftQuery,
      city: draftPlace?.city,
      postalCode: draftPlace?.postalCode,
      radiusKm: draftRadius,
      place: draftPlace,
    });
    setOpen(false);
  };

  const reset = () => {
    onChange({ query: "" });
    setDraftQuery("");
    setDraftPlace(undefined);
    setDraftRadius(undefined);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          variant === "pill"
            ? "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-uf-bg-subtle px-2.5 text-[13px] font-medium leading-5 text-uf-text"
            : "relative inline-flex items-center gap-1.5 py-0.5 text-[12px] leading-5 text-uf-text"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Standort und Umkreis"
      >
        {variant === "pill" ? (
          <>
            <span className="whitespace-nowrap">{summary(value)}</span>
            <svg aria-hidden="true" width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m2 5 3-3 3 3M2 9l3 3 3-3" />
            </svg>
          </>
        ) : (
          <>
            <span className="text-uf-text-secondary">Standort</span>
            <span className="inline-flex items-center gap-1">
              <span className="whitespace-nowrap">{summary(value)}</span>
              <svg aria-hidden="true" width="8" height="5" viewBox="0 0 8 5" fill="none" className="text-uf-text-secondary">
                <path d="M1 1.15 4 3.85 7 1.15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </>
        )}
      </button>

      {open && mounted && panelPos
        ? createPortal(
            <div
              ref={panelRef}
              style={{ top: panelPos.top, left: panelPos.left, width: panelPos.width }}
              className="fixed z-[60] rounded-2xl border border-uf-border bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
            >
              <label className="block text-[12px] text-uf-text-secondary">PLZ / Ort</label>
              <LocationAutocomplete
                className="mt-1.5"
                value={draftQuery}
                onChange={(q) => {
                  setDraftQuery(q);
                  setDraftPlace(undefined);
                }}
                onSelect={(place) => {
                  setDraftPlace(place);
                  setDraftQuery(formatPlaceLabel(place));
                }}
                inputClassName="h-9 w-full rounded-lg border border-uf-border bg-uf-bg-subtle px-3 text-[13px] outline-none focus:border-uf-link"
                placeholder="z. B. Stuttgart"
              />

              <p className="mt-3 text-[12px] text-uf-text-secondary">Umkreis</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDraftRadius(undefined)}
                  className={`h-8 rounded-full px-2.5 text-[12px] ${
                    draftRadius == null ? "bg-uf-text text-white" : "bg-uf-bg-subtle text-uf-text"
                  }`}
                >
                  Keine
                </button>
                {RADIUS_OPTIONS.map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => setDraftRadius(radius)}
                    className={`h-8 rounded-full px-2.5 text-[12px] ${
                      draftRadius === radius ? "bg-uf-text text-white" : "bg-uf-bg-subtle text-uf-text"
                    }`}
                  >
                    {radius} km
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="text-[13px] text-uf-text-secondary hover:text-uf-text"
                >
                  Zurücksetzen
                </button>
                <button
                  type="button"
                  onClick={apply}
                  className="rounded-full bg-uf-action px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-uf-link"
                >
                  Übernehmen
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
