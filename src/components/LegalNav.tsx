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
      <p className="text-[11px] leading-5 text-uf-text-tertiary">
        {LEGAL_LINKS.map((item, index) => (
          <span key={item.href}>
            {index > 0 ? <span aria-hidden> · </span> : null}
            <Link href={item.href} className="hover:text-uf-text">
              {item.label}
            </Link>
          </span>
        ))}
      </p>
      <p className="mt-2 text-[11px] leading-5 text-uf-text-tertiary">
        © {LEGAL.copyrightYear} {LEGAL.platformName}
      </p>
    </nav>
  );
}
