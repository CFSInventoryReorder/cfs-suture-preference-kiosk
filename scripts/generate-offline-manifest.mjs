/**
 * Generates public/offline-manifest.json containing URLs to precache.
 * FULL offline mode: Specialty pages + Card pages + CSV + assets.
 */
import fs from "fs";
import path from "path";
import Papa from "papaparse";

const projectRoot = process.cwd();
const csvPath = path.join(projectRoot, "public", "data", "preference_cards.csv");
const outPath = path.join(projectRoot, "public", "offline-manifest.json");

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function pick(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && String(row[k]).trim() !== "") return String(row[k]).trim();
  }
  return "";
}

const csvText = fs.readFileSync(csvPath, "utf8");
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
const rows = Array.isArray(parsed.data) ? parsed.data : [];

const specialties = new Set();
const cards = new Set();

for (const row of rows) {
  const specialty = pick(row, ["Specialty", "Surgical Specialty", "Service"]);
  const surgeon = pick(row, ["Surgeon", "Surgeon Name", "Provider"]);
  const procedure = pick(row, ["Procedure Name", "Procedure", "Lab"]);
  if (!specialty || !surgeon || !procedure) continue;

  specialties.add(specialty);
  cards.add(slugify(`${specialty}--${surgeon}--${procedure}`));
}

const urls = new Set();
urls.add("/");

for (const s of specialties) urls.add(`/specialty/${encodeURIComponent(s)}`);
for (const id of cards) urls.add(`/card/${id}`);

urls.add("/data/preference_cards.csv");
urls.add("/ucsd-logo.jpg");
urls.add("/manifest.json");
urls.add("/icons/icon-192.png");
urls.add("/icons/icon-512.png");

const manifest = Array.from(urls)
  .sort()
  .map((url) => ({ url, revision: null }));

fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Wrote ${manifest.length} precache entries to public/offline-manifest.json`);
