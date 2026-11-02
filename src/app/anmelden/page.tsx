import { AppleSignInLink } from "@/components/AppleSignInButton";
import { StoreLogo } from "@/components/icons";
import { appleLoginHref } from "@/lib/appleLogin";
import { safeAuthNext, SESSION_COOKIE, unseal } from "@/lib/auth";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AnmeldenPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeAuthNext(params.next ?? null);
  const session = unseal((await cookies()).get(SESSION_COOKIE)?.value);
  if (session?.kind === "session") redirect(next);
  const loginUrl = appleLoginHref(next);
  if (!params.error) redirect(loginUrl);

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="flex h-12 items-center justify-center px-4 pt-[env(safe-area-inset-top)]">
        <Link href="/" className="flex items-center gap-1.5 text-[15px] font-medium tracking-tight">
          <StoreLogo className="h-8 w-8 rounded-[8px]" />
          <span>Used Fruit</span>
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <h1 className="text-[22px] font-semibold tracking-tight">Mit Apple anmelden</h1>
        <p className="mt-3 max-w-sm text-[14px] text-uf-text-secondary">
          {params.error === "configuration"
            ? "Die Anmeldung ist hier gerade nicht verfügbar. Bitte später erneut versuchen."
            : "Bei Apple hat etwas nicht geklappt. Bitte noch einmal versuchen."}
        </p>
        <div className="mt-8 flex w-full justify-center">
          <AppleSignInLink href={loginUrl} />
        </div>
      </main>
    </div>
  );
}
