"use client";

import { OverlayDialog } from "@/components/OverlayDialog";
import { useState } from "react";
import { listingNumber } from "@/lib/listingNumber";
import { LEGAL } from "@/lib/legal";

const REASONS = ["Spam oder Werbung", "Betrugsverdacht", "Falsche oder irreführende Angaben", "Unzulässiger Inhalt", "Sonstiges"];

export function ListingReport({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const number = listingNumber(listingId);
  const body = `Anzeigen-ID: ${number}\nAnzeige: https://usedfruit.de/listing/${encodeURIComponent(listingId)}\nGrund: ${reason}\n\n${details.trim()}`;
  const href = `mailto:${LEGAL.email}?subject=${encodeURIComponent(`Anzeige melden: ${number}`)}&body=${encodeURIComponent(body)}`;

  return (
    <div>
      <button type="button" className="cursor-pointer text-uf-link underline-offset-4 transition-colors duration-150 hover:text-uf-action hover:underline focus-visible:underline motion-reduce:transition-none" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        Problem melden
      </button>
      {open && (
        <OverlayDialog titleId="listing-report-title" onClose={() => setOpen(false)}>
          <h2 id="listing-report-title" className="pr-6 text-[28px] font-semibold tracking-tight">Anzeige melden</h2>
          <p className="mt-2 text-[14px] text-uf-text-secondary">Anzeigen-ID {number}</p>
          <div className="mt-7 space-y-5 text-left text-[14px]">
          <label className="block">Grund
            <select className="mt-1 w-full rounded-xl border border-uf-border bg-uf-bg-subtle p-3 text-[16px]" value={reason} onChange={(event) => setReason(event.target.value)}>
              {REASONS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">Weitere Angaben (optional)
            <textarea className="mt-1 w-full rounded-xl border border-uf-border bg-uf-bg-subtle p-3 text-[16px]" rows={3} maxLength={1500} value={details} onChange={(event) => setDetails(event.target.value)} />
          </label>
          <p className="text-[12px] text-uf-text-secondary">Öffnet dein E-Mail-Programm. Sende die vorbereitete Nachricht dort an {LEGAL.email}.</p>
          <a href={href} className="inline-flex min-h-11 items-center justify-center rounded-full bg-uf-action px-5 text-[14px] font-medium text-white hover:bg-uf-link">Meldung per E-Mail öffnen</a>
          </div>
        </OverlayDialog>
      )}
    </div>
  );
}
