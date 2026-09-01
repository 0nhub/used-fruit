"use client";

import {
  WEEKDAYS_DE,
  addMonthsToDate,
  calendarCells,
  formatIsoLongDe,
  formatIsoToDe,
  parseFlexibleDate,
} from "@/lib/dateInput";
import { useEffect, useRef, useState } from "react";

const PRESETS = [
  { label: "3 Monate", months: 3 },
  { label: "6 Monate", months: 6 },
  { label: "1 Jahr", months: 12 },
  { label: "2 Jahre", months: 24 },
] as const;

export function DateField({
  value,
  onChange,
  label,
  className,
  onEnter,
}: {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
  className?: string;
  onEnter?: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(value ? formatIsoToDe(value) : "");
  const [open, setOpen] = useState(false);
  const parsed = value || parseFlexibleDate(text, "live");
  const view = parsed
    ? new Date(`${parsed}T00:00:00`)
    : new Date();
  const [cursor, setCursor] = useState({
    year: view.getFullYear(),
    month: view.getMonth() + 1,
  });

  useEffect(() => {
    if (!value) return;
    setText(formatIsoToDe(value));
    const date = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      setCursor({ year: date.getFullYear(), month: date.getMonth() + 1 });
    }
  }, [value]);

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const commit = (iso: string) => {
    if (!iso) return;
    onChange(iso);
    setText(formatIsoToDe(iso));
    const date = new Date(`${iso}T00:00:00`);
    setCursor({ year: date.getFullYear(), month: date.getMonth() + 1 });
  };

  const applyText = () => {
    const iso = parseFlexibleDate(text);
    if (iso) commit(iso);
    else if (value) setText(formatIsoToDe(value));
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(cursor.year, cursor.month - 1 + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() + 1 });
  };

  const monthTitle = new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
  }).format(new Date(cursor.year, cursor.month - 1, 1));

  return (
    <div ref={rootRef} className="relative">
      {label && (
        <label className="text-[12px] tracking-wide text-uf-text-secondary uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={className}
          value={text}
          inputMode="text"
          autoComplete="off"
          placeholder="15.03.2027 oder März 2027"
          onChange={(event) => {
            setText(event.target.value);
            const iso = parseFlexibleDate(event.target.value, "live");
            if (iso) onChange(iso);
          }}
          onBlur={applyText}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyText();
              setOpen(false);
              onEnter?.();
            }
            if (event.key === "Escape") setOpen(false);
          }}
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-uf-text-secondary hover:bg-uf-bg-subtle hover:text-uf-text"
          aria-label="Kalender öffnen"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((current) => !current)}
        >
          <CalendarGlyph />
        </button>
      </div>

      {parsed && (
        <p className="mt-1.5 text-[13px] text-uf-text-secondary">{formatIsoLongDe(parsed)}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="h-8 rounded-full border border-uf-border bg-white px-3 text-[13px] text-uf-text hover:bg-uf-bg-subtle"
            onClick={() => commit(addMonthsToDate(new Date(), preset.months))}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-uf-border bg-white p-3 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-uf-text-secondary hover:bg-uf-bg-subtle"
              aria-label="Vorheriger Monat"
              onClick={() => shiftMonth(-1)}
            >
              ‹
            </button>
            <p className="text-[14px] font-medium capitalize">{monthTitle}</p>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-uf-text-secondary hover:bg-uf-bg-subtle"
              aria-label="Nächster Monat"
              onClick={() => shiftMonth(1)}
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-uf-text-tertiary">
            {WEEKDAYS_DE.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {calendarCells(cursor.year, cursor.month).map((cell, index) =>
              cell ? (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => {
                    commit(cell.iso);
                    setOpen(false);
                  }}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] ${
                    cell.iso === parsed
                      ? "bg-uf-text text-white"
                      : "text-uf-text hover:bg-uf-bg-subtle"
                  }`}
                >
                  {cell.day}
                </button>
              ) : (
                <span key={`empty-${index}`} />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
