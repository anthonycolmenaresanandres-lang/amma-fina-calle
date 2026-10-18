// Diagnostic reproduction against existing SQL, synthetic data, in-memory only.
// Passing means the documented baseline behavior was reproduced, NOT that it is secure.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
let checks = 0;
const check = (actual, expected, label) => { assert.deepEqual(actual, expected, label); checks++; console.log(`REPRODUCED ${label}`); };
try {
  await db.exec(`create role anon; create role authenticated;
    create schema auth;
    create function auth.jwt() returns jsonb language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
    grant usage on schema public, auth to anon, authenticated;`);
  for (const name of ["0001_owner_portal_foundation", "0002_change_requests_intake", "0003_customer_registry_reads", "0004_admin_gating"]) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${name}.sql`, import.meta.url), "utf8"));
  }
  await db.exec(`insert into public.restaurants(id,business_name,notes) values
    ('test-a','Synthetic A','Private A'), ('test-b','Synthetic B','Private B');
    insert into public.owner_emails(restaurant_id,email) values ('test-a','owner-a@example.test');
    grant select on public.menu_items, public.change_requests, public.audit_log to authenticated;
    set role anon;`);
  check((await db.query("select * from public.get_customer_registry()")).rows.length, 0, "anonymous registry read returns no rows after 0004");
  check((await db.query("select * from public.get_customer('test-a')")).rows.length, 0, "anonymous detail read returns no rows");
  check((await db.query("select has_function_privilege('anon','public.get_customer_registry()','execute') allowed")).rows[0].allowed, true, "PUBLIC default execute survives anon-only revoke (body still gates data)");
  check((await db.query("select public.is_email_allowed('test-a','owner-a@example.test') allowed")).rows[0].allowed, true, "boolean probe discloses guessed allowlist membership");
  await db.query("select public.submit_change_request($1,$2,$3,$4,$5,$6,$7,$8,$9)", ["Synthetic B", "Claimed owner", "claimed@example.test", "Menu/content update", "Normal", "Untrusted request", "/owner/test-b", "AMMA-SYNTHETIC", "test-b"]);
  await db.exec("reset role;");
  check((await db.query("select restaurant_id from public.change_requests where reference_id='AMMA-SYNTHETIC'")).rows[0].restaurant_id, "test-b", "anonymous RPC accepts caller-claimed tenant and contact");
  await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify({ email: "owner-a@example.test" })]);
  await db.exec("set role authenticated;");
  await assert.rejects(db.query("select public.apply_owner_change('test-b','menu_items','00000000-0000-4000-8000-000000000099','name','Spoof')")); checks++;
  console.log("REPRODUCED write rail rejects other tenant");
  await db.query("select public.apply_owner_change('test-a','menu_items','00000000-0000-4000-8000-000000000099','name','Missing item')");
  check((await db.query("select count(*)::int n from public.audit_log")).rows[0].n, 1, "scalar rail appends audit even when target row does not exist");
  const menu = (await db.query("select public.get_public_menu('test-a') menu")).rows[0].menu;
  check(Object.hasOwn(menu.restaurant, "notes"), false, "public menu excludes private restaurant notes");
  console.log(`${checks} baseline SQL diagnostic checks passed. In-memory only; no production queries or schema changes.`);
} finally { await db.close(); }
