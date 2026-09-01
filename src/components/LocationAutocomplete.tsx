"use client";

import { searchPlaces, type Place } from "@/data/locations";
import { useEffect, useId, useRef, useState } from "react";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: Place) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
  required?: boolean;
}

export function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "PLZ oder Ort",
  className,
  inputClassName,
  id,
  required,
}: LocationAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const suggestions = value.trim().length >= 1 ? searchPlaces(value, 8) : [];

  useEffect(() => {
    setHighlight(0);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (place: Place) => {
    onSelect(place);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <input
        id={id}
        value={value}
        required={required}
        autoComplete="off"
        placeholder={placeholder}
        className={inputClassName}
        aria-autocomplete="list"
        aria-controls={listId}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && suggestions[highlight]) {
            e.preventDefault();
            pick(suggestions[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-xl border border-uf-border bg-white shadow-lg"
        >
          {suggestions.map((place, index) => (
            <li key={`${place.postalCode}-${place.city}-${index}`} role="option" aria-selected={index === highlight}>
              <button
                type="button"
                className={`flex w-full flex-col px-3 py-2.5 text-left text-[13px] ${
                  index === highlight ? "bg-uf-bg-subtle" : "hover:bg-uf-bg-subtle"
                }`}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(place)}
              >
                <span className="font-medium text-uf-text">
                  {place.postalCode} {place.city}
                </span>
                <span className="text-[12px] text-uf-text-secondary">{place.state}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
