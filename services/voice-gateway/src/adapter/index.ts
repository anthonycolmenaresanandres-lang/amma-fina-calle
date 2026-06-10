import type { BookingConnector } from "./types";
import type { Tenant } from "../tenant";
import { MockConnector } from "./mock";
import { CalComConnector } from "./calcom";
import { SquareConnector } from "./square";
import { WebhookConnector } from "./webhook";
import { ProposeConfirmConnector } from "./proposeConfirm";

// One connector instance per tenant (cached), built from that tenant's config.
const cache = new Map<string, BookingConnector>();

// Select a tenant's booking connector, falling back to propose-and-confirm when a real
// connector is selected but unconfigured (so the bot still works for anyone).
export function connectorFor(tenant: Tenant): BookingConnector {
  const cached = cache.get(tenant.id);
  if (cached) return cached;
  let connector: BookingConnector;
  switch (tenant.connector) {
    case "calcom":
      connector = tenant.calcom?.apiKey && tenant.calcom.eventTypeId ? new CalComConnector(tenant) : new ProposeConfirmConnector(tenant.business);
      break;
    case "square":
      connector = tenant.square?.accessToken && tenant.square.locationId && tenant.square.serviceVariationId
        ? new SquareConnector(tenant) : new ProposeConfirmConnector(tenant.business);
      break;
    case "webhook":
      connector = tenant.webhook?.bookUrl ? new WebhookConnector(tenant.webhook, tenant.business) : new ProposeConfirmConnector(tenant.business);
      break;
    case "proposeconfirm":
      connector = new ProposeConfirmConnector(tenant.business);
      break;
    default:
      connector = new MockConnector(tenant.business);
  }
  cache.set(tenant.id, connector);
  return connector;
}

export type { BookingConnector };
