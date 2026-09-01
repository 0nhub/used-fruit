const MONTHS: Record<string, number> = {
  januar: 1,
  jan: 1,
  februar: 2,
  feb: 2,
  maerz: 3,
  marz: 3,
  maer: 3,
  mar: 3,
  april: 4,
  apr: 4,
  mai: 5,
  juni: 6,
  jun: 6,
  juli: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sept: 9,
  sep: 9,
  oktober: 10,
  okt: 10,
  november: 11,
  nov: 11,
  dezember: 12,
  dez: 12,
  dec: 12,
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function lastDay(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function toIsoDate(year: number, month: number, day: number): string | null {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  const max = lastDay(year, month);
  if (day < 1 || day > max) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

function expandYear(year: number) {
  if (year >= 100) return year;
  return year >= 50 ? 1900 + year : 2000 + year;
}

function normalizeMonthName(value: string) {
  return value
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replace(".", "");
}

/** Accepts 15.3.27, 15.03.2027, März 2027, 3.2027, 2027-03-15, 15032027. */
export function parseFlexibleDate(input: string, mode: "live" | "commit" = "commit"): string | null {
  const raw = input.trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const named = raw.match(/^([A-Za-zÄÖÜäöü.]+)\s+(\d{2,4})$/);
  if (named) {
    const yearRaw = Number(named[2]);
    if (mode === "live" && yearRaw < 100) return null;
    const month = MONTHS[normalizeMonthName(named[1])];
    if (month) {
      const year = expandYear(yearRaw);
      return toIsoDate(year, month, lastDay(year, month));
    }
  }

  const digits = raw.replace(/\D/g, "");
  if (/^\d{8}$/.test(digits) && /^[\d.\s/-]+$/.test(raw)) {
    return toIsoDate(Number(digits.slice(4, 8)), Number(digits.slice(2, 4)), Number(digits.slice(0, 2)));
  }

  const parts = raw.split(/[.\s/-]+/).filter(Boolean);
  if (parts.length === 2 && parts.every((part) => /^\d{1,4}$/.test(part))) {
    const yearRaw = Number(parts[1]);
    if (mode === "live" && yearRaw < 100) return null;
    const month = Number(parts[0]);
    const year = expandYear(yearRaw);
    return toIsoDate(year, month, lastDay(year, month));
  }
  if (parts.length === 3 && parts.every((part) => /^\d{1,4}$/.test(part))) {
    const yearRaw = Number(parts[2]);
    if (mode === "live" && yearRaw < 100) return null;
    return toIsoDate(expandYear(yearRaw), Number(parts[1]), Number(parts[0]));
  }

  return null;
}

export function formatIsoToDe(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  return `${match[3]}.${match[2]}.${match[1]}`;
}

export function formatIsoLongDe(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function addMonthsToDate(from: Date, months: number): string {
  const year = from.getFullYear();
  const monthIndex = from.getMonth() + months;
  const day = from.getDate();
  const cursor = new Date(year, monthIndex, 1);
  const max = lastDay(cursor.getFullYear(), cursor.getMonth() + 1);
  return toIsoDate(cursor.getFullYear(), cursor.getMonth() + 1, Math.min(day, max)) ?? "";
}

export function calendarCells(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const days = lastDay(year, month);
  const cells: Array<{ day: number; iso: string } | null> = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= days; day += 1) {
    cells.push({ day, iso: `${year}-${pad(month)}-${pad(day)}` });
  }
  return cells;
}

export const WEEKDAYS_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
