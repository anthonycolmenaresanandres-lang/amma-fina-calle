// Simulator — exercises the draft-first booking loop end to end WITHOUT telephony
// or any API keys (uses the mock connector). Verifies the two properties that
// matter most: a booking only happens after a confirmed draft, and confirming
// twice is idempotent (never double-books). Exits non-zero on any failure.

import { store } from "./store";
import { checkAvailability, holdSlot, confirmBooking } from "./orchestrator";

let failures = 0;
function check(label: string, cond: boolean): void {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);
  if (!cond) failures++;
}

function tomorrow(): string {
  const d = new Date(Date.now() + 86400000);
  return d.toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  console.log("— Fina Calle voice gateway: booking simulation (mock connector) —\n");
  const call = store.createCall("+15555550123");
  const date = tomorrow();
  const service = "Full Groom";

  console.log(`Caller: "I'd like a ${service} appointment."`);
  const avail = await checkAvailability(call.callId, date, service);
  console.log(`Agent (tool check_availability): ${avail.text}\n`);
  check("availability returned slots", avail.slots.length > 0);
  const slot = avail.slots[0];
  if (!slot) { console.error("no slot to book"); process.exit(1); }

  console.log(`Caller: "The first one works. Name's Maria, 555-0123."`);
  const held = await holdSlot(call.callId, slot.startIso, service, { name: "Maria", phone: "+15555550123" });
  console.log(`Agent (tool hold_slot): ${held.text}\n`);
  check("draft created in 'open' state (not booked yet)", held.draft.status === "open" && store.bookingCount() === 0);

  console.log(`Agent: "So that's a Full Groom for Maria — shall I book it?"  Caller: "Yes!"`);
  const first = await confirmBooking(held.draft.draftId);
  console.log(`Agent (tool confirm_booking): ${first.text}\n`);
  check("commit returned a booking ref", first.bookingRef.length > 0);
  check("first commit was a real booking (not idempotent replay)", first.idempotent === false);
  check("exactly one booking recorded", store.bookingCount() === 1);

  console.log(`-- simulate a duplicate/retried confirm (network blip, double tap) --`);
  const second = await confirmBooking(held.draft.draftId);
  console.log(`Agent (tool confirm_booking again): ${second.text}\n`);
  check("retry returned the SAME booking ref", second.bookingRef === first.bookingRef);
  check("retry was idempotent (no new booking)", second.idempotent === true);
  check("STILL exactly one booking (no double-book)", store.bookingCount() === 1);

  check("audit trail recorded the decisions", store.auditCount() >= 3);

  console.log(`\n${failures === 0 ? "✅ ALL CHECKS PASSED" : `❌ ${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
