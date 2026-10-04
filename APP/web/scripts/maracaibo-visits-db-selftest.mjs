import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const hash = (n) => n.toString(16).padStart(64, "0");
const visit = async (table, action, token = 1, active = false, expected = null) =>
  (await db.query("select public.maracaibo_visit($1,$2,$3,$4,$5) result", [table, action, hash(token), active, expected])).rows[0].result;
let checks = 0;
const check = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };
try {
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
  await db.exec(await readFile(new URL("../supabase/migrations/20261004094018_maracaibo_table_visits.sql", import.meta.url), "utf8"));
  await db.exec("set role service_role;");
  const guests = await Promise.all(Array.from({ length: 8 }, (_, i) => visit("1", "join", i + 1)));
  check(new Set(guests.map((g) => g.visitId)).size, 1, "Competing joins share one visit");
  check(new Set(guests.map((g) => g.guestId)).size, 8, "Every browser has its own guest identity");
  const first = guests[0];
  check((await visit("1", "resume")).guestId, first.guestId, "Refresh retains guest identity");
  check((await visit("1", "join")).guestId, first.guestId, "Repeat join is idempotent");
  check((await visit("2", "join", 20)).visitId === first.visitId, false, "Different tables isolated");
  check((await visit("2", "resume", 1)).status, "ended", "Cookie cannot move to a different table");
  check((await visit("1", "reset", 1, false, guests[0].guestId)).status, "changed", "Stale reset cannot end another visit");
  check((await visit("1", "resume")).status, "active", "Stale reset has no side effects");
  check((await visit("1", "leave")).status, "ended", "Guest can leave");
  check((await visit("1", "resume")).status, "ended", "Leaving guest stays logged out on refresh");
  check((await visit("1", "ping", 2)).status, "active", "Other guests continue after one leaves");
  await visit("1", "reset", 1, false, first.visitId);
  for (let i = 2; i <= 8; i++) check((await visit("1", "ping", i, true)).status, "ended", "Reset revokes every guest");
  const next = await visit("1", "join", 9);
  check(next.visitId === first.visitId, false, "New party gets a fresh visit");
  check((await visit("1", "join", 2)).status, "ended", "An old token cannot silently join a new party");
  await visit("1", "leave", 9);
  check((await visit("1", "join", 10)).visitId === next.visitId, false, "Last guest leaving closes the visit");
  const idle = await visit("idle", "join", 30);
  await db.exec("update public.maracaibo_table_guests set expires_at=now()+interval '1 minute' where table_id='idle';");
  const before = (await visit("idle", "ping", 30)).expiresAt;
  check((await visit("idle", "ping", 30)).expiresAt, before, "Passive polling never prolongs a visit");
  check(Date.parse((await visit("idle", "ping", 30, true)).expiresAt) > Date.parse(before), true, "Touch activity renews the guest");
  await db.exec("update public.maracaibo_table_guests set expires_at=now()-interval '1 second' where table_id='idle'; update public.maracaibo_table_visits set expires_at=now()-interval '1 second' where table_id='idle';");
  check((await visit("idle", "ping", 30, true)).status, "ended", "Activity cannot revive an expired guest");
  check((await visit("idle", "join", 31)).visitId === idle.visitId, false, "Idle table starts a fresh visit");
  const maximum = await visit("max", "join", 40);
  await db.exec("update public.maracaibo_table_visits set started_at=now()-interval '4 hours 1 second' where table_id='max';");
  check((await visit("max", "ping", 40, true)).status, "ended", "Four-hour cap applies even to active phones");
  check((await visit("max", "join", 41)).visitId === maximum.visitId, false, "Maximum duration rotates visit");
  const cap = await Promise.all(Array.from({ length: 33 }, (_, i) => visit("capacity", "join", 100 + i)));
  check(cap.filter((v) => v.status === "active").length, 32, "Guest capacity is bounded independently of game seats");
  check(cap[32].status, "full", "Excess guests do not allocate state");
  check((await visit("!bad", "join", 99)).status, "invalid", "Invalid table rejected");
  check((await visit("1", "payment", 99)).status, "invalid", "No pretend payment-close action");
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`reset role; set role ${role};`);
    for (const table of ["maracaibo_table_guests", "maracaibo_table_visits"]) {
      await assert.rejects(db.query(`select * from public.${table}`)); checks++;
    }
    await assert.rejects(visit("1", "reset", 1, false, next.visitId)); checks++;
    await assert.rejects(visit("1", "join", 999)); checks++;
  }
  await db.exec("reset role;");
  check((await db.query("select count(*)::int n from pg_class where relname in ('maracaibo_table_guests','maracaibo_table_visits') and relrowsecurity")).rows[0].n, 2, "Both tables enforce RLS");
  check((await db.query("select prosecdef from pg_proc where proname='maracaibo_visit'")).rows[0].prosecdef, false, "Function never elevates privileges");
  console.log(`PASS: ${checks} table visit database checks. PGlite serializes its connection; live concurrency is verified separately.`);
} finally { await db.close(); }
