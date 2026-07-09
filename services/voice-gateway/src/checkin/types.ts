// Domain types + the swappable connector contract for attendance CHECK-IN — see
// PRODUCT_MODULES/AI_FRONT_DESK_CHECKIN_PLAN.md. Deliberately separate from
// src/adapter/types.ts (booking): different lifecycle, different rules, and this
// stays UNWIRED from tools.ts/orchestrator.ts until a real connector exists — no
// live tenant should see a check-in tool before there's something real behind it.

export interface Participant {
  participantId: string;
  name: string;
  phone?: string;
  isMinor: boolean;
  guardianOnFile: boolean; // Dash's own guardian/authorized-pickup flag, not our judgment
}

export interface Session {
  sessionId: string;
  label: string; // e.g. "Adult Soccer - Coed B - Field 2"
  startIso: string;
  endIso: string;
}

// Everything the rules pack needs, pulled read-only from the connector. No field here
// is guessed or LLM-supplied — each one comes from a live lookup.
export interface EligibilitySnapshot {
  participantId: string;
  sessionId: string;
  identityMatchCount: number; // how many participant records matched the caller's lookup
  onRoster: boolean;
  session: Session;
  waiverOnFile: boolean;
  waiverExpiresIso?: string;
  accountHold: boolean;
  isMinor: boolean;
  guardianOnFile: boolean;
}

export interface CheckInResult {
  checkInRef: string;
  sessionId: string;
  participantId: string;
  alreadyCheckedIn: boolean; // true when an idempotent retry found an existing check-in
}

export interface CheckInConnector {
  readonly name: string;
  findParticipant(args: { name?: string; phone?: string; memberId?: string }): Promise<Participant[]>;
  getTodaysSessions(args: { participantId: string }): Promise<Session[]>;
  getEligibility(args: { participantId: string; sessionId: string }): Promise<EligibilitySnapshot>;
  /** Commit a check-in. MUST be idempotent on idempotencyKey (same key -> same result, never double-counts). */
  checkIn(args: { participantId: string; sessionId: string; idempotencyKey: string }): Promise<CheckInResult>;
}
