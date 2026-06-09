// Lead Arcade — domain types. Event-sourced: the LeadEvent log is the source of
// truth; everything visible is derived from it (one click = one business event).

export type Stage = "prospect" | "surveyed" | "pitched" | "client" | "flagship";
export type Fit = "HOT" | "WARM" | "COLD";
export type ActionType =
  | "SCOUTED"
  | "SURVEYED"
  | "PITCHED"
  | "CLOSED"
  | "COLLECTED"
  | "UPGRADED";

/** Static metadata for a business tile; carried on the SCOUTED event so the
 *  whole world can be rebuilt from the event log alone. Positions are board-
 *  relative (0..1) so the illustrated board scales responsively. */
export interface LeadMeta {
  id: string;
  name: string;
  businessType: string;
  position: { x: number; y: number };
  dossier: { rating: number; signature: string; fit: Fit };
  mockupPath?: string;
}

export interface LeadEvent {
  leadId: string;
  action: ActionType;
  at: number; // epoch ms
  amount?: number; // CLOSED -> monthly mrr; COLLECTED -> payment amount
  note?: string;
  meta?: LeadMeta; // present on SCOUTED
}

/** Derived per-lead state (never persisted; always folded from events). */
export interface LeadState {
  meta: LeadMeta;
  stage: Stage;
  mrr: number; // monthly recurring once CLOSED
  collected: number; // sum of COLLECTED payments
  upgrades: number;
  lastAt: number;
}

export const STAGE_ORDER: Stage[] = ["prospect", "surveyed", "pitched", "client", "flagship"];

export const FIT_COLOR: Record<Fit, number> = {
  HOT: 0xe8553a,
  WARM: 0xe0a13a,
  COLD: 0x5a7fb0,
};

/** Brand-ish stage colors for the building marker. */
export const STAGE_COLOR: Record<Stage, number> = {
  prospect: 0x6b5a48,
  surveyed: 0x8a6d3f,
  pitched: 0xc08a3c,
  client: 0x2f9e54,
  flagship: 0xd8a24c,
};
