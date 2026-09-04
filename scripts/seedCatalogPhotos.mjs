/**
 * Füllt Appbackend catalog_photos mit Textzeilen (ohne Bilder).
 * 3 Slots je Modell+Farbe: front / back / side.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));

const TABLE_ID = "aMYWSrgiDN8b";
const BASE = `https://v1.appbackend.io/v1/rows/${TABLE_ID}`;
const VIEWS = [
  { view: "front", position: 1 },
  { view: "back", position: 2 },
  { view: "side", position: 3 },
];

const VARIANTS = [
  ["macbook-neo", ["silber", "zitrus", "indigo", "rosa"]],
  ["macbook-air", ["mitternacht", "polarstern", "himmelblau", "silber", "space-grau", "gold"]],
  ["macbook-pro", ["space-schwarz", "space-grau", "silber"]],
  ["imac", ["blau", "gruen", "rosa", "silber", "gelb", "violett", "orange"]],
  ["mac-mini", ["silber", "space-grau"]],
  ["mac-studio", ["silber"]],
  ["ipad-pro", ["space-schwarz", "silber"]],
  ["ipad-air", ["space-grau", "silber", "gold", "blau", "violett", "polarstern", "rosa", "gruen", "himmelblau"]],
  ["ipad", ["blau", "rosa", "gelb", "silber"]],
  ["ipad-mini", ["space-grau", "rosa", "violett", "polarstern"]],
  ["iphone-16-pro", ["natural", "schwarz-ti", "weiss-ti", "blau-ti"]],
  ["iphone-16", ["schwarz", "weiss", "rosa", "teal", "ultramarine"]],
  ["iphone-15", ["schwarz", "blau", "gruen", "gelb", "rosa"]],
  ["iphone-14", ["mitternacht", "polarstern", "blau", "violett", "rot", "gelb"]],
  ["iphone-se", ["mitternacht", "polarstern", "rot"]],
];

function loadApiKey() {
  const raw = readFileSync(resolve(scriptDir, "../.env.local"), "utf8");
  const match = raw.match(/^APPBACKEND_API_KEY=(.*)$/m);
  const key = match?.[1]?.trim();
  if (!key) throw new Error("APPBACKEND_API_KEY fehlt in .env.local");
  return key;
}

function plannedRows() {
  const rows = [];
  for (const [model_id, colors] of VARIANTS) {
    for (const color_id of colors) {
      for (const item of VIEWS) {
        rows.push({
          model_id,
          color_id,
          view: item.view,
          position: item.position,
          image: "pending",
        });
      }
    }
  }
  return rows;
}

function rowKey(row) {
  return `${row.model_id}|${row.color_id}|${row.view}|${row.position}`;
}

async function request(url, apiKey, init) {
  const target = new URL(url);
  target.searchParams.set("api_key", apiKey);
  const response = await fetch(target, init);
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${typeof json === "string" ? json : JSON.stringify(json)}`);
  }
  return json;
}

async function loadAll(apiKey) {
  const rows = [];
  let page = 1;
  let total = Infinity;
  while ((page - 1) * 100 < total) {
    const json = await request(`${BASE}?page=${page}&limit=100`, apiKey);
    const data = Array.isArray(json.data) ? json.data : [];
    rows.push(...data);
    total = typeof json.count === "number" ? json.count : data.length;
    if (data.length === 0) break;
    page += 1;
  }
  return rows;
}

async function main() {
  const apiKey = loadApiKey();
  const existing = await loadAll(apiKey);
  const dummyIds = existing
    .filter((row) => String(row.model_id ?? "") === "123" || !row.model_id)
    .map((row) => row._id)
    .filter(Boolean);
  if (dummyIds.length) {
    await request(BASE, apiKey, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dummyIds),
    });
  }

  const have = new Set(
    existing
      .filter((row) => !dummyIds.includes(row._id))
      .map((row) => rowKey(row)),
  );
  const toCreate = plannedRows().filter((row) => !have.has(rowKey(row)));

  let created = 0;
  for (const row of toCreate) {
    await request(BASE, apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([row]),
    });
    created += 1;
  }

  const after = await loadAll(apiKey);
  const byModel = {};
  for (const row of after) {
    const id = String(row.model_id ?? "?");
    byModel[id] = (byModel[id] ?? 0) + 1;
  }
  console.log(
    JSON.stringify(
      {
        deletedDummy: dummyIds.length,
        alreadyPresent: have.size,
        created,
        totalNow: after.length,
        perModel: byModel,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
