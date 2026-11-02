export function appleLoginHref(next?: string | null) {
  const raw = next ?? "/";
  const safe =
    raw.startsWith("/") &&
    !raw.startsWith("//") &&
    !raw.includes("\\") &&
    !raw.startsWith("/api/auth") &&
    raw !== "/anmelden" &&
    !raw.startsWith("/anmelden?");
  return `/api/auth/login?next=${encodeURIComponent(safe ? raw : "/")}`;
}
