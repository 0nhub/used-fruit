import { PLACE_ROWS } from "@/data/places.de";

export interface Place {
  postalCode: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

/** Every German postal place from the GeoNames directory. */
export const PLACES: Place[] = PLACE_ROWS.map(([postalCode, city, state, lat, lng]) => ({
  postalCode,
  city,
  state,
  lat,
  lng,
}));

const byPostal = new Map<string, Place[]>();
for (const place of PLACES) {
  const list = byPostal.get(place.postalCode);
  if (list) list.push(place);
  else byPostal.set(place.postalCode, [place]);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function searchPlaces(query: string, limit = 8): Place[] {
  const q = normalize(query);
  if (q.length < 1) return [];

  const scored = PLACES.map((place) => {
    const city = normalize(place.city);
    const plz = place.postalCode;
    let score = 0;
    if (plz.startsWith(q)) score += 100 - (plz.length - q.length);
    if (city === q) score += 200;
    else if (city.startsWith(q)) score += 80;
    if (score === 0 && city.includes(q)) score += 40;
    if (score === 0 && `${plz} ${city}`.includes(q)) score += 20;
    return { place, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.place.postalCode.localeCompare(b.place.postalCode) || a.place.city.localeCompare(b.place.city, "de"));

  const unique: Place[] = [];
  const seen = new Set<string>();
  for (const { place } of scored) {
    const key = `${place.postalCode}-${place.city}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(place);
    if (unique.length >= limit) break;
  }
  return unique;
}

export function findPlace(postalCode?: string, city?: string): Place | undefined {
  if (postalCode) {
    const matches = byPostal.get(postalCode);
    if (matches?.length) {
      if (city) {
        const n = normalize(city);
        const named = matches.find((place) => normalize(place.city) === n);
        if (named) return named;
      }
      return matches[0];
    }
  }
  if (city) {
    const n = normalize(city);
    return PLACES.find((place) => normalize(place.city) === n);
  }
  return undefined;
}

/** Luftlinie in km (Haversine). */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatPlaceLabel(place: Place): string {
  return `${place.postalCode} ${place.city}`;
}
