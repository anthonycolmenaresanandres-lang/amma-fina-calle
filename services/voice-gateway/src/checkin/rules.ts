// The deterministic rules pack: every attendance check-in is gated by this, in code,
// evaluated against a live EligibilitySnapshot. The LLM never adjudicates any of this —
// it only supplies which participant/session to look up. ALL rules must pass to allow
// a commit; any single failure blocks and names the reason, for the assistant to relay
// verbatim and escalate to front-desk staff. See PRODUCT_MODULES/AI_FRONT_DESK_CHECKIN_PLAN.md.

import type { EligibilitySnapshot } from "./types";

export type RuleFailureCode =
  | "IDENTITY_AMBIGUOUS"
  | "NOT_ON_ROSTER"
  | "OUTSIDE_WINDOW"
  | "NO_WAIVER"
  | "ACCOUNT_HOLD"
  | "MINOR_NO_GUARDIAN";

export interface RuleFailure { code: RuleFailureCode; reason: string }
export interface EligibilityVerdict { pass: boolean; failures: RuleFailure[] }

/** Minutes before a session's start that check-in opens; check-in stays open through the session end. */
export const CHECKIN_WINDOW_BEFORE_MIN = 60;

/** Pure function: same snapshot + same `nowIso` always yields the same verdict. Fully unit-testable. */
export function evaluateEligibility(snapshot: EligibilitySnapshot, nowIso: string): EligibilityVerdict {
  const failures: RuleFailure[] = [];
  const now = Date.parse(nowIso);

  if (snapshot.identityMatchCount !== 1) {
    failures.push({ code: "IDENTITY_AMBIGUOUS", reason: "I couldn't match that to exactly one person on file." });
  }
  if (!snapshot.onRoster) {
    failures.push({ code: "NOT_ON_ROSTER", reason: "I don't see that person on the roster for this session." });
  }

  const windowStart = Date.parse(snapshot.session.startIso) - CHECKIN_WINDOW_BEFORE_MIN * 60_000;
  const windowEnd = Date.parse(snapshot.session.endIso);
  if (now < windowStart || now > windowEnd) {
    failures.push({ code: "OUTSIDE_WINDOW", reason: `Check-in for "${snapshot.session.label}" isn't open right now.` });
  }

  const waiverExpired = snapshot.waiverExpiresIso !== undefined && Date.parse(snapshot.waiverExpiresIso) < now;
  if (!snapshot.waiverOnFile || waiverExpired) {
    failures.push({ code: "NO_WAIVER", reason: "I don't see a current signed waiver on file." });
  }
  if (snapshot.accountHold) {
    failures.push({ code: "ACCOUNT_HOLD", reason: "There's a hold on that account." });
  }
  if (snapshot.isMinor && !snapshot.guardianOnFile) {
    failures.push({ code: "MINOR_NO_GUARDIAN", reason: "I don't see an authorized guardian on file for this participant." });
  }

  return { pass: failures.length === 0, failures };
}
