# Square / Bodega cleanup — September 26, 2026

## IN — Queue 70 / PR 266
Anthony requested “Finish cleaning please.” Base: `2320eba4f34ef25e3e8210efebdcc63b0c04287c`, existing branch `codex/bodega-launch-guest-notes-square-20260926`.
Scope: close review findings for orphaned Square snapshots, automatic public-menu changes, premature tenant access to guest notes, and the shared note-quota denial of service. Preserve menu/game identity, QR routes, reward settings and launch assets. No production merge, credentials, database application, access grants, recipient setup or external delivery.

## Implementation record
- Public menu restored to the reviewed photo-based data source. Removed the unsafe name-matching Square overlay. A new publication mechanism needs explicit approval, stable item/variation IDs and location-aware validation before activation.
- Guest notes are persisted with `restaurant_id = null`, keeping them in Fina Calle's admin intake rather than a restaurant owner's RLS scope. Configuring an email recipient does not implicitly grant portal visibility. Existing records are not bulk-modified.
- Trusted Vercel client address is hashed into a private bucket; arbitrary forwarded headers/form fields are not trusted. Five notes per client address and a global safety limit of 300 per ten minutes are checked atomically. Shared cafe Wi-Fi shares an address bucket; monitor legitimate throttling before widening limits. Old client keys receive bounded 24-hour cleanup when intake is active.
- Additive migration `0022` adds cascading snapshot deletion and atomic OAuth replacement. A failed replacement rolls back the prior connection and snapshot together.
- Connection-generation and active-lease checks prevent an old sync from inserting a prior merchant's data after reconnection. Refresh writes use compare-and-swap and generation checks.
- Added executable PGlite database regressions and wired launch/cleanup checks into existing CI. Source checks are not described as concurrency proofs.

## Verification / OUT
The PR's exact-head CI and preview status are the verification record. Database tests cover replacement, rollback, cascade, stale-generation and expired-lease rejection, monotonic object versions, two-bucket limits, expiry, retention and RPC permissions. PGlite serializes a single connection; real multi-connection staging contention and Square Sandbox OAuth/webhook tests remain activation requirements.
No Square account is connected by these commits. Migrations `0020`–`0022` and credentials remain unapplied/unset by this session. Reward activation, production deployment and public-menu publication are not authorized here.
