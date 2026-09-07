"use client";

import { OverlayDialog } from "@/components/OverlayDialog";
import { useState } from "react";
import { listingNumber } from "@/lib/listingNumber";
import { api } from "@/lib/apiClient";
import { refreshIdentity } from "@/lib/authClient";

const REASONS = ["Spam oder Werbung", "Betrugsverdacht", "Falsche oder irreführende Angaben", "Unzulässiger Inhalt", "Sonstiges"];

export function ListingReport({ listingId, displayNumber }: { listingId: string; displayNumber?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const number = displayNumber ?? listingNumber(listingId);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div>
      <button type="button" className="cursor-pointer text-uf-link underline-offset-4 transition-colors duration-150 hover:text-uf-action hover:underline focus-visible:underline motion-reduce:transition-none" aria-haspopup="dialog" onClick={async () => { if (!await refreshIdentity()) { location.assign("/anmelden?next=" + encodeURIComponent(location.pathname)); return; } setOpen(true); }}>
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
          {error && <p role="alert">{error}</p>}
          {sent ? <p role="status">Danke. Deine Meldung wurde gespeichert und wird geprüft.</p> : <button type="button" onClick={async () => {
            try { await api("/reports", { method: "POST", body: { listingId, reason: reason + (details.trim() ? "\n\n" + details.trim() : "") } }); setSent(true); }
            catch(error) { setError(error instanceof Error ? error.message : "Meldung konnte nicht gespeichert werden."); }
          }} className="inline-flex min-h-11 items-center justify-center rounded-full bg-uf-action px-5 text-[14px] font-medium text-white">Meldung senden</button>}
          </div>
        </OverlayDialog>
      )}
    </div>
  );
}
