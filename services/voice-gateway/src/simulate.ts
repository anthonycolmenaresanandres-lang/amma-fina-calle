// Simulator — exercises the draft-first booking loop end to end WITHOUT telephony or
// any API keys. Verifies the properties that matter most: a booking only happens after
// a confirmed draft; confirming twice is idempotent (never double-books); the bot never
// offers a closed day; callers are never lost; and — multi-tenant — calls route to the
// right business and each tenant's data stays isolated. Exits non-zero on any failure.

import http from "node:http";
import os from "node:os";
import path from "node:path";
import { writeFileSync } from "node:fs";

let failures = 0;
function check(label: string, cond: boolean): void {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);
  if (!cond) failures++;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function main(): Promise<void> {
  // ---- Seed a two-tenant registry BEFORE anything touches the tenant module ----
  const tenantsFile = path.join(os.tmpdir(), `tenants-${Date.now()}.json`);
  writeFileSync(tenantsFile, JSON.stringify([
    {
      id: "groomer", phoneNumbers: ["+1 555 000 1111"], connector: "mock",
      business: { name: "Happy Paws", kind: "pet grooming", timezone: "America/New_York",
        services: [{ name: "Full Groom", durationMin: 90 }, { name: "Bath & Brush", durationMin: 45 }],
        hours: "Tue-Sat 9am-6pm", openDays: [2, 3, 4, 5, 6], openHour: 9, closeHour: 18 },
    },
    {
      id: "salon", phoneNumbers: ["+1 555 000 2222"], connector: "proposeconfirm",
      business: { name: "Glow Salon", kind: "hair salon", timezone: "America/New_York",
        services: [{ name: "Haircut", durationMin: 45 }, { name: "Color", durationMin: 120 }],
        hours: "Mon-Fri 10am-7pm", openDays: [1, 2, 3, 4, 5], openHour: 10, closeHour: 19 },
    },
  ]));
  process.env.TENANTS_FILE = tenantsFile;

  // Import AFTER the env is set so the lazy registry loads our file.
  const { store } = await import("./store");
  const { checkAvailability, holdSlot, confirmBooking, takeMessage, summarizeCall, finalizeCall } = await import("./orchestrator");
  const { ProposeConfirmConnector } = await import("./adapter/proposeConfirm");
  const { WebhookConnector } = await import("./adapter/webhook");
  const { getTenantByNumber } = await import("./tenant");
  const { isOpenOn } = await import("./hours");
  type Biz = Parameters<typeof isOpenOn>[0];

  // Deterministic regardless of what day the suite runs: next open / next closed date.
  function nextDate(business: Biz, open: boolean): string {
    const d = new Date();
    for (let i = 1; i <= 14; i++) {
      d.setDate(d.getDate() + 1);
      if (isOpenOn(business, ymd(d)) === open) return ymd(d);
    }
    return ymd(d);
  }

  const tenant = getTenantByNumber("+1 555 000 1111"); // Happy Paws (mock connector)
  console.log(`— ${tenant.business.name} voice gateway: booking simulation —\n`);

  const call = store.createCall("+15555550123", tenant.id);
  const date = nextDate(tenant.business, true);
  const service = "Full Groom";

  console.log(`Caller: "I'd like a ${service} appointment."`);
  const avail = await checkAvailability(tenant, call.callId, date, service);
  console.log(`Agent (tool check_availability): ${avail.text}\n`);
  check("availability returned slots", avail.slots.length > 0);
  const slot = avail.slots[0];
  if (!slot) { console.error("no slot to book"); process.exit(1); }

  console.log(`Caller: "The first one works. Name's Maria, 555-0123."`);
  const held = await holdSlot(tenant, call.callId, slot.startIso, service, { name: "Maria", phone: "+15555550123" });
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
  const pc = new ProposeConfirmConnector(tenant.business);
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
  const wh = new WebhookConnector({ availabilityUrl: `http://127.0.0.1:${port}/availability`, bookUrl: `http://127.0.0.1:${port}/book` }, tenant.business);
  const whSlots = await wh.checkAvailability({ date, service });
  check("webhook connector fetched availability from the endpoint", whSlots.length === 1);
  const whBook = await wh.book({ slot: whSlots[0]!, service, customer: cust, idempotencyKey: "wh-1" });
  check("webhook connector booked via the endpoint", whBook.bookingRef === "WH-555");
  await new Promise<void>((r) => server.close(() => r()));

  // ---- Scenario 4: take a message (never lose the caller when we can't book) ----
  console.log(`\n— Scenario 4: take_message (after-hours / no fit / off-menu) —`);
  const msgBefore = store.messageCount();
  const call2 = store.createCall("+15555550777", tenant.id);
  console.log(`Caller: "Do you board dogs overnight?"  Agent: "We don't, but I'll take a message."`);
  const msg = await takeMessage(tenant, call2.callId, { name: "Sam", phone: "+15555550777" }, "asked about overnight boarding");
  console.log(`Agent (tool take_message): ${msg.text}\n`);
  check("a message was captured", store.messageCount() === msgBefore + 1 && msg.messageId.length > 0);
  const statsAfter = store.stats();
  check("stats counts the captured message", statsAfter.messages === store.messageCount());
  check("a booking-or-message call counts as handled", statsAfter.handledPct > 0);

  // ---- Scenario 5: business-hours awareness (don't offer slots when closed) ----
  console.log(`\n— Scenario 5: closed-day awareness (open days = ${JSON.stringify(tenant.business.openDays)}) —`);
  const closed = nextDate(tenant.business, false);
  const call3 = store.createCall("+15555550111", tenant.id);
  console.log(`Caller (on a CLOSED day ${closed}): "Anything open?"`);
  const closedAvail = await checkAvailability(tenant, call3.callId, closed, service);
  console.log(`Agent (tool check_availability): ${closedAvail.text}\n`);
  check("no slots offered on a closed day", closedAvail.slots.length === 0);
  check("open days still produce slots (sanity)", (await checkAvailability(tenant, call.callId, nextDate(tenant.business, true), service)).slots.length > 0);

  // ---- Scenario 6: end-of-call summary + missed-call alert ----
  console.log(`\n— Scenario 6: end-of-call summary + missed-call alert —`);
  check("a booking call summarizes as 'booked'", summarizeCall(call.callId).outcome === "booked");
  check("a message call summarizes as 'message'", summarizeCall(call2.callId).outcome === "message");
  const missedBefore = store.stats().missedCalls;
  const lonely = store.createCall("+15555550222", tenant.id);
  console.log(`Caller hangs up without booking or leaving a message…`);
  await finalizeCall(lonely.callId);
  check("a no-activity call summarizes as 'missed'", summarizeCall(lonely.callId).outcome === "missed");
  check("missed call reflected in stats", store.stats().missedCalls === missedBefore + 1);
  await finalizeCall(lonely.callId); // stop + close both fire in real life
  check("finalize is idempotent (no duplicate missed count)", store.stats().missedCalls === missedBefore + 1);

  // ---- Scenario 7: multi-tenant routing + isolation ----
  console.log(`\n— Scenario 7: multi-tenant routing (one gateway, many businesses) —`);
  const salon = getTenantByNumber("+1 555 000 2222");
  check("dialled number routes to the right tenant", salon.id === "salon" && salon.business.name === "Glow Salon");
  check("unknown number falls back to a tenant (no crash)", getTenantByNumber("+19998887777").id.length > 0);
  check("each tenant carries its own services", salon.business.services.some((s) => s.name === "Haircut"));

  const sCall = store.createCall("+15550002222", salon.id);
  const sDate = nextDate(salon.business, true);
  const sAvail = await checkAvailability(salon, sCall.callId, sDate, "Haircut");
  check("salon offers slots within ITS own hours", sAvail.slots.length > 0);
  const sHeld = await holdSlot(salon, sCall.callId, sAvail.slots[0]!.startIso, "Haircut", { name: "Pat", phone: "+15550002222" });
  const sConfirm = await confirmBooking(sHeld.draft.draftId);
  console.log(`Salon (propose-confirm): ${sConfirm.text}`);
  check("salon's connector commits as PENDING (propose-confirm)", store.getDraft(sHeld.draft.draftId)?.pendingConfirm === true && sConfirm.bookingRef.length > 0);

  const gStats = store.stats("groomer");
  const sStats = store.stats("salon");
  console.log(`\nPer-tenant stats — groomer: ${JSON.stringify(gStats)}\n               salon:   ${JSON.stringify(sStats)}`);
  check("groomer stats show only groomer's data", gStats.calls === 4 && gStats.bookings === 1 && gStats.messages === 1);
  check("salon stats show only salon's data", sStats.calls === 1 && sStats.bookings === 1 && sStats.pendingBookings === 1 && sStats.messages === 0);
  check("global stats aggregate across tenants", store.stats().bookings === 2 && store.stats().calls === 5);

  console.log(`\n${failures === 0 ? "✅ ALL CHECKS PASSED" : `❌ ${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
