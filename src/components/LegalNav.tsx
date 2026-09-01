import { LEGAL, LEGAL_LINKS } from "@/lib/legal";
import Link from "next/link";

export function LegalNav({ compact = false }: { compact?: boolean }) {
  return (
    <nav
      aria-label="Rechtliches"
      className={
        compact
          ? "pt-4 pb-5"
          : "border-t border-uf-border-soft pt-4 pb-6"
      }
    >
      <ul className="flex flex-nowrap gap-x-2.5 overflow-x-auto text-[11px] leading-4 whitespace-nowrap text-uf-text-tertiary">
        {LEGAL_LINKS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="hover:text-uf-text">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] leading-4 text-uf-text-tertiary">
        © {LEGAL.copyrightYear} {LEGAL.platformName}
      </p>
    </nav>
  );
}
