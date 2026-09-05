"use client";

import { AppleMark } from "@/components/AppleSignInButton";
import { HeartIcon, MessageIcon } from "@/components/icons";
import { MessageNotifier } from "@/components/MessageNotifier";
import { ProfileMenu } from "@/components/ProfileMenu";
import { useProfile } from "@/lib/useProfile";
import Link from "next/link";

const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-full text-uf-text-secondary hover:bg-uf-bg-subtle hover:text-uf-text sm:h-9 sm:w-9";

const guestBtn =
  "h-8 items-center rounded-full px-1 text-[11px] font-medium leading-none min-[360px]:px-2.5 min-[360px]:text-[12px] sm:h-9 sm:px-3.5 sm:text-[13px]";

export function NavActions() {
  const { signedIn, ready } = useProfile();

  if (!ready) {
    return <div className="h-8 w-[9.5rem] sm:h-9" aria-hidden />;
  }

  if (!signedIn) {
    return (
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link
          href="/inserieren"
          className={`${guestBtn} hidden lg:inline-flex bg-uf-action text-white hover:bg-uf-link`}
        >
          Inserieren
        </Link>
        <Link
          href="/anmelden"
          className={`${guestBtn} inline-flex border border-uf-border text-uf-text hover:bg-uf-bg-subtle`}
        >
          <AppleMark className="mr-1.5 block h-[18px] w-[14px] shrink-0 -translate-y-px" />
          Mit Apple anmelden
        </Link>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <MessageNotifier />
      <Link href="/nachrichten" className={iconBtn} aria-label="Nachrichten">
        <MessageIcon className="h-5 w-5" />
      </Link>
      <Link href="/favoriten" className={iconBtn} aria-label="Favoriten">
        <HeartIcon className="h-5 w-5" />
      </Link>
      <ProfileMenu />
    </div>
  );
}
