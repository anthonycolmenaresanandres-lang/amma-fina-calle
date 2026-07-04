// Simulator for the check-in rules pack — proves the properties that matter BEFORE any
// DaySmart API access exists: every rule blocks on its own, all-pass allows a commit,
// a repeated commit is idempotent (never double-counts attendance), and a minor with no
// guardian on file is never let through regardless of every other rule passing. No
// network, no keys — mirrors src/simulate.ts. Exits non-zero on any failure.

import { evaluateEligibility } from "./rules";
import { MockCheckInConnector, type MockFixture } from "./mockConnector";
import type { EligibilitySnapshot } from "./types";

let failures = 0;
function check(label: string, cond: boolean): void {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);
  if (!cond) failures++;
}

const NOW = "2026-07-04T19:00:00.000Z";
const SESSION = { sessionId: "s1", label: "Adult Soccer - Coed B - Field 2", startIso: "2026-07-04T19:10:00.000Z", endIso: "2026-07-04T20:10:00.000Z" };

function baseSnapshot(overrides: Partial<EligibilitySnapshot> = {}): EligibilitySnapshot {
  return {
    participantId: "p1", sessionId: "s1", identityMatchCount: 1, onRoster: true, session: SESSION,
    waiverOnFile: true, accountHold: false, isMinor: false, guardianOnFile: false,
    ...overrides,
  };
}

async function main(): Promise<void> {
  // ---- Rules pack: every failure mode blocks on its own ----
  check("all-pass commits clean", evaluateEligibility(baseSnapshot(), NOW).pass);
  check("ambiguous identity blocks", !evaluateEligibility(baseSnapshot({ identityMatchCount: 0 }), NOW).pass);
  check("ambiguous identity (multiple matches) blocks", !evaluateEligibility(baseSnapshot({ identityMatchCount: 2 }), NOW).pass);
  check("not on roster blocks", !evaluateEligibility(baseSnapshot({ onRoster: false }), NOW).pass);
  check("outside check-in window blocks", !evaluateEligibility(baseSnapshot(), "2026-07-04T10:00:00.000Z").pass);
  check("60-min-before window opens correctly", evaluateEligibility(baseSnapshot(), "2026-07-04T18:15:00.000Z").pass);
  check("no waiver on file blocks", !evaluateEligibility(baseSnapshot({ waiverOnFile: false }), NOW).pass);
  check("expired waiver blocks", !evaluateEligibility(baseSnapshot({ waiverExpiresIso: "2026-01-01T00:00:00.000Z" }), NOW).pass);
  check("account hold blocks", !evaluateEligibility(baseSnapshot({ accountHold: true }), NOW).pass);
  check("minor with no guardian on file blocks", !evaluateEligibility(baseSnapshot({ isMinor: true, guardianOnFile: false }), NOW).pass);
  check("minor WITH guardian on file passes", evaluateEligibility(baseSnapshot({ isMinor: true, guardianOnFile: true }), NOW).pass);

  const multi = evaluateEligibility(baseSnapshot({ onRoster: false, waiverOnFile: false }), NOW);
  check("multiple simultaneous failures are all reported, not just the first", multi.failures.length === 2);

  // ---- Mock connector: idempotent commit, isolated fixtures ----
  const fixture: MockFixture = {
    participant: { participantId: "p1", name: "Jordan Lee", phone: "+17575551234", isMinor: false, guardianOnFile: false },
    sessions: [SESSION],
    onRoster: { s1: true },
    waiverOnFile: true,
    accountHold: false,
  };
  const connector = new MockCheckInConnector([fixture]);

  const found = await connector.findParticipant({ phone: "+17575551234" });
  check("connector finds exactly one participant by phone", found.length === 1 && found[0]?.participantId === "p1");

  const snapshot = await connector.getEligibility({ participantId: "p1", sessionId: "s1" });
  check("connector eligibility snapshot reflects fixture", snapshot.onRoster && snapshot.waiverOnFile);

  const first = await connector.checkIn({ participantId: "p1", sessionId: "s1", idempotencyKey: "call-1" });
  const retry = await connector.checkIn({ participantId: "p1", sessionId: "s1", idempotencyKey: "call-1" });
  check("commit succeeds", !first.alreadyCheckedIn && !!first.checkInRef);
  check("retried commit with same key is idempotent (no double check-in)", retry.alreadyCheckedIn && retry.checkInRef === first.checkInRef);

  const differentKey = await connector.checkIn({ participantId: "p1", sessionId: "s1", idempotencyKey: "call-2" });
  check("a genuinely new call gets its own ref (not silently merged)", differentKey.checkInRef !== first.checkInRef);

  console.log(failures === 0 ? `\nAll checks passed.` : `\n${failures} check(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
