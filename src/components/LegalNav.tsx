import { CookieSettingsButton } from "@/components/PrivacyConsent";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal";
import Link from "next/link";

export function LegalNav({ compact = false, includeListing = false, fullWidth = false }: { compact?: boolean; includeListing?: boolean; fullWidth?: boolean }) {
  return (
    <nav
      aria-label="Rechtliches"
      className={`${compact ? "pt-4 pb-5" : "pt-4 pb-6"} ${fullWidth ? "lg:flex lg:items-baseline lg:justify-between lg:gap-6" : ""}`}
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
        {includeListing && <span><span aria-hidden> · </span><Link href="/inserieren" className="hover:text-uf-text">Inserieren</Link></span>}
        <span><span aria-hidden> · </span><CookieSettingsButton /></span>
      </p>
      <p className={`mt-2 text-[11px] leading-5 text-uf-text-tertiary ${fullWidth ? "lg:mt-0 lg:shrink-0 lg:text-right" : ""}`}>
        © {LEGAL.copyrightYear} {LEGAL.platformName}
      </p>
    </nav>
  );
}
