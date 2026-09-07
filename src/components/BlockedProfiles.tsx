"use client";

import { useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMessages } from "@/lib/useMessages";
import { refreshIdentity } from "@/lib/authClient";

export function BlockSellerButton({ name, userId }: { name: string; userId: string }) {
  const { block } = useMessages();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  return <>
  <button type="button" className="cursor-pointer text-[14px] text-uf-link" onClick={async () => {
    if (!await refreshIdentity()) {
      window.location.assign(`/anmelden?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    dialog.current?.showModal();
  }}>Nutzer blockieren</button>
  <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId}
    className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-sm rounded-2xl border border-uf-border-soft bg-white p-5 text-uf-text shadow-xl backdrop:bg-black/30">
    <h2 id={titleId} className="text-[17px] font-semibold">{name} blockieren?</h2>
    <p id={descriptionId} className="mt-2 text-[14px] text-uf-text-secondary">
      Das Profil und seine Inserate werden ausgeblendet. Du kannst die Blockierung später in deinem Konto aufheben.
    </p>
    <div className="mt-5 flex justify-end gap-2">
      <button type="button" autoFocus onClick={() => dialog.current?.close()} className="min-h-11 rounded-full bg-uf-bg-subtle px-4 text-[13px] text-uf-text">Abbrechen</button>
      <button type="button" onClick={async () => {
        if (!await block(userId)) return;
        dialog.current?.close();
        router.push("/");
      }} className="min-h-11 rounded-full bg-uf-text px-4 text-[13px] text-white">Blockieren</button>
    </div>
  </dialog>
  </>;
}

export function BlockedProfiles() {
  const { blocked, unblock, blockedName } = useMessages();
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button type="button" onClick={() => dialog.current?.showModal()} className="flex w-full items-center justify-between text-left text-[15px] text-uf-text">
      <span>Blockierte Profile</span><span className="text-uf-text-secondary">{blocked.length}</span>
    </button>
    <dialog ref={dialog} aria-labelledby="blocked-profiles-title" className="fixed inset-0 m-auto max-h-[80dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-uf-border-soft bg-white p-5 backdrop:bg-black/30">
      <div className="flex items-center justify-between gap-3">
        <h2 id="blocked-profiles-title" className="text-[17px] font-semibold">Blockierte Profile</h2>
        <button type="button" onClick={() => dialog.current?.close()} className="rounded-full bg-uf-bg-subtle px-3 py-2 text-[13px]">Schließen</button>
      </div>
      <p className="mt-3 text-[13px] text-uf-text-secondary">Diese Anbieter und ihre Inserate sind auf allen deinen Geräten ausgeblendet.</p>
      {blocked.length ? <ul className="mt-4 divide-y divide-uf-border-soft">{blocked.map(name => <li key={name} className="flex items-center justify-between gap-3 py-3">
        <span className="min-w-0 break-words capitalize">{blockedName(name)}</span>
        <button type="button" onClick={() => unblock(name)} className="shrink-0 text-[13px] text-uf-link">Entblockieren</button>
      </li>)}</ul> : <p className="mt-5 text-[14px] text-uf-text-secondary">Keine blockierten Profile.</p>}
    </dialog>
  </>;
}
