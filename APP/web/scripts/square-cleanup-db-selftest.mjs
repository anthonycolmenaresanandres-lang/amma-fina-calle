import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const scalar = async (sql, params = []) => (await db.query(sql, params)).rows[0].result;
const connection = (restaurant, merchant) => ({ restaurant_id: restaurant, merchant_id: merchant,
  merchant_name: "Test merchant", location_id: "TEST_LOCATION", environment: "sandbox",
  access_token_ciphertext: "test-ciphertext-not-a-token", refresh_token_ciphertext: "test-ciphertext-not-a-token",
  token_expires_at: "2099-01-01T00:00:00Z", scopes: ["ITEMS_READ", "MERCHANT_PROFILE_READ"] });
const replace = (restaurant, merchant) => scalar("select public.square_replace_oauth_connection($1::jsonb) result", [JSON.stringify(connection(restaurant, merchant))]);
const lease = (restaurant) => scalar("select public.square_acquire_sync_lease($1,180) result", [restaurant]);
const objects = (version = 2) => [{ square_id: "TEST_ITEM", object_type: "ITEM", version,
  square_updated_at: "2026-09-26T00:00:00Z", deleted: false, payload: { item_data: { name: "Test Latte" } } }];
const store = (restaurant, token, generation, rows = objects()) => scalar(
  "select public.square_store_catalog_page($1,$2::uuid,$3::uuid,$4::jsonb) result",
  [restaurant, token, generation, JSON.stringify(rows)]);
const count = (restaurant) => scalar("select count(*)::integer result from public.square_catalog_objects where restaurant_id=$1", [restaurant]);
const client = (name) => createHash("sha256").update(name).digest("hex");
const note = (name) => scalar("select public.consume_bodega_guest_note_limits($1) result", [client(name)]);

try {
  await db.exec("create role anon; create role authenticated; create role service_role;");
  for (const file of ["0020_bodega_square_read_model.sql", "0021_bodega_guest_note_rate_limit.sql", "0022_square_lifecycle_and_guest_note_cleanup.sql"]) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
  }
  const oldGeneration = await replace("bodega", "MERCHANT_A");
  const oldLease = await lease("bodega");
  assert.equal(await store("bodega", oldLease, oldGeneration), 1);
  assert.equal(await store("bodega", oldLease, oldGeneration, objects(1)), 0, "Old catalog versions do not win");
  const freshGeneration = await replace("bodega", "MERCHANT_B");
  assert.notEqual(freshGeneration, oldGeneration);
  assert.equal(await count("bodega"), 0, "A fresh authorization starts with an empty snapshot");
  await assert.rejects(store("bodega", oldLease, oldGeneration), /stale Square sync lease/);
  const freshLease = await lease("bodega");
  await assert.rejects(store("bodega", freshLease, oldGeneration), /stale Square sync lease/);
  assert.equal(await store("bodega", freshLease, freshGeneration), 1);
  await replace("second", "MERCHANT_C");
  await assert.rejects(replace("bodega", "MERCHANT_C"), /unique|duplicate/i);
  assert.equal(await count("bodega"), 1, "A failed replacement rolls back catalog cleanup");
  assert.equal(await scalar("select merchant_id result from public.square_connections where restaurant_id='bodega'"), "MERCHANT_B");
  await db.query("delete from public.square_connections where restaurant_id=$1", ["bodega"]);
  assert.equal(await count("bodega"), 0, "Disconnect cascades to the snapshot");
  const reconnected = await replace("bodega", "MERCHANT_D");
  assert.equal(await count("bodega"), 0, "Reconnect does not revive the previous merchant snapshot");
  await assert.rejects(store("bodega", freshLease, freshGeneration), /stale Square sync lease/);
  const reconnectedLease = await lease("bodega");
  assert.equal(await store("bodega", reconnectedLease, reconnected), 1);
  await db.query("update public.square_connections set sync_lease_until=now()-interval '1 minute' where restaurant_id=$1", ["bodega"]);
  await assert.rejects(store("bodega", reconnectedLease, reconnected), /stale Square sync lease/);

  const claims = await Promise.all(Array.from({ length: 8 }, () => note("one-client")));
  assert.equal(claims.filter((result) => result.allowed).length, 5);
  assert.equal(await scalar("select request_count result from public.public_intake_rate_limits where limiter_key='bodega-guest-notes-global'"), 5);
  assert.equal((await note("another-client")).allowed, true, "A noisy client cannot spend everyone else's budget");
  await db.exec("update public.public_intake_rate_limits set request_count=300 where limiter_key='bodega-guest-notes-global'");
  assert.equal((await note("new-client")).allowed, false, "The global safety ceiling still applies");
  assert.equal(await scalar("select count(*)::integer result from public.public_intake_rate_limits where limiter_key=$1", [`bodega-guest-notes-client:${client("new-client")}`]), 0);
  await db.exec("update public.public_intake_rate_limits set window_started_at=now()-interval '11 minutes'");
  assert.equal((await note("one-client")).allowed, true, "Expired windows reopen");
  await db.query("update public.public_intake_rate_limits set updated_at=now()-interval '2 days' where limiter_key=$1", [`bodega-guest-notes-client:${client("another-client")}`]);
  await note("one-client");
  assert.equal(await scalar("select count(*)::integer result from public.public_intake_rate_limits where limiter_key=$1", [`bodega-guest-notes-client:${client("another-client")}`]), 0);
  await assert.rejects(scalar("select public.consume_bodega_guest_note_limits($1) result", ["forged"]), /invalid client key/);
  await db.exec("set role anon");
  await assert.rejects(note("unauthorized"), /permission denied/i);
  await assert.rejects(replace("third", "MERCHANT_E"), /permission denied/i);
  await db.exec("reset role");
  console.log("PASS: real SQL replacement/rollback/cascade, stale connection and expired-lease rejection, version monotonicity, client/global budgets, expiry, retention, and RPC permissions.");
  console.log("NOTE: PGlite serializes one connection; multi-connection contention and Square Sandbox end-to-end tests remain activation checks.");
} finally { await db.close(); }
