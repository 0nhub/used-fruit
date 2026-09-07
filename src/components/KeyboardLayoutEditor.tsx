"use client";

import { KEYBOARD_LAYOUTS, hasValidKeyboard } from "@/lib/keyboard";
import type { KeyboardLayoutId, Listing } from "@/lib/types";
import { useListings } from "@/lib/useListings";
import { useState } from "react";
import { showApiError } from "@/lib/apiClient";

export function KeyboardLayoutEditor({ listing }: { listing: Listing }) {
  const { updateListing } = useListings();
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<KeyboardLayoutId | "">(listing.keyboardLayout ?? "");
  const [details, setDetails] = useState(listing.keyboardLayoutDetails ?? "");
  return (
    <div>
      <button type="button" className="text-[13px] text-uf-link hover:underline"
        onClick={() => { setLayout(listing.keyboardLayout ?? ""); setDetails(listing.keyboardLayoutDetails ?? ""); setOpen(true); }}>
        Tastaturlayout bearbeiten
      </button>
      {open && (
        <form className="mt-3 space-y-3 rounded-xl border border-uf-border p-3" onSubmit={async (event) => {
          event.preventDefault();
          if (!hasValidKeyboard({ keyboardLayout: layout || undefined, keyboardLayoutDetails: details })) return;
          try { await updateListing(listing.id, { keyboardLayout: layout || undefined, keyboardLayoutDetails: layout === "other" ? details.trim() : undefined });
          setOpen(false); } catch(error) { showApiError(error); }
        }}>
          <label className="block text-[14px]">Tastaturlayout
            <select className="mt-1 block w-full rounded-lg border border-uf-border bg-uf-bg p-2" required value={layout}
              onChange={(event) => { setLayout(event.target.value as KeyboardLayoutId); setDetails(""); }}>
              <option value="">Bitte auswählen</option>
              {KEYBOARD_LAYOUTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <p className="text-[13px] text-uf-text-secondary">Gemeint sind die aufgedruckten Tasten, nicht die macOS-Sprache.</p>
          {layout === "other" && <label className="block text-[14px]">Land / Variante und Tastenanordnung
            <input className="mt-1 block w-full rounded-lg border border-uf-border p-2" required maxLength={100}
              value={details} onChange={(event) => setDetails(event.target.value)} />
          </label>}
          <div className="flex gap-4 text-[14px]">
            <button type="submit" className="text-uf-link disabled:opacity-40"
              disabled={!hasValidKeyboard({ keyboardLayout: layout || undefined, keyboardLayoutDetails: details })}>Tastatur speichern</button>
            <button type="button" onClick={() => setOpen(false)}>Abbrechen</button>
          </div>
        </form>
      )}
    </div>
  );
}
