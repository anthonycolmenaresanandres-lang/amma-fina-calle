// Offline rollup from STORE_SNAPSHOT. Optional positional tenant ID scopes the report.
import { store } from "./store";

const tenantId = process.argv[2];
const s = store.stats(tenantId);
const rate = (pct: number) => s.endedCalls ? pct + "%" : "n/a (no completed calls)";
const lines = [
  "Voice gateway report - " + (tenantId ? "tenant: " + tenantId : "all tenants"),
  "calls recorded        " + s.calls + " (active: " + s.activeCalls + ")",
  "completed calls       " + s.endedCalls,
  "confirmed-booking calls " + s.confirmedBookingCalls,
  "pending-request calls " + s.pendingBookingCalls,
  "message-only calls    " + s.messageCalls,
  "response-only calls   " + s.answeredCalls + " (audio sent; resolution unverified)",
  "no recorded handling  " + s.missedCalls,
  "unknown legacy calls  " + s.unknownCalls,
  "with recorded handling " + s.handledCalls + " / " + s.endedCalls + " = " + rate(s.handledPct),
  "confirmed-booking rate " + s.confirmedBookingCalls + " / " + s.endedCalls + " = " + rate(s.conversionPct),
  "draft records         " + s.drafts,
  "booking records       " + s.bookings + " (confirmed: " + s.confirmedBookings + ", pending: " + s.pendingBookings + ")",
  "message records       " + s.messages,
  "notification records  " + s.notificationRecords + " (accepted: " + s.notificationsAccepted +
    ", failed: " + s.notificationsFailed + ", unconfigured: " + s.notificationsNotConfigured +
    ", pending/unconfirmed: " + s.notificationsPending + ")",
  "sync errors           " + s.syncErrors,
  "audit events in scope " + s.audits,
  "Rates use completed calls, including unknown history; they measure recorded outcomes, not customer satisfaction or human follow-up.",
  "Webhook acceptance does not prove human receipt. No conversational per-call report is sent.",
];
console.log(lines.join("\n"));
if (!process.env.STORE_SNAPSHOT) {
  console.log("\nNo STORE_SNAPSHOT set: empty in-memory store. Supply a snapshot to report a real run.");
}
