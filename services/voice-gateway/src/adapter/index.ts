import { config } from "../config";
import type { BookingConnector } from "./types";
import { MockConnector } from "./mock";
import { CalComConnector } from "./calcom";
import { SquareConnector } from "./square";
import { ProposeConfirmConnector } from "./proposeConfirm";

let connector: BookingConnector | null = null;

// Select the booking connector by env, falling back to propose-and-confirm when a
// real connector is selected but unconfigured (so the bot still works for anyone).
export function getConnector(): BookingConnector {
  if (connector) return connector;
  switch (config.connector) {
    case "calcom":
      connector = config.calcom.apiKey && config.calcom.eventTypeId ? new CalComConnector() : new ProposeConfirmConnector();
      break;
    case "square":
      connector = config.square.accessToken && config.square.locationId && config.square.serviceVariationId
        ? new SquareConnector() : new ProposeConfirmConnector();
      break;
    case "proposeconfirm":
      connector = new ProposeConfirmConnector();
      break;
    default:
      connector = new MockConnector();
  }
  return connector;
}

export type { BookingConnector };
