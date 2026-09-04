"use client";

import {
  LoginIcon,
  LogoutIcon,
  MacBookIcon,
  PlusIcon,
  ProfileIcon,
} from "@/components/icons";
import { useTryLeave } from "@/components/UnsavedGuard";
import { useProfile } from "@/lib/useProfile";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-full text-uf-text-secondary hover:bg-uf-bg-subtle hover:text-uf-text sm:h-9 sm:w-9";

const itemClass =
  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-normal leading-5 text-uf-text hover:bg-uf-bg-subtle";

function MenuIconWrap({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-uf-text-secondary">
      {children}
    </span>
  );
}

export function ProfileMenu() {
  const tryLeave = useTryLeave();
  const { profile, signedIn, ready, logout, login } = useProfile();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const displayName = profile.name.trim() || "Profil";

  const goTo = (href: string) => {
    const go = () => {
      setOpen(false);
      window.location.assign(href);
    };
    if (tryLeave) tryLeave(go);
    else go();
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={iconBtn}
        aria-label="Profil"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {ready && signedIn ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-uf-bg-subtle text-[16px] leading-none sm:h-8 sm:w-8 sm:text-[18px]">
            {profile.emoji}
          </span>
        ) : (
          <ProfileIcon className="h-5 w-5" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1.5 min-w-[220px] overflow-hidden rounded-xl border border-uf-border-soft bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        >
          {signedIn ? (
            <>
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-uf-bg-subtle text-[18px] leading-none">
                  {profile.emoji}
                </span>
                <span className="truncate text-[13px] font-medium text-uf-text">
                  {displayName}
                </span>
              </div>
              <div className="my-1 h-px bg-uf-border-soft" />
              <Link
                href="/profil"
                role="menuitem"
                className={itemClass}
                onClick={(event) => {
                  if (tryLeave) {
                    event.preventDefault();
                    goTo("/profil");
                  } else {
                    setOpen(false);
                  }
                }}
              >
                <MenuIconWrap>
                  <ProfileIcon className="h-4 w-4" />
                </MenuIconWrap>
                Konto
              </Link>
              <Link
                href="/inserieren"
                role="menuitem"
                className={itemClass}
                onClick={(event) => {
                  if (tryLeave) {
                    event.preventDefault();
                    goTo("/inserieren");
                  } else {
                    setOpen(false);
                  }
                }}
              >
                <MenuIconWrap>
                  <PlusIcon className="h-4 w-4" />
                </MenuIconWrap>
                Inserieren
              </Link>
              <Link
                href="/meine-inserate"
                role="menuitem"
                className={itemClass}
                onClick={(event) => {
                  if (tryLeave) {
                    event.preventDefault();
                    goTo("/meine-inserate");
                  } else {
                    setOpen(false);
                  }
                }}
              >
                <MenuIconWrap>
                  <MacBookIcon className="h-4 w-4" />
                </MenuIconWrap>
                Meine Inserate
              </Link>
              <div className="mx-3 my-1.5 h-px bg-uf-border-soft" />
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-normal leading-5 text-[#d80000] hover:bg-[#d80000]/5"
                onClick={() => {
                  const go = () => {
                    logout();
                    setOpen(false);
                    if (window.location.pathname.startsWith("/profil")) {
                      window.location.assign("/");
                    }
                  };
                  if (tryLeave) tryLeave(go);
                  else go();
                }}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#d80000]">
                  <LogoutIcon className="h-4 w-4" />
                </span>
                Ausloggen
              </button>
            </>
          ) : (
            <>
              <Link href="/inserieren" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                <MenuIconWrap>
                  <PlusIcon className="h-4 w-4" />
                </MenuIconWrap>
                Inserieren
              </Link>
              <button
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={() => {
                  login();
                  setOpen(false);
                }}
              >
                <MenuIconWrap>
                  <LoginIcon className="h-4 w-4" />
                </MenuIconWrap>
                Anmelden
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
