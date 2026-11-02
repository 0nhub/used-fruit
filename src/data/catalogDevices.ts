import type { ModelDefinition } from "@/lib/types";

type Color = ModelDefinition["colors"][number];

function color(id: string, label: string, hex: string): Color {
  return { id, label, hex };
}

const black = color("schwarz", "Schwarz", "#1D1D1F");
const white = color("weiss", "Weiß", "#F5F5F7");
const silver = color("silber", "Silber", "#C0C0C5");
const gold = color("gold", "Gold", "#D4AF77");
const spaceGray = color("space-grau", "Space Grau", "#7D7E80");
const roseGold = color("rose-gold", "Roségold", "#E6C7C2");
const jetBlack = color("jet-black", "Glänzend Schwarz", "#0B0B0D");
const red = color("rot", "Rot", "#C41E3A");
const blue = color("blau", "Blau", "#A8BDD4");
const green = color("gruen", "Grün", "#A8C5A0");
const yellow = color("gelb", "Gelb", "#F5D76E");
const pink = color("rosa", "Rosa", "#E8B4B8");
const purple = color("violett", "Violett", "#B8A9C9");
const coral = color("koralle", "Koralle", "#F0947A");
const midnight = color("mitternacht", "Mitternacht", "#232A31");
const starlight = color("polarstern", "Polarstern", "#F0E4D3");
const graphite = color("graphit", "Graphit", "#5B5B5F");
const pacificBlue = color("pazifikblau", "Pazifikblau", "#3E546A");
const sierraBlue = color("sierra-blau", "Sierrablau", "#A7C1D1");
const alpineGreen = color("alpingruen", "Alpingrün", "#5E6A58");
const deepPurple = color("tiefviolett", "Tiefviolett", "#4A3B55");
const natural = color("natural", "Natural Titanium", "#C2BCB2");
const blackTi = color("schwarz-ti", "Black Titanium", "#3C3C3C");
const whiteTi = color("weiss-ti", "White Titanium", "#F5F5F0");
const blueTi = color("blau-ti", "Blue Titanium", "#3B4455");
const glacier = color("gletscher", "Gletscher", "#D5DDE3");
const burgundy = color("bordeaux", "Bordeaux", "#6E3040");
const mistBlue = color("nebelblau", "Nebelblau", "#B7C9D6");
const sage = color("salbei", "Salbei", "#B7C4B0");
const lavender = color("lavendel", "Lavendel", "#C9C0D4");
const softPink = color("zartrosa", "Zartrosa", "#F0C9CF");
const cloudWhite = color("wolkenweiss", "Wolkenweiß", "#F4F1EA");
const lightGold = color("helles-gold", "Helles Gold", "#E4D2B6");
const skyBlue = color("himmelblau", "Himmelblau", "#A8C5DA");
const spaceBlack = color("space-schwarz", "Space Schwarz", "#2E2E2E");
const starWhite = color("sternweiss", "Sternweiß", "#F7F4EF");
const nightSky = color("nachthimmel", "Nachthimmel", "#1C2430");
const cosmicOrange = color("kosmosorange", "Kosmosorange", "#D4652F");
const deepBlue = color("tiefblau", "Tiefblau", "#2C3A4F");

function phone(
  id: string,
  name: string,
  year: number,
  chip: string,
  size: string | undefined,
  memory: string,
  storage: string[],
  colors: Color[],
  featured = false,
): ModelDefinition {
  return {
    id,
    categoryId: "iphone",
    name,
    featured,
    sizes: size ? [size] : undefined,
    years: [year],
    colors,
    memoryOptions: [memory],
    storageOptions: storage,
    chipOptions: [chip],
  };
}

const gb = (...values: string[]) => values.map((value) => `${value} GB`);
const tb = (...values: string[]) => values.map((value) => (value.includes("TB") ? value : `${value} TB`));

/** Current store lineup first, then every earlier iPhone back to the 3GS. */
export const MORE_IPHONES: ModelDefinition[] = [
  phone("iphone-18-pro", "iPhone 18 Pro", 2026, "A20 Pro", '6,3"', "12 GB", [...gb("256", "512"), ...tb("1", "2")], [black, silver, glacier, burgundy], true),
  phone("iphone-18-pro-max", "iPhone 18 Pro Max", 2026, "A20 Pro", '6,9"', "12 GB", [...gb("256", "512"), ...tb("1", "2")], [black, silver, glacier, burgundy], true),
  phone("iphone-duo", "iPhone Duo", 2026, "A20 Pro", undefined, "12 GB", [...gb("256", "512"), ...tb("1", "2")], [starWhite, nightSky], true),
  phone("iphone-air", "iPhone Air", 2025, "A19 Pro", '6,5"', "12 GB", [...gb("256", "512"), "1 TB"], [spaceBlack, cloudWhite, lightGold, skyBlue], true),
  phone("iphone-17", "iPhone 17", 2025, "A19", '6,3"', "8 GB", gb("256", "512"), [black, white, mistBlue, sage, lavender], true),
  phone("iphone-17e", "iPhone 17e", 2026, "A19", '6,1"', "8 GB", gb("256", "512"), [black, white, softPink], true),
  phone("iphone-17-pro", "iPhone 17 Pro", 2025, "A19 Pro", '6,3"', "12 GB", [...gb("256", "512"), "1 TB"], [silver, cosmicOrange, deepBlue]),
  phone("iphone-17-pro-max", "iPhone 17 Pro Max", 2025, "A19 Pro", '6,9"', "12 GB", [...gb("256", "512"), "1 TB"], [silver, cosmicOrange, deepBlue]),
  phone("iphone-16e", "iPhone 16e", 2025, "A18", '6,1"', "8 GB", gb("128", "256", "512"), [black, white]),
  phone("iphone-15-pro", "iPhone 15 Pro", 2023, "A17 Pro", '6,1"', "8 GB", [...gb("128", "256", "512"), "1 TB"], [natural, blueTi, whiteTi, blackTi]),
  phone("iphone-15-pro-max", "iPhone 15 Pro Max", 2023, "A17 Pro", '6,7"', "8 GB", [...gb("256", "512"), "1 TB"], [natural, blueTi, whiteTi, blackTi]),
  phone("iphone-14-pro", "iPhone 14 Pro", 2022, "A16", '6,1"', "6 GB", [...gb("128", "256", "512"), "1 TB"], [spaceBlack, silver, gold, deepPurple]),
  phone("iphone-14-pro-max", "iPhone 14 Pro Max", 2022, "A16", '6,7"', "6 GB", [...gb("128", "256", "512"), "1 TB"], [spaceBlack, silver, gold, deepPurple]),
  phone("iphone-13-pro", "iPhone 13 Pro", 2021, "A15", '6,1"', "6 GB", [...gb("128", "256", "512"), "1 TB"], [graphite, gold, silver, sierraBlue, alpineGreen]),
  phone("iphone-13-pro-max", "iPhone 13 Pro Max", 2021, "A15", '6,7"', "6 GB", [...gb("128", "256", "512"), "1 TB"], [graphite, gold, silver, sierraBlue, alpineGreen]),
  phone("iphone-13", "iPhone 13", 2021, "A15", '6,1"', "4 GB", gb("128", "256", "512"), [midnight, starlight, blue, pink, red, green]),
  phone("iphone-13-mini", "iPhone 13 mini", 2021, "A15", '5,4"', "4 GB", gb("128", "256", "512"), [midnight, starlight, blue, pink, red, green]),
  phone("iphone-12-pro", "iPhone 12 Pro", 2020, "A14", '6,1"', "6 GB", gb("128", "256", "512"), [graphite, silver, gold, pacificBlue]),
  phone("iphone-12-pro-max", "iPhone 12 Pro Max", 2020, "A14", '6,7"', "6 GB", gb("128", "256", "512"), [graphite, silver, gold, pacificBlue]),
  phone("iphone-12", "iPhone 12", 2020, "A14", '6,1"', "4 GB", gb("64", "128", "256"), [black, white, red, green, blue, purple]),
  phone("iphone-12-mini", "iPhone 12 mini", 2020, "A14", '5,4"', "4 GB", gb("64", "128", "256"), [black, white, red, green, blue, purple]),
  phone("iphone-se-2020", "iPhone SE (2. Generation)", 2020, "A13", '4,7"', "3 GB", gb("64", "128", "256"), [black, white, red]),
  phone("iphone-11-pro", "iPhone 11 Pro", 2019, "A13", '5,8"', "4 GB", gb("64", "256", "512"), [spaceGray, silver, gold, color("nachtgruen", "Nachtgrün", "#4E5850")]),
  phone("iphone-11-pro-max", "iPhone 11 Pro Max", 2019, "A13", '6,5"', "4 GB", gb("64", "256", "512"), [spaceGray, silver, gold, color("nachtgruen", "Nachtgrün", "#4E5850")]),
  phone("iphone-11", "iPhone 11", 2019, "A13", '6,1"', "4 GB", gb("64", "128", "256"), [black, white, red, yellow, green, purple]),
  phone("iphone-xs", "iPhone XS", 2018, "A12", '5,8"', "4 GB", gb("64", "256", "512"), [spaceGray, silver, gold]),
  phone("iphone-xs-max", "iPhone XS Max", 2018, "A12", '6,5"', "4 GB", gb("64", "256", "512"), [spaceGray, silver, gold]),
  phone("iphone-xr", "iPhone XR", 2018, "A12", '6,1"', "3 GB", gb("64", "128", "256"), [black, white, blue, yellow, coral, red]),
  phone("iphone-x", "iPhone X", 2017, "A11", '5,8"', "3 GB", gb("64", "256"), [spaceGray, silver]),
  phone("iphone-8-plus", "iPhone 8 Plus", 2017, "A11", '5,5"', "3 GB", gb("64", "128", "256"), [spaceGray, silver, gold, red]),
  phone("iphone-8", "iPhone 8", 2017, "A11", '4,7"', "2 GB", gb("64", "128", "256"), [spaceGray, silver, gold, red]),
  phone("iphone-7-plus", "iPhone 7 Plus", 2016, "A10", '5,5"', "3 GB", gb("32", "128", "256"), [black, jetBlack, silver, gold, roseGold, red]),
  phone("iphone-7", "iPhone 7", 2016, "A10", '4,7"', "2 GB", gb("32", "128", "256"), [black, jetBlack, silver, gold, roseGold, red]),
  phone("iphone-se-2016", "iPhone SE (1. Generation)", 2016, "A9", '4"', "2 GB", gb("16", "32", "64", "128"), [spaceGray, silver, gold, roseGold]),
  phone("iphone-6s-plus", "iPhone 6s Plus", 2015, "A9", '5,5"', "2 GB", gb("16", "32", "64", "128"), [spaceGray, silver, gold, roseGold]),
  phone("iphone-6s", "iPhone 6s", 2015, "A9", '4,7"', "2 GB", gb("16", "32", "64", "128"), [spaceGray, silver, gold, roseGold]),
  phone("iphone-6-plus", "iPhone 6 Plus", 2014, "A8", '5,5"', "1 GB", gb("16", "64", "128"), [spaceGray, silver, gold]),
  phone("iphone-6", "iPhone 6", 2014, "A8", '4,7"', "1 GB", gb("16", "64", "128"), [spaceGray, silver, gold]),
  phone("iphone-5s", "iPhone 5s", 2013, "A7", '4"', "1 GB", gb("16", "32", "64"), [spaceGray, silver, gold]),
  phone("iphone-5c", "iPhone 5c", 2013, "A6", '4"', "1 GB", gb("8", "16", "32"), [white, blue, green, yellow, pink]),
  phone("iphone-5", "iPhone 5", 2012, "A6", '4"', "1 GB", gb("16", "32", "64"), [black, white]),
  phone("iphone-4s", "iPhone 4S", 2011, "A5", '3,5"', "512 MB", gb("8", "16", "32", "64"), [black, white]),
  phone("iphone-4", "iPhone 4", 2010, "A4", '3,5"', "512 MB", gb("8", "16", "32"), [black, white]),
  phone("iphone-3gs", "iPhone 3GS", 2009, "Samsung APL0298", '3,5"', "256 MB", gb("8", "16", "32"), [black, white]),
];

export const LEGACY_MACS: ModelDefinition[] = [
  {
    id: "macbook",
    categoryId: "mac",
    name: "MacBook",
    sizes: ['12"'],
    years: [2015, 2016, 2017],
    colors: [silver, spaceGray, gold, roseGold],
    memoryOptions: ["8 GB", "16 GB"],
    storageOptions: ["256 GB", "512 GB"],
    chipOptions: ["Intel Core m3", "Intel Core m5", "Intel Core m7", "Intel Core i5"],
  },
  {
    id: "imac-pro",
    categoryId: "mac",
    name: "iMac Pro",
    sizes: ['27"'],
    years: [2017],
    colors: [spaceGray],
    memoryOptions: ["32 GB", "64 GB", "128 GB", "256 GB"],
    storageOptions: ["1 TB", "2 TB", "4 TB"],
    chipOptions: ["Intel Xeon W"],
  },
];
