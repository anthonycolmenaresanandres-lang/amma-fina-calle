import type { TableOsVenue } from "./venue-config";

// Exact hosts only. A different owner-provided Toast host requires a separate review.
const TOAST_PAYMENT_HOSTS = new Set(["toasttab.com", "www.toasttab.com"]);
export function verifiedToastUrl(value: unknown): string | null {
  if (typeof value !== "string" || !/^https:\/\//.test(value) || /[\s\\]|%0[ad]/i.test(value)) return null;
  try {
    const url = new URL(value);
    if (!TOAST_PAYMENT_HOSTS.has(url.hostname) || url.username || url.password || url.port || url.hash || url.pathname === "/" || url.pathname.startsWith("/local/order") || url.pathname.includes("//")) return null;
    for (const key of url.searchParams.keys()) if (/^(url|redirect|redirect_uri|redirect_url|return|returnurl|return_url|next|callback)$/i.test(key)) return null;
    return value; // Preserve the exact reviewed URL; never generate or append parameters.
  } catch { return null; }
}

export function resolveTablePayment(venue: TableOsVenue, tableId: string): string | null {
  const payment = venue.ordering.tablePayment;
  if (venue.id !== "maracaibo" || venue.reviewStatus !== "APPROVED" || venue.ordering.providerName !== "Toast" || payment?.status !== "OWNER_VERIFIED") return null;
  if (!Object.hasOwn(payment.tableUrls, tableId)) return null;
  return verifiedToastUrl(payment.tableUrls[tableId]);
}
