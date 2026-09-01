"use client";

import { CONDITIONS } from "@/data/catalog";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function ConditionHint({ currentId }: { currentId?: string }) {
  const [open, setOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;

    const update = () => {
      const root = rootRef.current;
      const tip = root?.querySelector("[role=tooltip]");
      if (!root || !(tip instanceof HTMLElement)) return;
      const rect = root.getBoundingClientRect();
      const needed = Math.min(tip.scrollHeight, window.innerHeight * 0.5) + 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setFlipUp(spaceBelow < needed && spaceAbove > spaceBelow);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Was bedeuten die Zustände?"
        onClick={() => setOpen((value) => !value)}
        className="ml-1 border-0 bg-transparent p-0 font-[inherit] text-[inherit] font-normal leading-[inherit] tracking-[inherit] text-uf-text-secondary hover:text-uf-text"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className={`absolute left-0 z-30 w-[min(92vw,300px)] max-h-[min(50vh,380px)] overflow-y-auto rounded-xl border border-uf-border bg-white px-3 py-2.5 text-left font-normal tracking-normal shadow-lg ${
            flipUp ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
          }`}
        >
          <ul className="space-y-2">
            {CONDITIONS.map((item) => (
              <li
                key={item.id}
                className={
                  item.id === currentId
                    ? "-mx-1 rounded-lg bg-uf-bg-subtle px-1.5 py-1.5"
                    : ""
                }
              >
                <span className="block text-[13px] font-medium text-uf-text">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-uf-text-secondary">
                  {item.hint}
                </span>
              </li>
            ))}
          </ul>
        </span>
      )}
    </span>
  );
}
