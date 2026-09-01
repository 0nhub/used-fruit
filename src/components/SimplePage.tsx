import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";

export function SimplePage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-[28px] font-semibold tracking-tight text-uf-text">{title}</h1>
        <Link href="/" className="mt-4 inline-block text-[14px] text-uf-link hover:underline">
          Zur Übersicht
        </Link>
      </main>
    </div>
  );
}
