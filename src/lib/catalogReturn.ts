export let catalogReturn: { url: string; scrollY: number; listingId: string } | undefined;

function usesOwnScroll(scroller?: HTMLElement | null) {
  if (!scroller) return false;
  const overflowY = getComputedStyle(scroller).overflowY;
  return overflowY === "auto" || overflowY === "scroll";
}

export function rememberCatalogReturn(listingId: string, scroller?: HTMLElement | null) {
  catalogReturn = {
    url: location.pathname + location.search,
    scrollY: usesOwnScroll(scroller) ? scroller!.scrollTop : window.scrollY,
    listingId,
  };
}

export function restoreCatalogReturn(scroller?: HTMLElement | null) {
  const saved = catalogReturn;
  if (!saved || saved.url !== location.pathname + location.search) return;

  if (usesOwnScroll(scroller)) scroller!.scrollTop = saved.scrollY;
  else window.scrollTo(0, saved.scrollY);

  const root = scroller ?? document;
  const card = root.querySelector<HTMLElement>(`a[href="/listing/${CSS.escape(saved.listingId)}"]`);
  card?.scrollIntoView({ block: "nearest", inline: "nearest" });
}
