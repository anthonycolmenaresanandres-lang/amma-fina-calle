import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { triageRequest, type MenuSnapshot } from "../src/lib/owner/request-desk/triage";
import { ownerPreviewFingerprint, isOwnerPreviewCurrent } from "../src/lib/owner/request-desk/preview";
import { requestReceipt } from "../src/lib/requests/receipt";

async function main() {
// Execute the real server functions with an explicit dependency boundary.
// Unknown imports fail; no network, cookies, live Supabase, or mail are available.
function load(path: string, mocks: Record<string, unknown>) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const testModule = { exports: {} as Record<string, (...args: never[]) => Promise<unknown>> };
  const requireMock = (name: string) => { if (!(name in mocks)) throw new Error(`Unexpected dependency: ${name}`); return mocks[name]; };
  new Function("require", "module", "exports", code)(requireMock, testModule, testModule.exports);
  // Types intentionally stay broad at the test-only transpilation boundary.
  return testModule.exports as Record<string, (...args: unknown[]) => Promise<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
}
const snapshot: MenuSnapshot = {
  restaurantId: "test-a", businessName: "Synthetic A",
  items: [{ id: "one", categoryId: "coffee", name: "Mocha", description: null, price: "7.00", isAvailable: true, sizes: [] }],
  categories: [{ id: "coffee", name: "Coffee" }], hours: [],
};
let queueEnabled = false;
let authorized = true, writes = 0, saves = 0, emailSent = false, saveError = false, mailCalls = 0;
let lastPayload: unknown;
const mocks = {
  "next/cache": { revalidatePath() {} },
  "../menu-control": { LAS_PALMAS_RESTAURANT_ID: "las-palmas-lynnhaven" },
  "@/lib/supabase/server": { createServerSupabase: async () => ({ rpc: async (_name: string, payload: unknown) => { saves++; lastPayload = payload; return { error: saveError ? new Error("unavailable") : null }; } }) },
  "@/lib/owner/auth": { getOwnerContext: async () => ({ state: authorized ? "authorized" : "unauthorized", email: "owner@example.test" }) },
  "@/lib/owner/rail": { applyOwnerChange: async () => { writes++; }, applyOwnerSizePrice: async () => { writes++; } },
  "@/lib/requests/intake": { sendChangeRequestEmail: async () => { mailCalls++; return { sent: emailSent }; } },
  "./files": { OWNER_REQUEST_MAX_FILES: 5, OWNER_REQUEST_MAX_TEXT_LENGTH: 4000 },
  "./menu": { readOwnerMenu: async () => structuredClone(snapshot) },
  "./triage": { triageRequest },
  "./preview": { ownerPreviewFingerprint, isOwnerPreviewCurrent },
  "../queue/client": { ownerQueueEnabledForTenant: () => queueEnabled, submitOwnerReviewToQueue: async () => ({ ok: true, receipt: { id: "synthetic", referenceId: "AMMA-SYNTHETIC-1234ABCD", status: "needs_review" } }) },
};
const actions = load("../src/lib/owner/request-desk/actions.ts", mocks);
const form = (text = "change Mocha to $8", files = "0", fingerprint?: string) => {
  const data = new FormData(); data.set("text", text); data.set("fileCount", files);
  if (fingerprint) data.set("previewFingerprint", fingerprint); return data;
};
let checks = 0;
const check = async (label: string, run: () => Promise<void>) => { await run(); checks++; console.log(`PASS ${label}`); };
await check("unauthorized owner never previews or writes", async () => {
  authorized = false;
  assert.equal((await actions.triageOwnerRequest("test-a", {}, form())).phase, "error");
  assert.equal((await actions.confirmOwnerRequest("test-a", {}, form())).phase, "error");
  assert.equal(writes, 0); authorized = true;
});
let preview = await actions.triageOwnerRequest("test-a", {}, form());
assert.equal(preview.phase, "apply");
await check("missing preview cannot write", async () => {
  assert.equal((await actions.confirmOwnerRequest("test-a", {}, form())).phase, "error"); assert.equal(writes, 0);
});
await check("file-bearing direct confirmation cannot write", async () => {
  assert.equal((await actions.confirmOwnerRequest("test-a", {}, form(undefined, "1", preview.previewFingerprint))).phase, "error"); assert.equal(writes, 0);
});
await check("stale preview cannot write", async () => {
  snapshot.items[0].price = "7.50";
  assert.equal((await actions.confirmOwnerRequest("test-a", {}, form(undefined, "0", preview.previewFingerprint))).phase, "error"); assert.equal(writes, 0);
});
await check("fresh confirmed preview writes once", async () => {
  preview = await actions.triageOwnerRequest("test-a", {}, form());
  assert.equal((await actions.confirmOwnerRequest("test-a", {}, form(undefined, "0", preview.previewFingerprint))).phase, "applied"); assert.equal(writes, 1);
});
await check("saved request reports unconfirmed notification honestly", async () => {
  const result = await actions.sendOwnerReview("test-a", {}, form("Please review a new item"));
  assert.equal(result.phase, "sent"); assert.match(result.message, /saved.*could not be confirmed/i);
  assert.match(result.referenceId, /^AMMA-[A-Z0-9]+-[A-F0-9]{8}$/);
  assert.equal(saves, 1); assert.equal(mailCalls, 1);
  assert.equal((lastPayload as { p_contact_info: string }).p_contact_info, "owner@example.test");
});
await check("failed request save sends no notification", async () => {
  saveError = true;
  assert.equal((await actions.sendOwnerReview("test-a", {}, form("Please review a new item"))).phase, "error"); assert.equal(mailCalls, 1);
  saveError = false;
});
await check("email acceptance reported separately", async () => {
  emailSent = true;
  assert.match((await actions.sendOwnerReview("test-a", {}, form("Please review a new item"))).message, /email accepted/);
});
await check("enabled queue routes a brief to review and blocks direct confirmation", async () => {
  queueEnabled = true; const priorWrites = writes, priorMail = mailCalls;
  assert.equal((await actions.triageOwnerRequest("test-a", {}, form())).phase, "review");
  assert.equal((await actions.confirmOwnerRequest("test-a", {}, form())).phase, "error");
  const queued = await actions.sendOwnerReview("test-a", {}, form());
  assert.equal(queued.phase, "sent"); assert.match(queued.message, /queued.*no menu change/);
  assert.equal(writes, priorWrites); assert.equal(mailCalls, priorMail); queueEnabled = false;
});
const readMenu = load("../src/lib/owner/request-desk/menu.ts", { "server-only": {} }).readOwnerMenu;
await check("partial database read fails closed", async () => {
  const client = { from(name: string) { return { select() { return this; }, eq() { return this; }, order() { return { data: [], error: name === "hours" ? new Error("failed read") : null }; }, maybeSingle() { return { data: { business_name: "Synthetic A" }, error: null }; } }; } };
  await assert.rejects(readMenu(client, "test-a"), /completely/);
});
let persisted = false;
emailSent = false;
const route = load("../src/app/api/customer-requests/route.ts", {
  "next/server": { NextResponse: { json: (body: unknown, options?: { status: number }) => ({ body, status: options?.status ?? 200 }) } },
  "@/lib/requests/receipt": { requestReceipt },
  "@/lib/requests/intake": {
    persistChangeRequest: async () => ({ persisted }), sendChangeRequestEmail: async () => ({ sent: emailSent }),
    storeRequestAttachments: async () => ({ stored: 0 }),
  },
});
const request = () => {
  const data = new FormData();
  for (const [key, value] of Object.entries({ businessName: "Synthetic", contactName: "Owner", contactInfo: "owner@example.test", requestType: "Menu/content update", priority: "Normal", message: "Synthetic test" })) data.set(key, value);
  return new Request("http://localhost/api/customer-requests", { method: "POST", body: data });
};
await check("actual public route returns 503 without receipt evidence", async () => {
  const result = await route.POST(request()); assert.equal(result.status, 503); assert.equal(result.body.ok, false);
});
await check("public route retains email-only fallback", async () => {
  emailSent = true; const result = await route.POST(request()); assert.equal(result.status, 200); assert.equal(result.body.receiptStatus, "email_only");
});
await check("saved request survives notification failure and references are distinct", async () => {
  persisted = true; emailSent = false;
  const first = await route.POST(request()), second = await route.POST(request());
  assert.equal(first.body.receiptStatus, "saved"); assert.equal(first.status, 200); assert.notEqual(first.body.referenceId, second.body.referenceId);
});
let queueOwner = true, queueRpc = 0, queueTenant = "test-a", queueOutcome = "completed";
const queuedActions = load("../src/lib/owner/queue/actions.ts", {
  "@/lib/owner/auth": { getOwnerContext: async () => ({ state: queueOwner ? "authorized" : "unauthorized" }) },
  "@/lib/supabase/server": { createServerSupabase: async () => ({ rpc: async (name: string) => { queueRpc++; return { data: name === "get_owner_request_v1" ? { restaurant_id: queueTenant } : queueOutcome, error: null }; } }) },
  "./client": { ownerQueueEnabledForTenant: () => queueEnabled, QUEUE_UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, submitStructuredQueueRequest: async () => ({ ok: true }) },
});
const qid = "00000000-0000-4000-8000-000000000001";
await check("queued actions default off before any RPC", async () => {
  assert.equal((await queuedActions.queueStructuredOwnerRequest({restaurantId:"test-a"})).ok,false);
  assert.equal((await queuedActions.acknowledgeQueuedOwnerRequest("test-a",qid,"confirm")).ok,false);assert.equal(queueRpc,0);
});
await check("queued actions re-authorize owners", async () => {
  queueEnabled=true;queueOwner=false;assert.equal((await queuedActions.queueStructuredOwnerRequest({restaurantId:"test-a"})).ok,false);
  assert.equal((await queuedActions.acknowledgeQueuedOwnerRequest("test-a",qid,"confirm")).ok,false);assert.equal(queueRpc,0);queueOwner=true;
});
await check("owner completion action scopes request to selected tenant", async () => {
  queueTenant="test-b";assert.equal((await queuedActions.acknowledgeQueuedOwnerRequest("test-a",qid,"confirm")).ok,false);assert.equal(queueRpc,1);queueTenant="test-a";
});
await check("owner completion action reports conflict as failure", async () => {
  queueOutcome="completion_conflict";assert.equal((await queuedActions.acknowledgeQueuedOwnerRequest("test-a",qid,"confirm")).ok,false);
});
await check("owner completion action requires exact confirmed state", async () => {
  queueOutcome="awaiting_verification";assert.equal((await queuedActions.acknowledgeQueuedOwnerRequest("test-a",qid,"confirm")).ok,false);
  queueOutcome="completed";assert.equal((await queuedActions.acknowledgeQueuedOwnerRequest("test-a",qid,"confirm")).ok,true);queueEnabled=false;
});
console.log(`${checks} actual server action/route checks passed with mocked external services.`);

}
main().catch(error => { console.error(error); process.exitCode = 1; });
