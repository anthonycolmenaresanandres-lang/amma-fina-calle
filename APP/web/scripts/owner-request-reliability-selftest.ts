import assert from "node:assert/strict";
import { ownerPreviewFingerprint, isOwnerPreviewCurrent } from "../src/lib/owner/request-desk/preview";
import { triageRequest, type MenuSnapshot, type ChangeProposal } from "../src/lib/owner/request-desk/triage";
import { requestReceipt } from "../src/lib/requests/receipt";

let checks = 0;
function check(label: string, test: () => void) { test(); checks++; console.log(`PASS ${label}`); }
const snapshot: MenuSnapshot = {
  restaurantId: "test-kitchen", businessName: "Test Kitchen",
  items: [{ id: "item-a", categoryId: "coffee", name: "Mocha", description: "Chocolate and espresso", price: "7.00", isAvailable: true, sizes: [] }],
  categories: [{ id: "coffee", name: "Coffee" }], hours: [],
};
const text = "change Mocha to $8";
function proposal(snap = snapshot): ChangeProposal {
  const result = triageRequest(text, snap);
  assert.equal(result.decision, "apply");
  if (result.decision !== "apply") throw new Error("Expected fixture proposal");
  return result.proposal;
}
const fingerprint = ownerPreviewFingerprint("owner@example.test", text, snapshot, proposal());
check("unchanged target matches", () => assert.equal(isOwnerPreviewCurrent(fingerprint, ownerPreviewFingerprint("owner@example.test", text, snapshot, proposal())), true));
check("case-normalized email", () => assert.equal(ownerPreviewFingerprint("OWNER@example.test", text, snapshot, proposal()), fingerprint));
for (const missing of [undefined, null, "", "0".repeat(64), {}, new FormData()]) {
  check("missing or malformed preview rejected", () => assert.equal(isOwnerPreviewCurrent(missing, fingerprint), false));
}
for (const [label, modify] of [
  ["price changed", (s: MenuSnapshot) => { s.items[0].price = "7.50"; }],
  ["availability changed", (s: MenuSnapshot) => { s.items[0].isAvailable = false; }],
  ["description changed", (s: MenuSnapshot) => { s.items[0].description = "A new recipe"; }],
  ["raw precision changed", (s: MenuSnapshot) => { s.items[0].price = "7.001"; }],
  ["tenant changed", (s: MenuSnapshot) => { s.restaurantId = "other-kitchen"; }],
] as const) {
  check(label, () => {
    const changed = structuredClone(snapshot); modify(changed);
    assert.equal(isOwnerPreviewCurrent(fingerprint, ownerPreviewFingerprint("owner@example.test", text, changed, proposal(changed))), false);
  });
}
check("actor changed", () => assert.notEqual(ownerPreviewFingerprint("another@example.test", text, snapshot, proposal()), fingerprint));
check("text changed", () => assert.notEqual(ownerPreviewFingerprint("owner@example.test", "change Mocha to $9", snapshot, proposal()), fingerprint));
check("target changed", () => {
  const changed = structuredClone(snapshot); changed.items[0].id = "item-b";
  assert.notEqual(ownerPreviewFingerprint("owner@example.test", text, changed, proposal(changed)), fingerprint);
});
check("removed target rejected", () => assert.throws(() => ownerPreviewFingerprint("owner@example.test", text, { ...snapshot, items: [] }, proposal())));
check("unrelated item edit preserves preview", () => {
  const changed = structuredClone(snapshot); changed.items.push({ ...snapshot.items[0], id: "other", name: "Tea" });
  assert.equal(ownerPreviewFingerprint("owner@example.test", text, changed, proposal(changed)), fingerprint);
});
for (const brief of [
  "rename Mocha to Gluten-free Mocha", "set Mocha description to safe for allergies",
  "rename Mocha to Nut free Mocha", "set Mocha description to cures diabetes",
  "set Mocha description to vegan chocolate", "rename Mocha to sin gluten",
  "set Mocha description to dairy-free", "set Mocha description to allergen friendly",
]) check(`health claim requires review: ${brief}`, () => assert.equal(triageRequest(brief, snapshot).decision, "review"));
check("ordinary exact edit still previewed", () => assert.equal(triageRequest("rename Mocha to House Mocha", snapshot).decision, "apply"));
check("no evidence is failure", () => {
  const receipt = requestReceipt(false, false);
  assert.equal(receipt.ok, false); assert.equal(receipt.receiptStatus, "unconfirmed");
  assert.equal(receipt.reason, "delivery_unconfirmed"); assert.ok(receipt.detail);
});
check("durable row is saved even when email fails", () => assert.deepEqual(requestReceipt(true, false), { ok: true, receiptStatus: "saved" }));
check("email fallback remains distinct from saved", () => assert.deepEqual(requestReceipt(false, true), { ok: true, receiptStatus: "email_only" }));
check("saved plus email stays saved", () => assert.deepEqual(requestReceipt(true, true), { ok: true, receiptStatus: "saved" }));
console.log(`${checks} owner request reliability checks passed. No network, database or messages.`);
