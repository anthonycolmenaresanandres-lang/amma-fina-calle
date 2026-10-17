import assert from "node:assert/strict";
import { DEMO_MENU } from "../src/lib/accounts/fixtures";
import { adaptStaticMenu, parseSnapshot, planImport, snapshotDigest, stageReviewedPlan, validateSnapshot } from "../src/lib/accounts/import";
import { canConfirmRequest, canRequestRollback, readRequestProgress, readRequestSummary, requestEventLabel } from "../src/lib/owner/queue/progress";
async function main() {
let checks = 0;
const test = (name: string, run: () => void) => { run(); checks++; console.log(`PASS ${name}`); };
const copy = () => structuredClone(DEMO_MENU);
test("valid bounded menu normalizes to a stable snapshot", () => assert.equal(validateSnapshot(copy(), "example-cafe").items.length, 2));
for (const [name, change] of [
  ["wrong tenant", (s: ReturnType<typeof copy>) => { s.tenant = "another-tenant"; }],
  ["empty menu", (s: ReturnType<typeof copy>) => { s.items = []; }],
  ["duplicate item IDs", (s: ReturnType<typeof copy>) => { s.items[1].sourceId = s.items[0].sourceId; }],
  ["duplicate category IDs", (s: ReturnType<typeof copy>) => { s.categories.push(s.categories[0]); }],
  ["missing category", (s: ReturnType<typeof copy>) => { s.items[0].categoryId = "absent"; }],
  ["duplicate position", (s: ReturnType<typeof copy>) => { s.items[1].order = 0; }],
  ["negative price", (s: ReturnType<typeof copy>) => { s.items[0].priceCents = -1; }],
  ["fractional cents", (s: ReturnType<typeof copy>) => { s.items[0].priceCents = 0.5; }],
  ["negative order", (s: ReturnType<typeof copy>) => { s.items[0].order = -1; }],
  ["fractional order", (s: ReturnType<typeof copy>) => { s.items[0].order = 0.5; }],
  ["blank item ID", (s: ReturnType<typeof copy>) => { s.items[0].sourceId = ""; }],
] as const) test(name, () => { const s = copy(); change(s); assert.throws(() => validateSnapshot(s, "example-cafe")); });
test("unsupported sources are explicit", () => assert.throws(() => validateSnapshot({ ...copy(), source: "square" }, "example-cafe"), /no supported/));
test("extra authority fields rejected", () => assert.throws(() => validateSnapshot({ ...copy(), approved: true }, "example-cafe")));
test("malformed JSON rejected", () => assert.throws(() => parseSnapshot("{", "example-cafe")));
test("oversized input rejected before parsing", () => assert.throws(() => parseSnapshot(" ".repeat(256001), "example-cafe"), /256 KB/));
test("first import adds each variant and never publishes", () => { const p = planImport(copy(), { revision: 0, snapshot: null }); assert.equal(p.changes.length, 2); assert.equal(p.canPublish, false); });
test("same menu produces no item changes", () => assert.equal(planImport(copy(), { revision: 1, snapshot: copy() }).changes.length, 0));
test("rename keeps source identity and requires owner review", () => { const s = copy(); s.items[0].name = "Renamed coffee"; const p = planImport(s, { revision: 1, snapshot: copy() }); assert.equal(p.changes[0].kind, "update"); assert.equal(p.changes[0].sourceId, DEMO_MENU.items[0].sourceId); assert.equal(p.changes[0].review, "owner_review"); });
test("omitted items retained without hiding", () => { const s = copy(); s.items.pop(); const p = planImport(s, { revision: 1, snapshot: copy() }); assert.equal(p.changes[0].kind, "retain"); assert.equal(p.snapshot.items.length, 2); assert.equal(p.snapshot.items[1].available, true); });
test("retained position collision fails closed", () => { const s = copy(); s.items.pop(); s.items[0].order = 1; assert.throws(() => planImport(s, { revision: 1, snapshot: copy() }), /same category position/); });
test("price update requires commercial review", () => { const s = copy(); s.items[0].priceCents = 375; assert.equal(planImport(s, { revision: 1, snapshot: copy() }).changes[0].review, "commercial_review"); });
test("health claim update requires health review", () => { const s = copy(); s.items[0].description = "Allergen safe"; assert.equal(planImport(s, { revision: 1, snapshot: copy() }).changes[0].review, "health_review"); });
test("source switching requires explicit reviewed mapping", () => { const s = copy(); s.source = "bodega-static-v1"; assert.throws(() => planImport(s, { revision: 1, snapshot: copy() }), /Changing sources/); });
test("category rename is visible in preview", () => { const s = copy(); s.categories[0].name = "New category"; assert.deepEqual(planImport(s, { revision: 1, snapshot: copy() }).categoryChanges[0], { sourceId: "coffee", before: "Coffee", after: "New category", retained: false }); });
const first = planImport(copy(), { revision: 0, snapshot: null }); const digest = await snapshotDigest(first.snapshot);
assert.equal((await stageReviewedPlan(first, { revision: 0, snapshot: null }, digest)).revision, 1); checks++;
await assert.rejects(stageReviewedPlan(first, { revision: 1, snapshot: copy() }, digest), /changed after/); checks++;
await assert.rejects(stageReviewedPlan(first, { revision: 0, snapshot: null }, "a".repeat(64)), /changed after approval/); checks++;
const reordered = copy(); reordered.items.reverse(); assert.equal(await snapshotDigest(reordered), digest); checks++;
const sections = [{ id: "coffee", title: "Coffee", items: [{ name: "Sample coffee", prices: [{ label: "12 oz", cents: 350 }, { label: "16 oz", cents: null }] }] }];
const ids = [0,1].map(n => ({ sectionId: "coffee", itemIndex: 0, variantIndex: n, sourceId: `sample-${n}`, expectedName: "Sample coffee", expectedVariant: n ? "16 oz" : "12 oz" }));
test("static adapter preserves explicit variant IDs and unknown prices", () => { const s = adaptStaticMenu("example-cafe", "test-1", sections, ids); assert.equal(s.items[1].priceCents, null); assert.equal(s.items[1].sourceId, "sample-1"); });
test("static adapter refuses missing sidecar", () => assert.throws(() => adaptStaticMenu("example-cafe", "test-1", sections, [])));
test("static adapter refuses renamed/reordered source without review", () => assert.throws(() => adaptStaticMenu("example-cafe", "test-1", [{ ...sections[0], items: [{ ...sections[0].items[0], name: "Changed" }] }], ids)));
test("static adapter refuses unused mappings", () => assert.throws(() => adaptStaticMenu("example-cafe", "test-1", sections, [...ids, ids[0]])));
const request = { id: "00000000-0000-4000-8000-000000000101", restaurant_id: "example-cafe", item_id: "00000000-0000-4000-8000-000000000102", item_name: "Test coffee", status: "awaiting_owner_ack", change_type: "availability", created_at: "2026-10-17T12:00:00Z", reference_id: "AMMA-TEST-A1B2C3D4", before: true, after: false, owner_acknowledged_at: null, events: [{ type: "received", at: "2026-10-17T12:00:00Z" }], delivery: [{ status: "retry_wait", attempt: 1, next_attempt_at: "2026-10-17T12:10:00Z" }] };
test("timeline uses owner-facing state labels", () => assert.equal(requestEventLabel("awaiting_owner_ack"), "Ready for your confirmation"));
test("request target identity is bounded", () => assert.equal(readRequestProgress({ ...request, item_id: "another-item" }, "example-cafe"), null));
test("request parser rejects other tenant", () => assert.equal(readRequestSummary(request, "wrong-tenant"), null));
test("request parser rejects unknown states", () => assert.equal(readRequestSummary({ ...request, status: "paid_and_done" }, "example-cafe"), null));
test("request parser rejects malformed dates", () => assert.equal(readRequestSummary({ ...request, created_at: "bad" }, "example-cafe"), null));
test("request parser rejects provider data or unbounded attempts", () => assert.equal(readRequestProgress({ ...request, delivery: [{ ...request.delivery[0], attempt: 7 }] }, "example-cafe"), null));
test("request parser rejects malformed events", () => assert.equal(readRequestProgress({ ...request, events: [{ type: "<script>", at: request.created_at }] }, "example-cafe"), null));
test("verified request offers confirm and rollback", () => { const r = readRequestProgress(request, "example-cafe")!; assert.ok(r); assert.equal(canConfirmRequest(r), true); assert.equal(canRequestRollback(r), true); });
test("unverified request cannot confirm", () => assert.equal(canConfirmRequest({ ...readRequestProgress(request, "example-cafe")!, status: "awaiting_verification" }), false));
console.log(`${checks} account/import/progress checks passed.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
