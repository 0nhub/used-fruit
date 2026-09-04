"use client";

import { LegalNav } from "@/components/LegalNav";
import { CloseIcon, MenuIcon } from "@/components/icons";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type MobileNavContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  filterTarget: HTMLDivElement | null;
  setFilterTarget: (node: HTMLDivElement | null) => void;
  filterCount: number;
  setFilterCount: (count: number) => void;
  hasFilters: boolean;
  setHasFilters: (value: boolean) => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function useMobileNav() {
  const value = useContext(MobileNavContext);
  if (!value) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return value;
}

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [filterTarget, setFilterTarget] = useState<HTMLDivElement | null>(null);
  const [filterCount, setFilterCount] = useState(0);
  const [hasFilters, setHasFilters] = useState(false);
  const value = useMemo(
    () => ({
      open,
      setOpen,
      filterTarget,
      setFilterTarget,
      filterCount,
      setFilterCount,
      hasFilters,
      setHasFilters,
    }),
    [open, filterTarget, filterCount, hasFilters],
  );

  return (
    <MobileNavContext.Provider value={value}>
      {children}
      <MobileDrawer />
    </MobileNavContext.Provider>
  );
}

export function MobileFilterHost({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const { filterTarget, setFilterCount, setHasFilters } = useMobileNav();

  useEffect(() => {
    setHasFilters(true);
    setFilterCount(count);
    return () => {
      setHasFilters(false);
      setFilterCount(0);
    };
  }, [count, setFilterCount, setHasFilters]);

  if (!filterTarget) return null;
  return createPortal(children, filterTarget);
}

export function MobileMenuButton() {
  const { setOpen, filterCount } = useMobileNav();
  return (
    <button
      type="button"
      aria-label="Menü"
      onClick={() => setOpen(true)}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-uf-text lg:hidden"
    >
      <MenuIcon className="h-6 w-6" />
      {filterCount > 0 ? (
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-uf-link" />
      ) : null}
    </button>
  );
}

function MobileDrawer() {
  const { open, setOpen, setFilterTarget, filterCount, hasFilters } = useMobileNav();
  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div className={open ? "fixed inset-0 z-[70] lg:hidden" : "hidden"}>
      <button
        type="button"
        aria-label="Menü schließen"
        className="absolute inset-0 bg-black/35"
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal={open}
        aria-label="Menü"
        className="absolute inset-y-0 left-0 flex w-[min(22rem,86vw)] flex-col overflow-hidden bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-[8px_0_32px_rgba(0,0,0,0.12)]"
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-uf-border-soft px-3">
          <p className="pl-1 text-[17px] font-semibold tracking-tight">Menü</p>
          <button
            type="button"
            aria-label="Schließen"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full text-uf-text"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 [-webkit-overflow-scrolling:touch]">
          <section className={hasFilters ? "py-1" : "hidden"}>
            <p className="pt-3 pb-1 text-[12px] tracking-wide text-uf-text-secondary uppercase">
              Filter{filterCount > 0 ? ` · ${filterCount}` : ""}
            </p>
            <div ref={setFilterTarget} />
          </section>
        </div>
        <div className="shrink-0 px-4">
          <LegalNav compact />
        </div>
      </aside>
    </div>
  );
}
