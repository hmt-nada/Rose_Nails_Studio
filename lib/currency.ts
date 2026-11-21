/**
 * Studio currency and price formatting utilities.
 */
export const CURRENCY = "DA";

/**
 * Formats a monetary amount with thousand-separators and the studio currency.
 * e.g. 2500 -> "2 500 DA"
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) {
    return `0 ${CURRENCY}`;
  }
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} ${CURRENCY}`;
}

/**
 * Formats service duration in minutes into a clean human-readable string.
 * e.g. 45 -> "45 min", 60 -> "1h", 90 -> "1h 30min"
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}min`;
}
