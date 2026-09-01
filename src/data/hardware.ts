import type { Listing } from "@/lib/types";

export interface HardwareSpec {
  label: string;
  value: string;
}

interface ModelHardware {
  sizes?: Record<string, HardwareSpec[]>;
  specs: HardwareSpec[];
}

const SPECS: Record<string, ModelHardware> = {
  "macbook-neo": {
    sizes: {
      '13"': [
        { label: "Größe und Gewicht", value: "304,1 × 212,4 × 15,6 mm / 1.400 g" },
        { label: "Display", value: "13,6‑Zoll‑Liquid‑Retina mit True Tone" },
        { label: "Auflösung", value: "2560 × 1664, 224 Pixel pro Zoll" },
      ],
      '15"': [
        { label: "Größe und Gewicht", value: "340,4 × 237,6 × 15,6 mm / 1.600 g" },
        { label: "Display", value: "15,3‑Zoll‑Liquid‑Retina mit True Tone" },
        { label: "Auflösung", value: "2880 × 1864, 224 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "500 Nits" },
      { label: "Farbraum", value: "P3 Wide Color" },
      { label: "Kamera", value: "1080p FaceTime‑HD‑Kamera" },
      { label: "Audio", value: "Vier Lautsprecher, drei Mikrofone" },
      { label: "Authentifizierung", value: "Touch ID" },
      { label: "Anschlüsse", value: "MagSafe, zwei Thunderbolt / USB 4, 3,5‑mm‑Kopfhörer" },
      { label: "Netzwerk", value: "WLAN 6E, Bluetooth 5.3" },
      { label: "Batterie", value: "Bis zu 18 Stunden Videowiedergabe" },
      { label: "Betriebssystem", value: "macOS" },
    ],
  },
  "macbook-air": {
    sizes: {
      '13"': [
        { label: "Größe und Gewicht", value: "304,1 × 215,0 × 11,3 mm / 1.240 g" },
        { label: "Display", value: "13,6‑Zoll‑Liquid‑Retina mit True Tone" },
        { label: "Auflösung", value: "2560 × 1664, 224 Pixel pro Zoll" },
      ],
      '15"': [
        { label: "Größe und Gewicht", value: "340,4 × 237,6 × 11,5 mm / 1.510 g" },
        { label: "Display", value: "15,3‑Zoll‑Liquid‑Retina mit True Tone" },
        { label: "Auflösung", value: "2880 × 1864, 224 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "500 Nits" },
      { label: "Farbraum", value: "P3 Wide Color" },
      { label: "Kamera", value: "1080p FaceTime‑HD‑Kamera" },
      { label: "Audio", value: "Vier Lautsprecher, drei Mikrofone" },
      { label: "Authentifizierung", value: "Touch ID" },
      { label: "Anschlüsse", value: "MagSafe, zwei Thunderbolt / USB 4, 3,5‑mm‑Kopfhörer" },
      { label: "Netzwerk", value: "WLAN 6E, Bluetooth 5.3" },
      { label: "Batterie", value: "Bis zu 18 Stunden Videowiedergabe" },
      { label: "Betriebssystem", value: "macOS" },
    ],
  },
  "macbook-pro": {
    sizes: {
      '14"': [
        { label: "Größe und Gewicht", value: "312,6 × 221,2 × 15,5 mm / 1.550 g" },
        { label: "Display", value: "14,2‑Zoll‑Liquid‑Retina‑XDR mit ProMotion" },
        { label: "Auflösung", value: "3024 × 1964, 254 Pixel pro Zoll" },
      ],
      '16"': [
        { label: "Größe und Gewicht", value: "355,7 × 248,1 × 16,8 mm / 2.140 g" },
        { label: "Display", value: "16,2‑Zoll‑Liquid‑Retina‑XDR mit ProMotion" },
        { label: "Auflösung", value: "3456 × 2234, 254 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "1000 Nits SDR, 1600 Nits HDR" },
      { label: "Kontrast", value: "1.000.000:1, True Tone" },
      { label: "Farbraum", value: "P3 Wide Color" },
      { label: "Kamera", value: "1080p FaceTime‑HD‑Kamera" },
      { label: "Audio", value: "Sechs Lautsprecher mit Force‑cancelling" },
      { label: "Authentifizierung", value: "Touch ID" },
      { label: "Anschlüsse", value: "MagSafe, HDMI, SDXC, drei Thunderbolt 4, 3,5‑mm‑Kopfhörer" },
      { label: "Netzwerk", value: "WLAN 6E, Bluetooth 5.3" },
      { label: "Batterie", value: "Bis zu 22 Stunden Videowiedergabe" },
      { label: "Betriebssystem", value: "macOS" },
    ],
  },
  imac: {
    sizes: {
      '24"': [
        { label: "Größe und Gewicht", value: "547 × 461 × 147 mm / 4.430 g" },
        { label: "Display", value: "24‑Zoll‑4,5K‑Retina mit True Tone" },
        { label: "Auflösung", value: "4480 × 2520, 218 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "500 Nits" },
      { label: "Farbraum", value: "P3 Wide Color" },
      { label: "Kamera", value: "1080p FaceTime‑HD‑Kamera" },
      { label: "Audio", value: "Sechs Lautsprecher, Studioqualität‑Mikrofon" },
      { label: "Authentifizierung", value: "Touch ID in der Magic Keyboard" },
      { label: "Anschlüsse", value: "Zwei Thunderbolt / USB 4, Gigabit Ethernet, 3,5‑mm‑Kopfhörer" },
      { label: "Netzwerk", value: "WLAN 6E, Bluetooth 5.3" },
      { label: "Betriebssystem", value: "macOS" },
    ],
  },
  "mac-mini": {
    specs: [
      { label: "Größe und Gewicht", value: "127 × 127 × 50 mm / 670 g" },
      { label: "Anschlüsse vorne", value: "Zwei USB‑C, 3,5‑mm‑Kopfhörer" },
      { label: "Anschlüsse hinten", value: "Drei Thunderbolt, HDMI, zwei USB‑A, Gigabit Ethernet" },
      { label: "Netzwerk", value: "WLAN 6E, Bluetooth 5.3" },
      { label: "Video", value: "Bis zu drei Displays" },
      { label: "Betriebssystem", value: "macOS" },
    ],
  },
  "mac-studio": {
    specs: [
      { label: "Größe und Gewicht", value: "197 × 197 × 95 mm / 2.740 g" },
      { label: "Anschlüsse vorne", value: "Zwei USB‑C, SDXC" },
      { label: "Anschlüsse hinten", value: "Vier Thunderbolt, HDMI, 10‑Gb‑Ethernet, zwei USB‑A, 3,5‑mm‑Kopfhörer" },
      { label: "Netzwerk", value: "WLAN 6E, Bluetooth 5.3" },
      { label: "Video", value: "Bis zu fünf Displays" },
      { label: "Betriebssystem", value: "macOS" },
    ],
  },
  "ipad-pro": {
    sizes: {
      '11"': [
        { label: "Größe und Gewicht", value: "249,7 × 177,5 × 5,3 mm / 444 g" },
        { label: "Display", value: "11‑Zoll‑Ultra‑Retina‑XDR mit ProMotion" },
        { label: "Auflösung", value: "2420 × 1668, 264 Pixel pro Zoll" },
      ],
      '13"': [
        { label: "Größe und Gewicht", value: "281,6 × 215,5 × 5,1 mm / 579 g" },
        { label: "Display", value: "13‑Zoll‑Ultra‑Retina‑XDR mit ProMotion" },
        { label: "Auflösung", value: "2752 × 2064, 264 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "1000 Nits SDR, 1600 Nits HDR" },
      { label: "Bildwiederholung", value: "10–120 Hz ProMotion, True Tone" },
      { label: "Kameras", value: "12‑MP‑Weitwinkel, 10‑MP‑Ultraweitwinkel, LiDAR" },
      { label: "Frontkamera", value: "12‑MP‑TrueDepth mit Center Stage" },
      { label: "Authentifizierung", value: "Face ID" },
      { label: "Anschlüsse", value: "USB‑C mit Thunderbolt / USB 4" },
      { label: "Netzwerk", value: "WLAN 6E, Bluetooth 5.3, optional 5G" },
      { label: "Apple Pencil", value: "Apple Pencil Pro" },
      { label: "Betriebssystem", value: "iPadOS" },
    ],
  },
  "ipad-air": {
    sizes: {
      '11"': [
        { label: "Größe und Gewicht", value: "247,6 × 178,5 × 6,1 mm / 462 g" },
        { label: "Display", value: "11‑Zoll‑Liquid‑Retina mit True Tone" },
        { label: "Auflösung", value: "2360 × 1640, 264 Pixel pro Zoll" },
      ],
      '13"': [
        { label: "Größe und Gewicht", value: "280,6 × 214,9 × 6,1 mm / 617 g" },
        { label: "Display", value: "13‑Zoll‑Liquid‑Retina mit True Tone" },
        { label: "Auflösung", value: "2732 × 2048, 264 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "500 Nits" },
      { label: "Kamera", value: "12‑MP‑Weitwinkel" },
      { label: "Frontkamera", value: "12‑MP‑Ultraweitwinkel mit Center Stage" },
      { label: "Authentifizierung", value: "Touch ID in der oberen Taste" },
      { label: "Anschlüsse", value: "USB‑C" },
      { label: "Netzwerk", value: "WLAN 6E, Bluetooth 5.3, optional 5G" },
      { label: "Apple Pencil", value: "Apple Pencil Pro" },
      { label: "Betriebssystem", value: "iPadOS" },
    ],
  },
  ipad: {
    sizes: {
      '10.9"': [
        { label: "Größe und Gewicht", value: "248,6 × 179,5 × 7,0 mm / 477 g" },
        { label: "Display", value: "10,9‑Zoll‑Liquid‑Retina mit True Tone" },
        { label: "Auflösung", value: "2360 × 1640, 264 Pixel pro Zoll" },
      ],
      '11"': [
        { label: "Größe und Gewicht", value: "249,7 × 177,5 × 5,3 mm / 477 g" },
        { label: "Display", value: "11‑Zoll‑Liquid‑Retina mit True Tone" },
        { label: "Auflösung", value: "2360 × 1640, 264 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "500 Nits" },
      { label: "Kamera", value: "12‑MP‑Weitwinkel" },
      { label: "Frontkamera", value: "12‑MP‑Ultraweitwinkel mit Center Stage" },
      { label: "Authentifizierung", value: "Touch ID in der oberen Taste" },
      { label: "Anschlüsse", value: "USB‑C" },
      { label: "Netzwerk", value: "WLAN, Bluetooth, optional 5G" },
      { label: "Betriebssystem", value: "iPadOS" },
    ],
  },
  "ipad-mini": {
    sizes: {
      '8.3"': [
        { label: "Größe und Gewicht", value: "195,4 × 134,8 × 6,3 mm / 293 g" },
        { label: "Display", value: "8,3‑Zoll‑Liquid‑Retina mit True Tone" },
        { label: "Auflösung", value: "2266 × 1488, 326 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "500 Nits" },
      { label: "Kamera", value: "12‑MP‑Weitwinkel" },
      { label: "Frontkamera", value: "12‑MP‑Ultraweitwinkel mit Center Stage" },
      { label: "Authentifizierung", value: "Touch ID in der oberen Taste" },
      { label: "Anschlüsse", value: "USB‑C" },
      { label: "Netzwerk", value: "WLAN, Bluetooth, optional 5G" },
      { label: "Betriebssystem", value: "iPadOS" },
    ],
  },
  "iphone-16-pro": {
    sizes: {
      '6,3"': [
        { label: "Größe und Gewicht", value: "149,6 × 71,5 × 8,25 mm / 199 g" },
        { label: "Display", value: "6,3‑Zoll‑Super‑Retina‑XDR‑OLED" },
        { label: "Auflösung", value: "2622 × 1206, 460 Pixel pro Zoll" },
      ],
      '6,9"': [
        { label: "Größe und Gewicht", value: "163,0 × 77,6 × 8,25 mm / 227 g" },
        { label: "Display", value: "6,9‑Zoll‑Super‑Retina‑XDR‑OLED" },
        { label: "Auflösung", value: "2868 × 1320, 460 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Bildwiederholung", value: "1–120 Hz ProMotion, Always On, True Tone" },
      { label: "Helligkeit", value: "1000 Nits SDR, 2000 Nits Peak" },
      { label: "Hauptkamera", value: "48‑MP‑Fusion mit 5x Tetraprism‑Tele" },
      { label: "Frontkamera", value: "12‑MP‑TrueDepth" },
      { label: "Authentifizierung", value: "Face ID" },
      { label: "Netzwerk", value: "5G, WLAN 7, Bluetooth 5.3" },
      { label: "SIM‑Karte", value: "Dual SIM: eSIM und/oder nano‑SIM" },
      { label: "Anschlüsse", value: "USB‑C" },
      { label: "Laden", value: "MagSafe, Qi2, kabelloses Laden" },
      { label: "Betriebssystem", value: "iOS" },
      {
        label: "Wasserdichtigkeit",
        value: "IP68 ab Werk; bei Gebrauchtgeräten nicht mehr garantiert.",
      },
    ],
  },
  "iphone-16": {
    sizes: {
      '6,1"': [
        { label: "Größe und Gewicht", value: "147,6 × 71,6 × 7,80 mm / 170 g" },
        { label: "Display", value: "6,1‑Zoll‑Super‑Retina‑XDR‑OLED" },
        { label: "Auflösung", value: "2556 × 1179, 460 Pixel pro Zoll" },
      ],
      '6,7"': [
        { label: "Größe und Gewicht", value: "160,9 × 77,8 × 7,80 mm / 199 g" },
        { label: "Display", value: "6,7‑Zoll‑Super‑Retina‑XDR‑OLED" },
        { label: "Auflösung", value: "2796 × 1290, 460 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "1000 Nits SDR, 2000 Nits Peak, True Tone" },
      { label: "Hauptkamera", value: "48‑MP‑Fusion‑Kamera" },
      { label: "Frontkamera", value: "12‑MP‑TrueDepth" },
      { label: "Authentifizierung", value: "Face ID" },
      { label: "Netzwerk", value: "5G, WLAN 7, Bluetooth 5.3" },
      { label: "SIM‑Karte", value: "Dual SIM: eSIM und/oder nano‑SIM" },
      { label: "Anschlüsse", value: "USB‑C" },
      { label: "Laden", value: "MagSafe, Qi2, kabelloses Laden" },
      { label: "Betriebssystem", value: "iOS" },
      {
        label: "Wasserdichtigkeit",
        value: "IP68 ab Werk; bei Gebrauchtgeräten nicht mehr garantiert.",
      },
    ],
  },
  "iphone-15": {
    sizes: {
      '6,1"': [
        { label: "Größe und Gewicht", value: "147,6 × 71,6 × 7,80 mm / 171 g" },
        { label: "Display", value: "6,1‑Zoll‑Super‑Retina‑XDR‑OLED" },
        { label: "Auflösung", value: "2556 × 1179, 460 Pixel pro Zoll" },
      ],
      '6,7"': [
        { label: "Größe und Gewicht", value: "160,9 × 77,8 × 7,80 mm / 201 g" },
        { label: "Display", value: "6,7‑Zoll‑Super‑Retina‑XDR‑OLED" },
        { label: "Auflösung", value: "2796 × 1290, 460 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "1000 Nits SDR, 2000 Nits Peak, True Tone" },
      { label: "Hauptkamera", value: "48‑MP‑Hauptkamera mit 2x Tele" },
      { label: "Frontkamera", value: "12‑MP‑TrueDepth" },
      { label: "Authentifizierung", value: "Face ID" },
      { label: "Netzwerk", value: "5G, WLAN 6, Bluetooth 5.3" },
      { label: "SIM‑Karte", value: "Dual SIM: eSIM und/oder nano‑SIM" },
      { label: "Anschlüsse", value: "USB‑C" },
      { label: "Laden", value: "MagSafe, Qi, kabelloses Laden" },
      { label: "Betriebssystem", value: "iOS" },
      {
        label: "Wasserdichtigkeit",
        value: "IP68 ab Werk; bei Gebrauchtgeräten nicht mehr garantiert.",
      },
    ],
  },
  "iphone-14": {
    sizes: {
      '6,1"': [
        { label: "Größe und Gewicht", value: "146,7 × 71,5 × 7,80 mm / 172 g" },
        { label: "Display", value: "6,1‑Zoll‑Super‑Retina‑XDR‑OLED" },
        { label: "Auflösung", value: "2532 × 1170, 460 Pixel pro Zoll" },
      ],
      '6,7"': [
        { label: "Größe und Gewicht", value: "160,7 × 78,1 × 7,80 mm / 203 g" },
        { label: "Display", value: "6,7‑Zoll‑Super‑Retina‑XDR‑OLED" },
        { label: "Auflösung", value: "2778 × 1284, 458 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "800 Nits SDR, 1200 Nits HDR, True Tone" },
      { label: "Hauptkamera", value: "12‑MP‑Dualkamera" },
      { label: "Frontkamera", value: "12‑MP‑TrueDepth" },
      { label: "Authentifizierung", value: "Face ID" },
      { label: "Netzwerk", value: "5G / LTE, WLAN 6, Bluetooth 5.3" },
      { label: "SIM‑Karte", value: "Dual SIM: nano‑SIM und/oder eSIM" },
      { label: "Anschlüsse", value: "Lightning" },
      { label: "Laden", value: "MagSafe, Qi, kabelloses Laden" },
      { label: "Betriebssystem", value: "iOS" },
      {
        label: "Wasserdichtigkeit",
        value: "IP68 ab Werk; bei Gebrauchtgeräten nicht mehr garantiert.",
      },
    ],
  },
  "iphone-se": {
    sizes: {
      '4,7"': [
        { label: "Größe und Gewicht", value: "138,4 × 67,3 × 7,3 mm / 144 g" },
        { label: "Display", value: "4,7‑Zoll‑Retina‑HD mit True Tone" },
        { label: "Auflösung", value: "1334 × 750, 326 Pixel pro Zoll" },
      ],
    },
    specs: [
      { label: "Helligkeit", value: "625 Nits" },
      { label: "Hauptkamera", value: "12‑MP‑Weitwinkel" },
      { label: "Frontkamera", value: "7‑MP FaceTime‑HD" },
      { label: "Authentifizierung", value: "Touch ID" },
      { label: "Netzwerk", value: "5G / LTE, WLAN 6, Bluetooth 5.0" },
      { label: "SIM‑Karte", value: "Dual SIM: nano‑SIM und/oder eSIM" },
      { label: "Anschlüsse", value: "Lightning" },
      { label: "Laden", value: "Qi, kabelloses Laden" },
      { label: "Betriebssystem", value: "iOS" },
      {
        label: "Wasserdichtigkeit",
        value: "IP67 ab Werk; bei Gebrauchtgeräten nicht mehr garantiert.",
      },
    ],
  },
};

const DUPLICATE_LABELS = new Set(["Speicherplatz", "Arbeitsspeicher"]);

function formatChip(chip: string): string {
  if (/^Apple\s/i.test(chip)) return chip;
  return `Apple ${chip}`;
}

export function getHardwareSpecs(listing: Listing): HardwareSpec[] {
  const model = SPECS[listing.modelId];
  if (!model) return [];

  const sizeRows = listing.size ? (model.sizes?.[listing.size] ?? []) : [];
  const rows = [...sizeRows, ...model.specs].filter((row) => !DUPLICATE_LABELS.has(row.label));

  if (!listing.chip) return rows;
  if (rows.some((row) => row.label === "Chip")) {
    return rows.map((row) =>
      row.label === "Chip" ? { label: "Chip", value: formatChip(listing.chip!) } : row,
    );
  }
  const insertAt = rows.findIndex((row) => row.label === "Kamera" || row.label === "Hauptkamera");
  const chipRow = { label: "Chip", value: formatChip(listing.chip) };
  if (insertAt < 0) return [chipRow, ...rows];
  return [...rows.slice(0, insertAt), chipRow, ...rows.slice(insertAt)];
}
