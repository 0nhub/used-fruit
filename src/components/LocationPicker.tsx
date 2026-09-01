"use client";

import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { LocationIcon } from "@/components/icons";
import { RADIUS_OPTIONS } from "@/data/catalog";
import { formatPlaceLabel, type Place } from "@/data/locations";
import { useEffect, useRef, useState } from "react";

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
}

export function LocationPicker({ value, onChange, align = "right" }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [draftQuery, setDraftQuery] = useState(value.query);
  const [draftRadius, setDraftRadius] = useState<number | undefined>(value.radiusKm);
  const [draftPlace, setDraftPlace] = useState<Place | undefined>(value.place);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDraftQuery(value.query);
      setDraftRadius(value.radiusKm);
      setDraftPlace(value.place);
    }
  }, [open, value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const label = value.city
    ? value.city
    : value.postalCode
      ? value.postalCode
      : "Deutschland";

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
        className="flex items-center gap-1.5 text-[13px] text-uf-text-secondary hover:text-uf-text"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Standort wählen"
      >
        <span className="hidden max-w-[140px] truncate sm:inline">{label}</span>
        <LocationIcon className="h-4 w-4 shrink-0" />
      </button>

      {open && (
        <div
          className={`absolute top-[calc(100%+10px)] z-50 w-[min(92vw,320px)] rounded-2xl border border-uf-border bg-white p-4 shadow-xl ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <p className="text-[12px] tracking-wide text-uf-text-secondary uppercase">
            Dein Standort
          </p>
          <p className="mt-1 text-[13px] text-uf-text-secondary">
            PLZ oder Ort wählen. Eine Reichweite ist optional.
          </p>

          <label className="mt-4 block text-[12px] tracking-wide text-uf-text-secondary uppercase">
            PLZ / Ort
          </label>
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
            inputClassName="h-10 w-full rounded-xl border border-uf-border bg-uf-bg-subtle px-3 text-[14px] outline-none focus:border-uf-link"
            placeholder="z. B. 80331 oder München"
          />

          <label className="mt-3 block text-[12px] tracking-wide text-uf-text-secondary uppercase">
            Umkreis
          </label>
          <select
            value={draftRadius ?? ""}
            onChange={(e) => setDraftRadius(e.target.value ? Number(e.target.value) : undefined)}
            className="uf-select mt-1.5 h-10 w-[5.25rem] rounded-xl border border-uf-border bg-uf-bg-subtle pl-3 text-[14px] outline-none focus:border-uf-link"
          >
            <option value="">Keine</option>
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>

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
              className="rounded-full bg-uf-text px-4 py-2 text-[13px] font-medium text-white hover:bg-black"
            >
              Übernehmen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
