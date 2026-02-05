import Papa from "papaparse";
import { slugify } from "./slug";

const DATA_URL = "/data/preference_cards.csv";

function toInt(v) {
  const n = parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

function pick(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && String(row[k]).trim() !== "") return String(row[k]).trim();
  }
  return "";
}

export async function loadData() {
  const res = await fetch(DATA_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load data (${res.status})`);
  const csvText = await res.text();

  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const rows = Array.isArray(parsed.data) ? parsed.data : [];

  // specialty -> key(surgeon|procedure) -> card
  const specialtyMap = new Map();

  for (const row of rows) {
    const specialty = pick(row, ["Specialty", "Surgical Specialty", "Service"]);
    const surgeon = pick(row, ["Surgeon", "Surgeon Name", "Provider"]);
    const procedure = pick(row, ["Procedure Name", "Procedure", "Lab"]);
    const sutureName = pick(row, ["Suture Name", "Suture", "Product Description", "Name"]);
    const description = pick(row, ["Description", "Suture Description", "Product Description 2"]);
    const sku = pick(row, ["SKU", "Manufacturer SKU", "Item SKU"]);
    const qty = toInt(pick(row, ["Quantity", "Qty", "Amount"]));

    if (!specialty || !surgeon || !procedure || !sutureName) continue;

    if (!specialtyMap.has(specialty)) specialtyMap.set(specialty, new Map());
    const cardKey = `${surgeon}||${procedure}`;
    const cardMap = specialtyMap.get(specialty);

    if (!cardMap.has(cardKey)) {
      cardMap.set(cardKey, {
        id: slugify(`${specialty}--${surgeon}--${procedure}`),
        specialty,
        surgeon,
        procedure,
        items: [],
      });
    }

    cardMap.get(cardKey).items.push({ sutureName, description, sku, qty });
  }

  const specialties = Array.from(specialtyMap.entries())
    .map(([name, cardMap]) => {
      const cards = Array.from(cardMap.values()).map((c) => {
        c.items.sort((a, b) => a.sutureName.localeCompare(b.sutureName));
        return c;
      });

      cards.sort((a, b) => {
        const s = a.surgeon.localeCompare(b.surgeon);
        if (s !== 0) return s;
        return a.procedure.localeCompare(b.procedure);
      });

      return { name, cards };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return specialties;
}
