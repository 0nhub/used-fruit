"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Browser-wide preference: intentionally outside the account archive's used-fruit-* namespace.
const KEY = "uf-privacy-consent-v1";
const LIFETIME = 180 * 24 * 60 * 60 * 1000;
type Choice = { version: 1; maps: boolean; savedAt: number };
function readChoice(): Choice | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return value?.version === 1 && typeof value.maps === "boolean" &&
      typeof value.savedAt === "number" && value.savedAt <= Date.now() &&
      value.savedAt > Date.now() - LIFETIME ? value : null;
  } catch { return null; }
}
const Context = createContext({ maps: false, openSettings: () => {} });
export const usePrivacyConsent = () => useContext(Context);
export function CookieSettingsButton() {
  const { openSettings } = usePrivacyConsent();
  return <button type="button" onClick={openSettings} className="cursor-pointer hover:text-uf-text">Cookie-Einstellungen</button>;
}

export function PrivacyConsentProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [details, setDetails] = useState(false);
  const [maps, setMaps] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const legalPage = ["/datenschutz", "/impressum", "/agb", "/nutzerbedingungen"].includes(pathname);
  const show = ready && (editing || (!choice && !legalPage));
  const title = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const sync = () => { setChoice(readChoice()); setReady(true); };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("focus", sync); };
  }, []);
  useEffect(() => {
    if (!choice) return;
    const timer = window.setInterval(() => { if (choice.savedAt + LIFETIME <= Date.now()) setChoice(null); }, 60_000);
    return () => window.clearInterval(timer);
  }, [choice]);
  useEffect(() => { if (show) title.current?.focus({ preventScroll: true }); }, [show]);
  const openSettings = () => {
    opener.current = document.activeElement as HTMLElement;
    setMaps(choice?.maps ?? false); setDetails(true); setEditing(true);
  };
  const save = (allowMaps: boolean) => {
    const next: Choice = { version: 1, maps: allowMaps, savedAt: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(next)); setStorageError(false); }
    catch { setStorageError(true); }
    setChoice(next); setEditing(false); setDetails(false);
    opener.current?.focus();
  };
  const buttonClass = "min-h-11 rounded-full border border-uf-border bg-white px-4 py-2 text-[14px] font-medium text-uf-text hover:bg-uf-bg-subtle";
  return <Context.Provider value={{ maps: choice?.maps ?? false, openSettings }}>
    {children}
    {storageError && <p role="status" className="fixed bottom-0 z-[100] bg-white p-3 text-[13px]">Dein Browser konnte die Auswahl nicht speichern. Sie gilt nur für diese geöffnete Seite.</p>}
    {show && <section role="dialog" aria-modal="false" aria-labelledby="privacy-title" aria-describedby="privacy-description"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-h-[85dvh] max-w-xl overflow-y-auto rounded-2xl border border-uf-border bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl"
      onKeyDown={(event) => { if (event.key === "Escape") { if (editing && choice) { setEditing(false); opener.current?.focus(); } else save(false); } }}>
      <h2 ref={title} tabIndex={-1} id="privacy-title" className="text-[19px] font-semibold outline-none">Cookies & Datenschutz</h2>
      <p id="privacy-description" className="mt-2 text-[14px] text-uf-text-secondary">Wir speichern notwendige Daten für Anmeldung, deine genutzten Funktionen und diese Auswahl. Apple Karten laden wir nur mit deiner Zustimmung. Dabei erhält Apple unter anderem deine IP-Adresse und den angezeigten Kartenort. Wir setzen keine Analyse- oder Werbe-Tracker ein.</p>
      <p className="mt-2 text-[13px] text-uf-text-secondary">Du kannst die Seite auch ohne optionale Dienste nutzen und deine Auswahl jederzeit über „Cookie-Einstellungen“ ändern. Sie wird für 180 Tage auf diesem Gerät gespeichert.</p>
      <p className="mt-2 flex gap-4 text-[13px]"><Link href="/datenschutz" onClick={() => setEditing(false)} className="underline">Datenschutz</Link><Link href="/impressum" onClick={() => setEditing(false)} className="underline">Impressum</Link></p>
      {details && <div className="my-4 space-y-3 text-[14px]">
        <p><strong>Notwendig – immer aktiv</strong><br />Sichere Anmeldung, lokale Entwürfe, Favoriten, Nachrichten, Profil und Einstellungen für die von dir genutzten Funktionen.</p>
        <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={maps} onChange={(event) => setMaps(event.target.checked)} className="mt-1 h-4 w-4 shrink-0" /><span><strong>Externe Karten: Apple Karten</strong><br />Interaktive Karten von Apple. Datenverarbeitung kann auch außerhalb der EU stattfinden. Ohne Zustimmung zeigen wir nur den Ortsnamen. Bereits übermittelte Daten lassen sich durch einen Widerruf nicht zurückholen.</span></label>
        <a className="inline-block underline" href="https://www.apple.com/legal/privacy/data/de/apple-maps/" target="_blank" rel="noreferrer">Datenschutz bei Apple Karten</a>
      </div>}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" className={buttonClass} onClick={() => save(false)}>Nur notwendige</button>
        <button type="button" className={buttonClass} onClick={() => save(true)}>Alle erlauben</button>
        {details ? <button type="button" className={`${buttonClass} sm:col-span-2`} onClick={() => save(maps)}>Auswahl speichern</button> : <button type="button" className={`${buttonClass} sm:col-span-2`} onClick={() => { setMaps(choice?.maps ?? false); setDetails(true); }}>Einstellungen anpassen</button>}
      </div>
    </section>}
  </Context.Provider>;
}
