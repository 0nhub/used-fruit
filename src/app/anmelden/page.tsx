import Image from "next/image";
import { StoreLogo } from "@/components/icons";
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
  const loginUrl = `/api/auth/login?next=${encodeURIComponent(next)}`;
  if (!params.error) redirect(loginUrl);

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="flex h-12 items-center justify-center px-4 pt-[env(safe-area-inset-top)]">
        <Link href="/" className="flex items-center gap-1.5 text-[15px] font-medium tracking-tight">
          <StoreLogo className="h-8 w-8 rounded-[8px]" />
          <span>Used Fruit</span>
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <h1 className="sr-only">Mit Apple anmelden</h1>
        <a href={loginUrl} className="inline-flex max-w-full rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-uf-link">
          <Image src="/apple-sign-in-de.png" width={280} height={48} alt="Mit Apple anmelden" priority className="h-auto max-w-full" />
        </a>
      </main>
    </div>
  );
}
