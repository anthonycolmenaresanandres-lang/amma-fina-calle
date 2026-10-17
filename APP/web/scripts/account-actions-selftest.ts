import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { parseSnapshot } from "../src/lib/accounts/import";
import { DEMO_MENU } from "../src/lib/accounts/fixtures";
import { QUEUE_UUID } from "../src/lib/owner/queue/client";
async function main() {
  let manager = true, signedIn = true, calls = 0, authCalls = 0, error = false, unexpected = false;
  const id = "00000000-0000-4000-8000-000000000101";
  const history: { name: string; args: Record<string, unknown> }[] = [];
  const client = { auth: { getUser: async () => { authCalls++; return { data: { user: signedIn ? { id } : null } }; } }, rpc: async (name: string, args: Record<string, unknown>) => {
    calls++; history.push({ name, args });
    if (error) return { error: { message: "PRIVATE DATABASE DETAIL" }, data: null };
    return { error: null, data: unexpected ? "unrecognized" : name === "get_account_candidate_v1" ? { tenant: "example-cafe" } : name === "create_account_candidate_v1" || name === "prepare_account_menu_v1" ? { id, digest: "a".repeat(64) } : name === "accept_account_candidate_v1" ? "owner_accepted_private_staging_only" : name === "approve_account_menu_v1" ? "approved_for_private_staging" : "staged_pending_release" };
  } };
  const mocks: Record<string, unknown> = { "@/lib/supabase/server": { createServerSupabase: async () => client }, "@/lib/admin/auth": { getAdminContext: async () => ({ state: "authorized", canManageTeam: manager }) }, "@/lib/owner/queue/client": { QUEUE_UUID }, "./import": { parseSnapshot, TENANT_ID: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ } };
  const code = ts.transpileModule(readFileSync(new URL("../src/lib/accounts/actions.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const testModule = { exports: {} };
  new Function("require", "module", "exports", code)((name: string) => { if (!(name in mocks)) throw new Error(`Unexpected import ${name}`); return mocks[name]; }, testModule, testModule.exports);
  const actions = testModule.exports as Record<string, (...args: unknown[]) => Promise<{ ok: boolean; message: string }>>;
  const input = { key: id, tenant: "example-cafe", businessName: "Synthetic Café", location: "100 Example Lane", ownerEmail: "owner@example.test", source: "manual-json-v1" };
  let checks = 0; const check = (label: string, run: () => void) => { run(); checks++; console.log(`PASS ${label}`); };
  const original = process.env.ACCOUNT_STAGING_ENABLED;
  try {
    delete process.env.ACCOUNT_STAGING_ENABLED;
    for (const [name, args] of [["createAccountCandidate", [input]], ["prepareAccountMenu", [id,id,0,JSON.stringify(DEMO_MENU)]], ["acceptAccountCandidate", [id,true]], ["approveAccountMenu", [id,"a".repeat(64),true]], ["stageAccountMenu", [id,"a".repeat(64)]]] as const) { const result = await actions[name](...args); check(`${name} disabled without RPC or Auth access`, () => { assert.equal(result.ok,false); assert.equal(calls,0); assert.equal(authCalls,0); }); }
    process.env.ACCOUNT_STAGING_ENABLED = "true";
    check("malformed posted account is rejected without throwing", () => {}); assert.equal((await actions.createAccountCandidate({ key: id, tenant: "example-cafe", businessName: 12 })).ok, false);
    manager = false; assert.equal((await actions.createAccountCandidate(input)).ok, false); check("non-manager cannot create draft", () => assert.equal(calls,0));
    manager = true; signedIn = false; assert.equal((await actions.createAccountCandidate(input)).ok,false); check("missing session cannot create draft", () => assert.equal(calls,0));
    signedIn = true; assert.equal((await actions.createAccountCandidate(input)).ok,true); check("create payload never supplies an actor UID or approval", () => assert.deepEqual(Object.keys(history[0].args).sort(), ["p_key","p_tenant","p_business","p_location","p_owner_email","p_source"].sort()));
    error = true; const failed = await actions.createAccountCandidate(input); check("database errors are redacted", () => { assert.equal(failed.ok,false); assert.doesNotMatch(failed.message,/PRIVATE/); }); error = false;
    unexpected = true; assert.equal((await actions.stageAccountMenu(id,"a".repeat(64))).ok,false); check("unknown transition never claims success", () => {}); unexpected = false;
    const before = calls; assert.equal((await actions.acceptAccountCandidate(id,false)).ok,false); assert.equal((await actions.approveAccountMenu(id,"a".repeat(64),false)).ok,false); check("owner confirmation required by actual actions", () => assert.equal(calls,before));
    assert.equal((await actions.prepareAccountMenu(id,id,0,JSON.stringify({...DEMO_MENU,tenant:"different-tenant"}))).ok,false); check("menu tenant comes from authorized server record", () => assert.equal(history.at(-1)?.name,"get_account_candidate_v1"));
    assert.equal((await actions.prepareAccountMenu(id,id,0,JSON.stringify(DEMO_MENU))).ok,true); check("menu prepared through bounded RPC only", () => assert.equal(history.at(-1)?.name,"prepare_account_menu_v1"));
    manager=false; assert.equal((await actions.stageAccountMenu(id,"a".repeat(64))).ok,false); check("non-manager cannot stage", () => assert.equal(history.at(-1)?.name,"prepare_account_menu_v1"));
    assert.equal((await actions.acceptAccountCandidate(id,true)).ok,true); assert.equal((await actions.approveAccountMenu(id,"a".repeat(64),true)).ok,true); check("owner actions defer association verification to database", () => assert.deepEqual(history.at(-1)?.args,{p_plan:id,p_digest:"a".repeat(64),p_confirmed:true}));
    check("only documented private-staging RPCs called", () => assert.ok(history.every(h => ["get_account_candidate_v1","create_account_candidate_v1","prepare_account_menu_v1","accept_account_candidate_v1","approve_account_menu_v1","stage_account_menu_v1"].includes(h.name))));
  } finally { if (original === undefined) delete process.env.ACCOUNT_STAGING_ENABLED; else process.env.ACCOUNT_STAGING_ENABLED = original; }
  console.log(`${checks} actual account-action boundary checks passed.`);
}
main().catch(error => { console.error(error); process.exitCode=1; });
