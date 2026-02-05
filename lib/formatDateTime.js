// Formats a Date showing DATE ONLY (no time) for kiosk clarity.
export function formatLastUpdated(date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  } catch (_) {
    return date.toLocaleDateString();
  }
}
