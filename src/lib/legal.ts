export const LEGAL = {
  platformName: "Used Fruit",
  operatorName: "Gabriel Sgroi",
  street: "Charlottenstr. 47",
  postalCode: "73230",
  city: "Kirchheim unter Teck",
  country: "Deutschland",
  phoneDisplay: "+49 163 6985193",
  phoneHref: "tel:+491636985193",
  email: "hello@sgroi.ga",
  stand: "1. September 2026",
  copyrightYear: 2026,
} as const;

export const LEGAL_LINKS = [
  { href: "/impressum", label: "Impressum" },
  { href: "/agb", label: "AGB" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/nutzerbedingungen", label: "Nutzerbedingungen" },
] as const;
