export let catalogReturn: { url: string; scrollY: number; listingId: string } | undefined;
export function rememberCatalogReturn(listingId: string) {
  catalogReturn = { url: location.pathname + location.search, scrollY: window.scrollY, listingId };
}
