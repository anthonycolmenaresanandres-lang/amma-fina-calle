// Simulator — exercises the draft-first booking loop end to end WITHOUT telephony
// or any API keys (uses the mock connector). Verifies the two properties that
// matter most: a booking only happens after a confirmed draft, and confirming
// twice is idempotent (never double-books). Exits non-zero on any failure.

import http from "node:http";
import { store } from "./store";
import { checkAvailability, holdSlot, confirmBooking } from "./orchestrator";
import { ProposeConfirmConnector } from "./adapter/proposeConfirm";
import { WebhookConnector } from "./adapter/webhook";

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

  // ---- Analytics rollup (powers /stats and `npm run report`) ----
  const stats = store.stats();
  console.log(`\nStats rollup: ${JSON.stringify(stats)}`);
  check("stats counts the call", stats.calls >= 1);
  check("stats counts the booking", stats.bookings === 1);
  check("stats reports a call→booking conversion", stats.conversionPct === 100);

  // ---- Scenario 2: propose-and-confirm (universal fallback — sell to any system) ----
  console.log(`\n— Scenario 2: propose-and-confirm connector (no POS integration) —`);
  const pc = new ProposeConfirmConnector();
  const slots2 = await pc.checkAvailability({ date, service });
  check("propose-and-confirm offers slots from open hours", slots2.length > 0);
  const s2 = slots2[0];
  if (!s2) { console.error("no slot"); process.exit(1); }
  const cust = { name: "Rex Owner", phone: "+15555559999" };
  const b1 = await pc.book({ slot: s2, service, customer: cust, idempotencyKey: "draft-xyz" });
  console.log(`book -> ${b1.bookingRef} (pending=${b1.pending})`);
  check("booking is PENDING (awaiting human confirm)", b1.pending === true && b1.bookingRef.startsWith("PENDING-"));
  const b2 = await pc.book({ slot: s2, service, customer: cust, idempotencyKey: "draft-xyz" });
  check("propose-and-confirm is idempotent (same ref)", b2.bookingRef === b1.bookingRef);

  // ---- Scenario 3: webhook/Zapier bridge connector (round-trip vs a local stub) ----
  console.log(`\n— Scenario 3: webhook bridge connector (stub Zapier endpoint) —`);
  const server = http.createServer((req, res) => {
    let body = ""; req.on("data", (c) => (body += c));
    req.on("end", () => {
      const data = body ? JSON.parse(body) : {};
      res.setHeader("Content-Type", "application/json");
      if (req.url === "/availability") {
        res.end(JSON.stringify({ slots: [{ startIso: `${date}T10:00:00.000Z`, endIso: `${date}T11:00:00.000Z` }] }));
      } else if (req.url === "/book") {
        res.end(JSON.stringify({ bookingRef: "WH-555", startIso: data.slot?.startIso, pending: false }));
      } else { res.statusCode = 404; res.end("{}"); }
    });
  });
  await new Promise<void>((r) => server.listen(0, r));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  const wh = new WebhookConnector({ availabilityUrl: `http://127.0.0.1:${port}/availability`, bookUrl: `http://127.0.0.1:${port}/book` });
  const whSlots = await wh.checkAvailability({ date, service });
  check("webhook connector fetched availability from the endpoint", whSlots.length === 1);
  const whBook = await wh.book({ slot: whSlots[0]!, service, customer: cust, idempotencyKey: "wh-1" });
  check("webhook connector booked via the endpoint", whBook.bookingRef === "WH-555");
  await new Promise<void>((r) => server.close(() => r()));

  console.log(`\n${failures === 0 ? "✅ ALL CHECKS PASSED" : `❌ ${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
