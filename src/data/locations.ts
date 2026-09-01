export interface Place {
  postalCode: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

/** Ortsverzeichnis für Autocomplete (PLZ / Stadt). */
export const PLACES: Place[] = [
  { postalCode: "10115", city: "Berlin", state: "Berlin", lat: 52.532, lng: 13.384 },
  { postalCode: "10117", city: "Berlin", state: "Berlin", lat: 52.517, lng: 13.389 },
  { postalCode: "10178", city: "Berlin", state: "Berlin", lat: 52.521, lng: 13.41 },
  { postalCode: "10243", city: "Berlin", state: "Berlin", lat: 52.511, lng: 13.444 },
  { postalCode: "10315", city: "Berlin", state: "Berlin", lat: 52.515, lng: 13.502 },
  { postalCode: "10405", city: "Berlin", state: "Berlin", lat: 52.535, lng: 13.423 },
  { postalCode: "10623", city: "Berlin", state: "Berlin", lat: 52.508, lng: 13.326 },
  { postalCode: "10963", city: "Berlin", state: "Berlin", lat: 52.499, lng: 13.381 },
  { postalCode: "12043", city: "Berlin", state: "Berlin", lat: 52.482, lng: 13.44 },
  { postalCode: "13355", city: "Berlin", state: "Berlin", lat: 52.546, lng: 13.377 },
  { postalCode: "20095", city: "Hamburg", state: "Hamburg", lat: 53.551, lng: 9.994 },
  { postalCode: "20099", city: "Hamburg", state: "Hamburg", lat: 53.552, lng: 10.01 },
  { postalCode: "20144", city: "Hamburg", state: "Hamburg", lat: 53.575, lng: 9.98 },
  { postalCode: "20354", city: "Hamburg", state: "Hamburg", lat: 53.56, lng: 9.99 },
  { postalCode: "22087", city: "Hamburg", state: "Hamburg", lat: 53.558, lng: 10.03 },
  { postalCode: "22765", city: "Hamburg", state: "Hamburg", lat: 53.55, lng: 9.93 },
  { postalCode: "80331", city: "München", state: "Bayern", lat: 48.137, lng: 11.575 },
  { postalCode: "80333", city: "München", state: "Bayern", lat: 48.142, lng: 11.568 },
  { postalCode: "80335", city: "München", state: "Bayern", lat: 48.141, lng: 11.555 },
  { postalCode: "80469", city: "München", state: "Bayern", lat: 48.129, lng: 11.573 },
  { postalCode: "80538", city: "München", state: "Bayern", lat: 48.143, lng: 11.588 },
  { postalCode: "80636", city: "München", state: "Bayern", lat: 48.152, lng: 11.54 },
  { postalCode: "81379", city: "München", state: "Bayern", lat: 48.113, lng: 11.528 },
  { postalCode: "81667", city: "München", state: "Bayern", lat: 48.128, lng: 11.6 },
  { postalCode: "50667", city: "Köln", state: "Nordrhein-Westfalen", lat: 50.938, lng: 6.96 },
  { postalCode: "50668", city: "Köln", state: "Nordrhein-Westfalen", lat: 50.948, lng: 6.96 },
  { postalCode: "50672", city: "Köln", state: "Nordrhein-Westfalen", lat: 50.94, lng: 6.94 },
  { postalCode: "50674", city: "Köln", state: "Nordrhein-Westfalen", lat: 50.932, lng: 6.94 },
  { postalCode: "50733", city: "Köln", state: "Nordrhein-Westfalen", lat: 50.965, lng: 6.95 },
  { postalCode: "50937", city: "Köln", state: "Nordrhein-Westfalen", lat: 50.917, lng: 6.92 },
  { postalCode: "60311", city: "Frankfurt am Main", state: "Hessen", lat: 50.111, lng: 8.682 },
  { postalCode: "60313", city: "Frankfurt am Main", state: "Hessen", lat: 50.115, lng: 8.685 },
  { postalCode: "60322", city: "Frankfurt am Main", state: "Hessen", lat: 50.124, lng: 8.67 },
  { postalCode: "60325", city: "Frankfurt am Main", state: "Hessen", lat: 50.116, lng: 8.66 },
  { postalCode: "60594", city: "Frankfurt am Main", state: "Hessen", lat: 50.102, lng: 8.69 },
  { postalCode: "70173", city: "Stuttgart", state: "Baden-Württemberg", lat: 48.778, lng: 9.18 },
  { postalCode: "70174", city: "Stuttgart", state: "Baden-Württemberg", lat: 48.782, lng: 9.176 },
  { postalCode: "70176", city: "Stuttgart", state: "Baden-Württemberg", lat: 48.775, lng: 9.16 },
  { postalCode: "70178", city: "Stuttgart", state: "Baden-Württemberg", lat: 48.768, lng: 9.17 },
  { postalCode: "70182", city: "Stuttgart", state: "Baden-Württemberg", lat: 48.773, lng: 9.185 },
  { postalCode: "70191", city: "Stuttgart", state: "Baden-Württemberg", lat: 48.805, lng: 9.18 },
  { postalCode: "70372", city: "Stuttgart", state: "Baden-Württemberg", lat: 48.805, lng: 9.215 },
  { postalCode: "70435", city: "Stuttgart", state: "Baden-Württemberg", lat: 48.81, lng: 9.157 },
  { postalCode: "70499", city: "Stuttgart", state: "Baden-Württemberg", lat: 48.815, lng: 9.112 },
  { postalCode: "70563", city: "Stuttgart", state: "Baden-Württemberg", lat: 48.73, lng: 9.113 },
  { postalCode: "70567", city: "Stuttgart", state: "Baden-Württemberg", lat: 48.726, lng: 9.148 },
  { postalCode: "70734", city: "Fellbach", state: "Baden-Württemberg", lat: 48.809, lng: 9.276 },
  { postalCode: "70771", city: "Leinfelden-Echterdingen", state: "Baden-Württemberg", lat: 48.693, lng: 9.163 },
  { postalCode: "70794", city: "Filderstadt", state: "Baden-Württemberg", lat: 48.677, lng: 9.22 },
  { postalCode: "70806", city: "Kornwestheim", state: "Baden-Württemberg", lat: 48.861, lng: 9.185 },
  { postalCode: "71032", city: "Böblingen", state: "Baden-Württemberg", lat: 48.685, lng: 9.01 },
  { postalCode: "71063", city: "Sindelfingen", state: "Baden-Württemberg", lat: 48.713, lng: 9.003 },
  { postalCode: "71229", city: "Leonberg", state: "Baden-Württemberg", lat: 48.801, lng: 9.017 },
  { postalCode: "71332", city: "Waiblingen", state: "Baden-Württemberg", lat: 48.832, lng: 9.317 },
  { postalCode: "71522", city: "Backnang", state: "Baden-Württemberg", lat: 48.947, lng: 9.43 },
  { postalCode: "71634", city: "Ludwigsburg", state: "Baden-Württemberg", lat: 48.897, lng: 9.192 },
  { postalCode: "72622", city: "Nürtingen", state: "Baden-Württemberg", lat: 48.627, lng: 9.342 },
  { postalCode: "72764", city: "Reutlingen", state: "Baden-Württemberg", lat: 48.491, lng: 9.204 },
  { postalCode: "73033", city: "Göppingen", state: "Baden-Württemberg", lat: 48.703, lng: 9.652 },
  { postalCode: "73230", city: "Kirchheim unter Teck", state: "Baden-Württemberg", lat: 48.648, lng: 9.451 },
  { postalCode: "73728", city: "Esslingen", state: "Baden-Württemberg", lat: 48.74, lng: 9.307 },
  { postalCode: "73760", city: "Ostfildern", state: "Baden-Württemberg", lat: 48.727, lng: 9.256 },
  { postalCode: "74072", city: "Heilbronn", state: "Baden-Württemberg", lat: 49.143, lng: 9.211 },
  { postalCode: "74321", city: "Bietigheim-Bissingen", state: "Baden-Württemberg", lat: 48.958, lng: 9.126 },
  { postalCode: "75172", city: "Pforzheim", state: "Baden-Württemberg", lat: 48.892, lng: 8.695 },
  { postalCode: "40213", city: "Düsseldorf", state: "Nordrhein-Westfalen", lat: 51.227, lng: 6.774 },
  { postalCode: "40215", city: "Düsseldorf", state: "Nordrhein-Westfalen", lat: 51.22, lng: 6.78 },
  { postalCode: "40219", city: "Düsseldorf", state: "Nordrhein-Westfalen", lat: 51.21, lng: 6.76 },
  { postalCode: "40476", city: "Düsseldorf", state: "Nordrhein-Westfalen", lat: 51.25, lng: 6.78 },
  { postalCode: "04109", city: "Leipzig", state: "Sachsen", lat: 51.34, lng: 12.375 },
  { postalCode: "04103", city: "Leipzig", state: "Sachsen", lat: 51.343, lng: 12.38 },
  { postalCode: "04105", city: "Leipzig", state: "Sachsen", lat: 51.348, lng: 12.37 },
  { postalCode: "04229", city: "Leipzig", state: "Sachsen", lat: 51.325, lng: 12.34 },
  { postalCode: "01067", city: "Dresden", state: "Sachsen", lat: 51.05, lng: 13.738 },
  { postalCode: "01069", city: "Dresden", state: "Sachsen", lat: 51.045, lng: 13.74 },
  { postalCode: "01097", city: "Dresden", state: "Sachsen", lat: 51.06, lng: 13.74 },
  { postalCode: "01127", city: "Dresden", state: "Sachsen", lat: 51.07, lng: 13.72 },
  { postalCode: "30159", city: "Hannover", state: "Niedersachsen", lat: 52.375, lng: 9.738 },
  { postalCode: "30161", city: "Hannover", state: "Niedersachsen", lat: 52.38, lng: 9.74 },
  { postalCode: "30169", city: "Hannover", state: "Niedersachsen", lat: 52.37, lng: 9.72 },
  { postalCode: "30449", city: "Hannover", state: "Niedersachsen", lat: 52.36, lng: 9.73 },
  { postalCode: "90402", city: "Nürnberg", state: "Bayern", lat: 49.453, lng: 11.077 },
  { postalCode: "90403", city: "Nürnberg", state: "Bayern", lat: 49.455, lng: 11.08 },
  { postalCode: "90408", city: "Nürnberg", state: "Bayern", lat: 49.46, lng: 11.07 },
  { postalCode: "90429", city: "Nürnberg", state: "Bayern", lat: 49.45, lng: 11.05 },
  { postalCode: "28195", city: "Bremen", state: "Bremen", lat: 53.076, lng: 8.807 },
  { postalCode: "28199", city: "Bremen", state: "Bremen", lat: 53.07, lng: 8.79 },
  { postalCode: "28203", city: "Bremen", state: "Bremen", lat: 53.08, lng: 8.82 },
  { postalCode: "44135", city: "Dortmund", state: "Nordrhein-Westfalen", lat: 51.514, lng: 7.465 },
  { postalCode: "44137", city: "Dortmund", state: "Nordrhein-Westfalen", lat: 51.51, lng: 7.46 },
  { postalCode: "44139", city: "Dortmund", state: "Nordrhein-Westfalen", lat: 51.508, lng: 7.45 },
  { postalCode: "45127", city: "Essen", state: "Nordrhein-Westfalen", lat: 51.456, lng: 7.012 },
  { postalCode: "45130", city: "Essen", state: "Nordrhein-Westfalen", lat: 51.45, lng: 7.01 },
  { postalCode: "47051", city: "Duisburg", state: "Nordrhein-Westfalen", lat: 51.435, lng: 6.762 },
  { postalCode: "48143", city: "Münster", state: "Nordrhein-Westfalen", lat: 51.963, lng: 7.628 },
  { postalCode: "48149", city: "Münster", state: "Nordrhein-Westfalen", lat: 51.97, lng: 7.62 },
  { postalCode: "53111", city: "Bonn", state: "Nordrhein-Westfalen", lat: 50.735, lng: 7.1 },
  { postalCode: "53113", city: "Bonn", state: "Nordrhein-Westfalen", lat: 50.73, lng: 7.1 },
  { postalCode: "55116", city: "Mainz", state: "Rheinland-Pfalz", lat: 49.999, lng: 8.273 },
  { postalCode: "65183", city: "Wiesbaden", state: "Hessen", lat: 50.082, lng: 8.24 },
  { postalCode: "66111", city: "Saarbrücken", state: "Saarland", lat: 49.235, lng: 6.996 },
  { postalCode: "68159", city: "Mannheim", state: "Baden-Württemberg", lat: 49.489, lng: 8.467 },
  { postalCode: "69117", city: "Heidelberg", state: "Baden-Württemberg", lat: 49.41, lng: 8.695 },
  { postalCode: "72072", city: "Tübingen", state: "Baden-Württemberg", lat: 48.521, lng: 9.058 },
  { postalCode: "76131", city: "Karlsruhe", state: "Baden-Württemberg", lat: 49.009, lng: 8.404 },
  { postalCode: "79098", city: "Freiburg im Breisgau", state: "Baden-Württemberg", lat: 47.995, lng: 7.852 },
  { postalCode: "83022", city: "Rosenheim", state: "Bayern", lat: 47.856, lng: 12.125 },
  { postalCode: "86150", city: "Augsburg", state: "Bayern", lat: 48.367, lng: 10.898 },
  { postalCode: "93047", city: "Regensburg", state: "Bayern", lat: 49.013, lng: 12.101 },
  { postalCode: "97070", city: "Würzburg", state: "Bayern", lat: 49.794, lng: 9.929 },
  { postalCode: "99084", city: "Erfurt", state: "Thüringen", lat: 50.978, lng: 11.029 },
  { postalCode: "14467", city: "Potsdam", state: "Brandenburg", lat: 52.399, lng: 13.064 },
  { postalCode: "18055", city: "Rostock", state: "Mecklenburg-Vorpommern", lat: 54.089, lng: 12.14 },
  { postalCode: "24103", city: "Kiel", state: "Schleswig-Holstein", lat: 54.323, lng: 10.139 },
  { postalCode: "23552", city: "Lübeck", state: "Schleswig-Holstein", lat: 53.868, lng: 10.687 },
  { postalCode: "39104", city: "Magdeburg", state: "Sachsen-Anhalt", lat: 52.132, lng: 11.64 },
  { postalCode: "33098", city: "Paderborn", state: "Nordrhein-Westfalen", lat: 51.719, lng: 8.754 },
  { postalCode: "33602", city: "Bielefeld", state: "Nordrhein-Westfalen", lat: 52.021, lng: 8.533 },
  { postalCode: "35390", city: "Gießen", state: "Hessen", lat: 50.584, lng: 8.678 },
  { postalCode: "37073", city: "Göttingen", state: "Niedersachsen", lat: 51.533, lng: 9.935 },
  { postalCode: "38100", city: "Braunschweig", state: "Niedersachsen", lat: 52.265, lng: 10.524 },
  { postalCode: "42275", city: "Wuppertal", state: "Nordrhein-Westfalen", lat: 51.27, lng: 7.19 },
  { postalCode: "52062", city: "Aachen", state: "Nordrhein-Westfalen", lat: 50.776, lng: 6.084 },
];

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
    if (city.startsWith(q)) score += 80;
    if (city.includes(q)) score += 40;
    if (`${plz} ${city}`.includes(q)) score += 20;
    return { place, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

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
    const byPlz = PLACES.find((p) => p.postalCode === postalCode);
    if (byPlz) return byPlz;
  }
  if (city) {
    const n = normalize(city);
    return PLACES.find((p) => normalize(p.city) === n);
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
