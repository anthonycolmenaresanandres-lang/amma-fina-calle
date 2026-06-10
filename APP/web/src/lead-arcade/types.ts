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
  | "UPGRADED"
  | "UPDATED"; // owner edits the dossier/notes/follow-up (no stage change)

export interface Dossier {
  rating: number;
  signature: string;
  fit: Fit;
}

/** Static metadata for a business tile; carried on the SCOUTED event so the
 *  whole world can be rebuilt from the event log alone. Positions are board-
 *  relative (0..1) so the illustrated board scales responsively. */
export interface LeadMeta {
  id: string;
  name: string;
  businessType: string;
  position: { x: number; y: number };
  dossier: Dossier;
  mockupPath?: string;
  notes?: string;
  followUp?: string; // ISO date (yyyy-mm-dd)
  // Campaign Pack readiness inputs (gathered by Survey; logo stays approval-gated).
  hours?: string;
  phone?: string;
  website?: string;
  themeColor?: string; // brand color hex
  logoCandidate?: string; // auto-found candidate URL — NOT approved for use
  logoApproved?: boolean; // owner confirms the real/approved logo
  operational?: boolean; // confirmed operating
}

/** Partial edit applied by an UPDATED event. */
export interface LeadPatch {
  name?: string;
  businessType?: string;
  rating?: number;
  signature?: string;
  fit?: Fit;
  notes?: string;
  followUp?: string;
  position?: { x: number; y: number };
  hours?: string;
  phone?: string;
  website?: string;
  themeColor?: string;
  logoCandidate?: string;
  logoApproved?: boolean;
  operational?: boolean;
}

export interface LeadEvent {
  leadId: string;
  action: ActionType;
  at: number; // epoch ms
  amount?: number; // CLOSED -> monthly mrr; COLLECTED -> payment amount
  note?: string;
  meta?: LeadMeta; // present on SCOUTED
  patch?: LeadPatch; // present on UPDATED
  territoryId?: string; // which board this lead belongs to (defaults to the first)
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

export const ACTION_VERB: Record<ActionType, string> = {
  SCOUTED: "scouted",
  SURVEYED: "surveyed",
  PITCHED: "pitched",
  CLOSED: "converted",
  COLLECTED: "paid",
  UPGRADED: "upgraded",
  UPDATED: "updated",
};
