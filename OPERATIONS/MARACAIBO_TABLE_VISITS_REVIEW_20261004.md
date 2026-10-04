# Maracaibo printed-table QR visits and two games

Anthony approved the plan and requested execution and merge on October 4, 2026. Base: production c172ce1. Feature branch: codex/maracaibo-table-visits-20261004.

## Guest experience

The permanent `/table/maracaibo/{tableId}` route remains the printed QR destination. On a phone, opening it establishes an anonymous guest in that table's current visit. The menu does not allocate a football seat. Play offers exactly Table Football (up to four players, 90 seconds, automatic kicks) and Penalty Shootout (solo, five taps against the computer). The existing penalty engine/rules are reused with a Maracaibo palette and approved original logo. Six accessible goal targets expose the same engine input. Menu/game switching disposes the old game. Desktop shows printed-QR phone guidance; no screen-generated invitations remain.

## Visit lifecycle

The server issues a 256-bit opaque, HttpOnly, SameSite=Strict cookie scoped to the table API path (Secure on HTTPS). Only its SHA-256 digest is stored. Reloads preserve the guest identity. Guests expire after 30 minutes without interaction; passive polling does not renew them. Visits have a four-hour hard limit. Leave revokes only the caller, and the last guest leaving closes the visit. Expired/revoked guests remain ended on reload and need an explicit Join this table action. Reset closes the visit for every guest, and the next join generates a new random visit ID. Football discovery and simulation rooms include the full visit ID, independently of table-string truncation.

A row lock serializes join, expiry, leave and reset. There are at most 32 active guest memberships per table; this is independent of the four football positions. Old guest records are pruned on subsequent table joins after one day. The stable public QR identifies a table association; it does not prove physical presence or authorize check/payment access. Existing public cooperative football trust and WebRTC transport remain unchanged.

## Staff and payment

`/customers/maracaibo-tables` is linked from Customer Accounts and uses existing Fina Calle admin authorization. Every listing/reset request revalidates that authorization on the server. Reset requires the observed visit ID, so a stale staff screen cannot end a newer party's visit. Connected foreground phones observe reset within the 15-second poll interval (plus request time); returning background phones immediately revalidate. No new staff accounts or access grants were made.

Maracaibo has no live table-check integration. No payment inference or payment-triggered logout is implemented. A future POS hook must use a verified whole-check closure and expected visit ID; a split payment must never end everyone else's visit.

## Database release

Additive migration source: `APP/web/supabase/migrations/20261004094018_maracaibo_table_visits.sql`, created by Supabase CLI 2.119.0. Applied through the existing connected Supabase project eipypwifiorzqopindfl as migration version 20261004095622, name maracaibo_table_visits. Both new tables have RLS enabled and deny direct anonymous/authenticated access. The single RPC is SECURITY INVOKER, callable only by the existing server service role. It creates no users and changes no existing table, credential or role membership. Live catalog checks confirm these boundaries; a rolled-back service-role join/reset assertion passes. Advisors add only the expected informational RLS-with-no-policy notices for server-only tables; no new warning. Existing unrelated advisories are unchanged: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy.

## Verification

- 41 isolated Postgres visit checks plus 14 origin/response boundary checks pass.
- Existing football/controller suite: 30 checks, 40 rooms/160 simulated phones; 17 touch-control checks pass.
- Existing penalty ball regression: 13 checks pass.
- Full lint: zero errors; six unchanged Lead Arcade warnings. Production build/types pass, 45 prerendered pages.
- Source-exact production-server browser suite: real Next HTTP routes against isolated synthetic Supabase REST backed by the actual migration in PGlite. Independent guest cookies, shared visit, refresh, leave, same-origin enforcement, unauthorized staff denial, authenticated staff UI/reset, new-party rotation, expiry, backend outage/retry, two game options, five-shot finish/replay, game disposal, 320/390 widths, blocked-art fallback and desktop gate pass. No production credentials used.
- Existing four-player browser gameplay suite adapted to the visit selector and visit-scoped room transport; four concurrent seats, one authority, full-table and table isolation, steering/cancel, refresh, hidden host return, leave/rejoin, natural 90-second finish/rematch and missing-art paths pass.
- Visual review retains the approved football stadium/kits and Maracaibo page typography. The penalty header is compact so the full field fits a portrait phone. Viewport-only captures preserve touch emulation in this Chromium runtime.

Evidence: `/workspace/shared/maracaibo-visits-review/`, final UI results under `final/`, football results under `football/`. Browser scripts explicitly identify their simulated/local transport. Physical-phone WebRTC and restaurant-network behavior remain unverified; no claim of real-device certification.

## Release receipt

Publish only the verified tree, require CI and Vercel preview READY, merge the expected PR head, and verify production plus synthetic guest cleanup. Final PR/deployment identifiers are recorded in the release PR and external receipt.
