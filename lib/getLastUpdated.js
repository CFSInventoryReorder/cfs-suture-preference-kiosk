const API_URL = "/api/last-updated";
const CACHE_KEY = "suture_cards_last_updated_mtimeMs";

export async function getLastUpdated() {
  // Try API (works in dev + production). If offline, fall back to cached value.
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    if (data && typeof data.mtimeMs === "number") {
      try {
        localStorage.setItem(CACHE_KEY, String(data.mtimeMs));
      } catch (_) {}
      return new Date(data.mtimeMs);
    }
  } catch (_) {
    // ignore
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const n = Number(cached);
      if (Number.isFinite(n)) return new Date(n);
    }
  } catch (_) {}

  return null;
}
