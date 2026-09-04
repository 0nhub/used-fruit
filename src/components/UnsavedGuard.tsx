"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";

const LeaveCtx = createContext<((go: () => void) => void) | null>(null);

export function useTryLeave() {
  return useContext(LeaveCtx);
}

export function BindTryLeave({
  leaveRef,
}: {
  leaveRef: MutableRefObject<(go: () => void) => void>;
}) {
  const tryLeave = useTryLeave();
  leaveRef.current = tryLeave ?? ((go) => go());
  return null;
}

export function UnsavedGuard({
  dirty,
  title = "Änderungen nicht gespeichert",
  message = "Name oder Avatar wurden geändert. Wenn du die Seite verlässt, gehen diese Änderungen verloren.",
  stayLabel = "Abbrechen",
  leaveLabel = "Trotzdem verlassen",
  children,
}: {
  dirty: boolean;
  title?: string;
  message?: string;
  stayLabel?: string;
  leaveLabel?: string;
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState<(() => void) | null>(null);
  const allowLeave = useRef(false);

  const tryLeave = useCallback(
    (go: () => void) => {
      if (!dirty || allowLeave.current) {
        go();
        return;
      }
      setPending(() => go);
    },
    [dirty],
  );

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty || allowLeave.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const onClick = (event: MouseEvent) => {
      if (allowLeave.current) return;
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const next = `${url.pathname}${url.search}${url.hash}`;
      setPending(() => () => {
        window.location.assign(next);
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    window.history.pushState({ ufUnsaved: true }, "", window.location.href);
    const onPopState = () => {
      if (allowLeave.current) return;
      window.history.pushState({ ufUnsaved: true }, "", window.location.href);
      setPending(() => () => {
        allowLeave.current = true;
        window.history.go(-2);
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [dirty]);

  useEffect(() => {
    if (!pending) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPending(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending]);

  const stay = () => setPending(null);
  const leave = () => {
    const go = pending;
    allowLeave.current = true;
    setPending(null);
    go?.();
  };

  return (
    <LeaveCtx.Provider value={tryLeave}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/25 px-4"
          onClick={stay}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="uf-unsaved-title"
            aria-describedby="uf-unsaved-text"
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_16px_48px_rgba(0,0,0,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="uf-unsaved-title" className="text-[17px] font-semibold text-uf-text">
              {title}
            </h2>
            <p id="uf-unsaved-text" className="mt-2 text-[14px] text-uf-text-secondary">
              {message}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={stay}
                className="h-10 rounded-full px-4 text-[14px] text-uf-text-secondary hover:text-uf-text"
              >
                {stayLabel}
              </button>
              <button
                type="button"
                onClick={leave}
                className="h-10 rounded-full bg-uf-text px-4 text-[14px] text-white"
              >
                {leaveLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </LeaveCtx.Provider>
  );
}
