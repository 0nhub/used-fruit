import { HeartIcon, MessageIcon } from "@/components/icons";
import { MessageNotifier } from "@/components/MessageNotifier";
import { ProfileMenu } from "@/components/ProfileMenu";
import Link from "next/link";

const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-full text-uf-text-secondary hover:bg-uf-bg-subtle hover:text-uf-text sm:h-9 sm:w-9";

export function NavActions() {
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
