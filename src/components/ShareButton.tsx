"use client";

import { ShareIcon } from "@/components/icons";
import { formatListingName, formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

async function shareNative(title: string, text: string, url: string) {
  if (typeof navigator.share !== "function") return false;
  const attempts: ShareData[] = [{ url }, { title, url }, { title, text, url }];
  for (const data of attempts) {
    try {
      if (typeof navigator.canShare === "function" && !navigator.canShare(data)) continue;
      await navigator.share(data);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return true;
    }
  }
  return false;
}

export function ShareButton({ listing }: { listing: Listing }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const title = `${formatListingName(listing)} · Used Fruit`;
  const text = `${formatListingName(listing)} für ${formatPrice(listing.price)}`;

  const payload = () => {
    const url = window.location.href;
    return { title, text, url, message: `${text}\n${url}` };
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const copyLink = async () => {
    const { url } = payload();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 900);
  };

  const sheet = open && mounted && createPortal(
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            aria-label="Schließen"
            className="absolute inset-0 bg-black/25"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[360px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-0">
            <div className="overflow-hidden rounded-t-[28px] bg-white/95 shadow-[0_-8px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:rounded-[22px] sm:shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
              <div className="flex items-center gap-3 border-b border-uf-border-soft px-4 py-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-uf-bg-subtle text-[13px] font-semibold text-uf-text">
                  UF
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-uf-text">{title}</p>
                  <p className="truncate text-[12px] text-uf-text-tertiary">usedfruit</p>
                </div>
              </div>

              <div className="flex gap-5 overflow-x-auto px-5 py-5">
                <ShareAction
                  label="Nachrichten"
                  href={
                    /iPad|iPhone|iPod/.test(navigator.userAgent)
                      ? `sms:&body=${encodeURIComponent(payload().message)}`
                      : `sms:?body=${encodeURIComponent(payload().message)}`
                  }
                  tone="bg-[#34c759]"
                  onClick={() => setOpen(false)}
                >
                  <BubbleIcon />
                </ShareAction>
                <ShareAction
                  label="Mail"
                  href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(payload().message)}`}
                  tone="bg-[#007aff]"
                  onClick={() => setOpen(false)}
                >
                  <MailIcon />
                </ShareAction>
                <ShareAction label={copied ? "Kopiert" : "Kopieren"} tone="bg-[#8e8e93]" onClick={copyLink}>
                  <CopyIcon />
                </ShareAction>
              </div>
            </div>
          </div>
        </div>,
    document.body,
  );

  return (
    <>
      <button
        type="button"
        aria-label="Teilen"
        aria-expanded={open}
        onClick={async () => {
          const { title: shareTitle, text: shareText, url } = payload();
          if (await shareNative(shareTitle, shareText, url)) return;
          setOpen(true);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full text-uf-text-secondary hover:bg-uf-bg-subtle hover:text-uf-text"
      >
        <ShareIcon className="h-5 w-5" />
      </button>
      {sheet}
    </>
  );
}

function ShareAction({
  label,
  href,
  tone,
  onClick,
  children,
}: {
  label: string;
  href?: string;
  tone: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const className = "flex w-[72px] shrink-0 flex-col items-center gap-2";
  const icon = (
    <span className={`flex h-14 w-14 items-center justify-center rounded-full text-white ${tone}`}>
      {children}
    </span>
  );
  if (href) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {icon}
        <span className="text-center text-[11px] leading-tight text-uf-text">{label}</span>
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {icon}
      <span className="text-center text-[11px] leading-tight text-uf-text">{label}</span>
    </button>
  );
}

function BubbleIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 4.5c-4.7 0-8.5 3.1-8.5 7 0 2.3 1.3 4.3 3.4 5.6l-.7 3 3.3-1.7c.8.2 1.6.3 2.5.3 4.7 0 8.5-3.1 8.5-7s-3.8-7.2-8.5-7.2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="6" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4.5 8 7.5 5.2L19.5 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="8" y="8" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
