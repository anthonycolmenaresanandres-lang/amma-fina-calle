import type { TableOsVenue } from "./venue-config";

export type ToastDestination = Readonly<{
  url: string;
  mode: "TABLE_ORDER_PAY" | "PUBLIC_ORDERING_PREVIEW";
  buttonLabel: string;
  statusLine: string;
}>;

const HTTPS_URL = /^https:\/\//i;

function safeExternalUrl(value: string): string {
  if (!HTTPS_URL.test(value)) {
    throw new Error("Toast destinations must use HTTPS.");
  }

  return value;
}

export function resolveToastDestination(venue: TableOsVenue, tableId: string): ToastDestination {
  const tableUrl = venue.toast.tableOrderPayUrls[tableId];

  if (venue.toast.tableOrderPayStatus === "READY" && tableUrl) {
    return {
      url: safeExternalUrl(tableUrl),
      mode: "TABLE_ORDER_PAY",
      buttonLabel: "Order & pay on Toast",
      statusLine: `Toast will attach this visit to ${tableId}.`,
    };
  }

  return {
    url: safeExternalUrl(venue.toast.publicOrderUrl),
    mode: "PUBLIC_ORDERING_PREVIEW",
    buttonLabel: "Open current Toast ordering",
    statusLine: "Pay-at-table activates after the owner enables Toast Mobile Order & Pay and supplies each table link.",
  };
}
