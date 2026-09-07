/** Built-in example listings shipped for local and catalog previews. */
export function isDemoListing(id: string): boolean {
  return /^uf-s-\d{1,6}$/.test(id);
}

/** Stable display number; internal IDs and URLs remain unchanged. */
export function listingNumber(id: string): string {
  const seed = /^uf-s-(\d{1,6})$/.exec(id);
  if (seed) return String(3503968000 + Number(seed[1]));
  const user = /^uf-([a-z0-9]{7})$/.exec(id);
  if (user) return String(10000000000 + parseInt(user[1], 36));
  // Preserve every code point for IDs imported in another format, without hashing.
  return "9" + Array.from(id, (char) => String(char.codePointAt(0)).padStart(7, "0")).join("");
}
