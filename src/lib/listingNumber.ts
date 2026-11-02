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
  let hash = 2166136261;
  for (const char of id) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return String(3600000000 + ((hash >>> 0) % 100000000));
}
