import { LegalNav } from "@/components/LegalNav";
import { SiteHeader } from "@/components/SiteHeader";
import { LEGAL } from "@/lib/legal";

export function LegalDocument({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-[680px] px-4 py-10 md:py-14">
        <h1 className="text-[28px] font-semibold tracking-tight text-uf-text">
          {title}
        </h1>
        <p className="mt-2 text-[13px] text-uf-text-tertiary">Stand: {LEGAL.stand}</p>
        <div className="uf-legal mt-8">{children}</div>
      </main>
      <footer className="w-full px-1.5 pb-16 sm:px-3 md:px-6">
        <LegalNav fullWidth />
      </footer>
    </div>
  );
}
