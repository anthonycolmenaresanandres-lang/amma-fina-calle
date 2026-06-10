// `npm run report` — prints the call-analytics / ROI rollup from the store snapshot.
// Reads STORE_SNAPSHOT (if set) so it reflects a real run; otherwise reports an empty
// store. This is the offline view of what /stats serves live.

import { store } from "./store";
import { config } from "./config";

const s = store.stats();
const lines = [
  `— ${config.business.name} · voice gateway report —`,
  `connector            ${config.connector}`,
  `calls handled         ${s.calls}  (active: ${s.activeCalls})`,
  `drafts held           ${s.drafts}`,
  `bookings committed    ${s.bookings}  (confirmed: ${s.confirmedBookings}, pending: ${s.pendingBookings})`,
  `messages captured     ${s.messages}`,
  `call→booking rate     ${s.conversionPct}%`,
  `handled (not lost)    ${s.handledPct}%`,
  `sync errors           ${s.syncErrors}`,
  `audit events          ${s.audits}`,
];
console.log(lines.join("\n"));
if (!process.env.STORE_SNAPSHOT) {
  console.log("\n(note: no STORE_SNAPSHOT set — this is an empty in-memory store. Set STORE_SNAPSHOT=path to report a real run.)");
}
