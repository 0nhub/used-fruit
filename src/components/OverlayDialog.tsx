"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/icons";

export function OverlayDialog({ titleId, onClose, children, wide = false }: {
  titleId: string; onClose: () => void; children: ReactNode; wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return createPortal(
    <dialog ref={ref} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className={`fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-24px)] overflow-y-auto overscroll-contain rounded-[28px] border-0 bg-white p-0 text-uf-text shadow-2xl backdrop:bg-black/35 backdrop:backdrop-blur-sm ${wide ? "max-w-2xl" : "max-w-lg"}`}>
      <div className="relative p-6 sm:p-10">
        <button type="button" aria-label="Schließen" onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-uf-bg-subtle text-uf-text-secondary hover:text-uf-text focus-visible:outline-2 focus-visible:outline-uf-link">
          <CloseIcon className="h-4 w-4" />
        </button>
        {children}
      </div>
    </dialog>, document.body);
}
