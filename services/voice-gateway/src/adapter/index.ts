import { config } from "../config";
import type { BookingConnector } from "./types";
import { MockConnector } from "./mock";
import { CalComConnector } from "./calcom";

let connector: BookingConnector | null = null;

export function getConnector(): BookingConnector {
  if (connector) return connector;
  if (config.connector === "calcom" && config.calcom.apiKey && config.calcom.eventTypeId) {
    connector = new CalComConnector();
  } else {
    connector = new MockConnector();
  }
  return connector;
}

export type { BookingConnector };
