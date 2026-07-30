import type { TableOsVenue } from "./venue-config";

export type OrderDestination = Readonly<{
  url: string;
  mode: "TABLE_ORDER_PAY" | "PUBLIC_ORDERING_PREVIEW";
  buttonLabel: string;
  statusLine: string;
}>;

const HTTPS_URL = /^https:\/\//i;

function safeExternalUrl(value: string): string {
  if (!HTTPS_URL.test(value)) {
    throw new Error("Ordering destinations must use HTTPS.");
  }

  return value;
}

export function resolveOrderDestination(venue: TableOsVenue, tableId: string): OrderDestination {
  const tableUrl = venue.ordering.tableOrderPayUrls[tableId];
  const provider = venue.ordering.providerName;

  if (venue.ordering.tableOrderPayStatus === "READY" && tableUrl) {
    return {
      url: safeExternalUrl(tableUrl),
      mode: "TABLE_ORDER_PAY",
      buttonLabel: `Order & pay with ${provider}`,
      statusLine: `${provider} will open the checkout configured for this table.`,
    };
  }

  return {
    url: safeExternalUrl(venue.ordering.publicOrderUrl),
    mode: "PUBLIC_ORDERING_PREVIEW",
    buttonLabel: `Open current ${provider} ordering`,
    statusLine:
      "Current pickup/delivery handoff only. Dine-in activation requires owner-confirmed POS and table routing.",
  };
}
