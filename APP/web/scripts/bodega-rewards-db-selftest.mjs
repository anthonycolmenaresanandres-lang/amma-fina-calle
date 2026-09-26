import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Isolated, in-memory Postgres. No Supabase URL, credentials or remote data.
const db = new PGlite();
const h = (n) => n.toString(16).padStart(64, "0");
const rpc = async (sql, args = []) => (await db.query(sql, args)).rows[0].result;
try {
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema auth;");
  await db.exec("create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid', true), '')::uuid $$; create function auth.jwt() returns jsonb language sql as $$ select coalesce(nullif(current_setting('test.jwt', true), ''), '{}')::jsonb $$;");
  await db.exec("create function public.is_owner_email(text) returns boolean language sql as $$ select coalesce(current_setting('test.restaurant', true), '') = $1 $$; grant usage on schema auth to authenticated; grant execute on all functions in schema auth to authenticated;");
  await db.exec(await readFile(new URL("../supabase/migrations/0015_bodega_muffin_rewards.sql", import.meta.url), "utf8"));
  await db.exec(await readFile(new URL("../supabase/migrations/0016_bodega_one_minute_campaign.sql", import.meta.url), "utf8"));
  const start = (guest, secret) => rpc("select public.bodega_start_round($1,$2,123) result", [h(guest), h(secret)]);
  const finish = (secret, token, score) => rpc("select public.bodega_finish_round($1,$2,$3) result", [h(secret), h(token), score]);
  assert.equal((await start(1, 101)).status, "closed");
  await db.exec("update public.bodega_reward_campaigns set active = true, daily_limit = 2;");
  // Leave time for the new one-minute challenge before a New York day closes.
  const nearMidnight = (await db.query("select ((date_trunc('day', now() at time zone 'America/New_York') + interval '1 day') at time zone 'America/New_York') - now() < interval '2 minutes' as closing")).rows[0].closing;
  if (nearMidnight) throw new Error("Run this clock-dependent integration test outside the last two minutes of the New York day.");
  assert.equal((await start(1, 101)).status, "started");
  assert.equal((await start(1, 102)).status, "wait");
  assert.equal((await finish(101, 201, 520)).status, "invalid", "Cannot finish early");
  assert.equal((await start(2, 102)).status, "started");
  assert.equal((await start(3, 103)).status, "full", "Reserve capacity before allowing play");
  await db.exec("update public.bodega_reward_sessions set created_at = now() - interval '51 seconds';");
  assert.equal((await finish(102, 202, 0)).status, "lost");
  assert.equal((await start(3, 103)).status, "started", "A loss releases its reservation");
  assert.equal((await finish(101, 201, 520)).status, "valid");
  assert.equal((await finish(101, 201, 999)).status, "valid", "Retry recovers the same claim");
  assert.equal((await start(1, 104)).status, "already_earned");
  assert.equal((await db.query("select count(*)::int n from public.bodega_reward_claims")).rows[0].n, 1);
  await db.exec("set role anon;");
  await assert.rejects(db.query("select * from public.bodega_reward_claims"));
  await assert.rejects(db.query("select public.bodega_start_round($1,$2,1)", [h(5), h(105)]));
  await assert.rejects(db.query("select public.bodega_finish_round($1,$2,350)", [h(103), h(203)]));
  await assert.rejects(db.query("select public.bodega_redeem_muffin($1,true)", [h(201)]));
  await db.exec("reset role; set role authenticated;");
  await assert.rejects(db.query("select * from public.bodega_reward_claims"));
  await assert.rejects(db.query("select public.bodega_redeem_muffin($1,true)", [h(201)]));
  await db.exec("select set_config('test.uid','11111111-1111-4111-8111-111111111111',false); select set_config('test.restaurant','other-cafe',false);");
  await assert.rejects(db.query("select public.bodega_redeem_muffin($1,true)", [h(201)]), "Other tenants cannot redeem");
  await db.exec("select set_config('test.restaurant','bodega',false); select set_config('test.jwt','{\"app_metadata\":{\"owner_password_reset_required\":true}}',false);");
  await assert.rejects(db.query("select public.bodega_redeem_muffin($1,true)", [h(201)]), "Password reset gate is enforced in SQL too");
  await db.exec("select set_config('test.jwt','{}',false);");
  assert.equal((await rpc("select public.bodega_redeem_muffin($1,false) result", [h(201)])).status, "valid");
  const results = await Promise.all([rpc("select public.bodega_redeem_muffin($1,true) result", [h(201)]), rpc("select public.bodega_redeem_muffin($1,true) result", [h(201)])]);
  assert.deepEqual(results.map((row) => row.status).sort(), ["already_redeemed", "redeemed"]);
  await db.exec("reset role;");
  assert.equal((await finish(101, 201, 520)).status, "redeemed");
  await db.exec("update public.bodega_reward_campaigns set active = false; update public.bodega_reward_sessions set created_at = now() - interval '51 seconds' where secret_hash = '" + h(103) + "';");
  assert.equal((await finish(103, 203, 520)).status, "valid", "An already-reserved win is honored even after entry is paused");
  await db.exec("update public.bodega_reward_claims set expires_at = now() - interval '1 second' where token_hash = '" + h(203) + "'; set role authenticated;");
  assert.equal((await rpc("select public.bodega_redeem_muffin($1,true) result", [h(203)])).status, "expired");
  assert.equal((await rpc("select public.bodega_redeem_muffin($1,false) result", [h(999)])).status, "invalid");
  await db.exec("reset role;");
  for (const [input, expected] of [
    ["2026-09-25T18:00:00Z", "2026-09-26T04:00:00.000Z"],
    ["2026-03-08T06:00:00Z", "2026-03-09T04:00:00.000Z"],
    ["2026-11-01T05:00:00Z", "2026-11-02T05:00:00.000Z"],
  ]) {
    const row = (await db.query("select ((date_trunc('day', $1::timestamptz at time zone 'America/New_York') + interval '1 day') at time zone 'America/New_York') as expiry", [input])).rows[0];
    assert.equal(new Date(row.expiry).toISOString(), expected);
  }
  console.log("PASS: migration, disabled default, capacity reservations, cooldown, early finish, lost/won/retry, per-browser limit, anonymous/other-tenant/reset rejection, one-use redemption, expiry, pause honors reservations, and DST day boundaries.");
  console.log("NOTE: PGlite serializes one connection. Competing calls are tested; multi-connection contention requires a staging Postgres check before activation.");
} finally { await db.close(); }
