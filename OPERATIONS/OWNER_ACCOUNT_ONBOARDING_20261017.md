# Owner portal: account setup and sync — local continuation

Prepared on `codex/owner-request-audit-20261017`, isolated worktree `C:\dev\amma\worktrees\owner-request-audit-20261017`, following local commit `388fa45`. No pilot has been chosen. This report supplements the [source-backed audit](OWNER_PORTAL_AUDIT_20261017.md) and [queue approval packet](OWNER_REQUEST_QUEUE_APPROVAL_20261017.md); the original live-system findings still apply. New paths below are prepared local code, not deployed behavior.

## What is now prepared

| Step | Implemented path | Boundary |
| --- | --- | --- |
| Staff adds a business | `APP/web/src/app/customers/new/page.tsx`, `src/components/accounts/AccountForm.tsx` | Existing authenticated `canManageTeam` gate. Explicit identity, location, account ID, existing verified Auth email, supported source, review and confirmation. Recent private drafts remain resumable. |
| Persist candidate | `APP/web/src/lib/accounts/actions.ts`, `supabase/proposals/account_staging_v1.sql` | App flag absent/off; database flag false. Private staging only. Duplicate slug/business-location and existing registry reconciliation checks; retry keys bind immutable payloads. |
| Owner accepts association | `src/app/owner/enrollment/[candidateId]/` | Existing password sign-in only, no sign-up/invitation/OTP/send. DB derives UID and confirmed email, checks current reset flag, and matches both against the candidate. Acceptance creates no legacy `owner_emails` entry and no automation enrollment. |
| Import and approve menu | `src/components/accounts/AccountSync.tsx`, `ImportPreview.tsx`, `src/lib/accounts/import.ts` | Exact stored menu, before/after, stable item/variant/category source IDs, source version, account revision, digest, owner approval, manager staging. All data stays private. |
| Sync record | private accounts/plans/identities/events | Last prepared preview and private staging recorded; last successful **live** sync remains null. No publication API exists. Invalid actions show bounded errors; failed transactions do not become durable error events. |
| Owner requests an item change | `src/components/accounts/ItemRequestForm.tsx`, `/owner/[id]/requests` | Availability, display order, or review-only name typo. Fresh server item IDs/revisions, preview, owner confirmation, stable retry UUID. New APIs remain gated off. |
| Owner follows progress | `/owner/[id]/requests/[requestId]`, `src/lib/owner/queue/progress.ts`, `RequestProgress.tsx` | Current owner membership **and original submitting UID**. Timeline, before/after, saved vs emailed distinction, delivery attempt/retry/stopped states, completion acknowledgement and rollback request. |
| Local test preview | `/pilot/accounts`, `src/lib/accounts/fixtures.ts` | Fictional Example Café, `.test` email, browser memory only. Exact loopback Host + `LOCAL_PILOT_PREVIEW=1`, blocked on Vercel. No backend requests or actual Auth checks simulated as real. |

The custom Bodega owner hub and generic owner dashboard now link to protected tracking. The customer ledger shows Add account only to account managers. Existing intake, menu collection and billing behavior remain in place.

## Source adapters and stable identity

`manual-json-v1` supports an explicit bounded JSON snapshot: 1–40 categories, 1–200 item variants, USD whole cents or null for unknown prices, availability and ordering. No URL fetch, scraping, credentials or automatic provider subscription. Unknown keys, wrong tenant/source, missing/duplicate IDs, unknown categories, conflicting positions, invalid prices and oversized input fail closed. IDs must persist through renames. Missing categories/items are retained; an import cannot delete or hide them. A retained item colliding with an imported position stops the plan instead of shuffling data.

`adaptStaticMenu()` is the first reusable preview adapter for the Bodega-shaped static draft structure. It requires an explicit reviewed sidecar for every section/item/variant, pinned to its expected name and variant label. It refuses missing/unused/stale mappings. It does not derive identity from the item name or array index, and unlisted prices remain null. The sidecar references source positions to detect changes; a new/reordered source requires sidecar review. No sidecar has been created for any live client.

Bodega is a reasonable **first adapter candidate**, not an enrolled pilot. Its public route still renders `src/app/(internal)/demo/bodega/menu-draft.ts`; menu rows in Supabase would not publish there. Colattao's stable guest route redirects to a separate application. Square and external websites are visibly unsupported onboarding sync sources. The generic database route also needs tenant-specific publication/readback certification. `src/lib/owner/queue/sources.ts` and the original audit contain the route evidence.

The private SQL proposal assigns durable UUIDs to `(candidate account, category/item kind, source ID)` at staging and preserves those mappings across renames/reimports. These are not public menu IDs yet. Public promotion needs an approved reconciliation design that preserves these identities and protects any existing rows.

## Authority and safe changes

Confirmed Auth email proves control of an account; it does not prove legal authority over a business. Staff identity review, the associated owner's acceptance, Anthony's explicit tenant-owner enrollment, and source certification are separate decisions. This continuation only implements private association/preview consent. It does not grant tenant membership or general execution authority.

For a future narrow policy, availability and display order can qualify after enrollment, authenticated item confirmation, per-request authority review, version/value checks, transactional audit and public readback. Name typos remain review-only in the existing queue proposal. Prices/commercial terms, ingredients/allergens/health claims, payment/security/access changes and destructive edits require explicit human review; none has an automatic executor here. Keyword classification in the preview is advisory, not a safety classifier or authorization mechanism. Every import, including apparently routine content, requires owner review.

Staging is atomic against its own revision, retains old immutable plans, records actor events, and cannot update public tables. The prepared request queue provides compare-and-swap application/inverse rollback, audit/outbox records and bounded retries. An update after preview or verification produces a conflict. Rollback needs unchanged applied value/revision, restored public-menu verification and owner acknowledgement. See the earlier queue proposal for exact transitions.

## How requests can reach the assistant

The saved queue and private staff inbox are the durable source of truth. Existing `submit_owner_request_v1` also writes the central `change_requests` record. Prepared notification code sends metadata and a private inbox link through the existing email provider only when separately enabled. Provider acceptance is not receipt/read acknowledgement by Anthony or an assistant. Retries are bounded and can stop for manual handling.

A supported authenticated read during a user-authorized Codex session can inspect the inbox and retrieve typed details with `get_owner_request_review_v1`. Incoming text, uploaded files, provider data and old requests remain untrusted data. They cannot grant permissions or issue general instructions. No continuous inbox access, push-to-Codex bridge, recurring watcher or background execution is active. A future scheduled check needs separate authorization, a successfully verified connected read path, a narrow tenant/type policy, and a documented manual fallback. No email-forwarding promise or paid automation service is assumed.

## Exact release requirements

1. Choose one pilot explicitly. Verify the real owner's business authority and existing Auth account privately. No client has been enrolled by this task. Do not infer enrollment from this preview or a matching email.
2. Review the current production schema/grants and existing `can_current_user_manage_team()` behavior. The new staging proposal depends on the earlier queue proposal's private verified-actor helper, foundation/intake/admin functions, Auth schema and manager function. It is **not** a migration and must never be auto-applied. Any reviewed migration must be generated with the official CLI and run advisors/live-isolation/concurrency checks in an approved nonproduction environment first.
3. Review the seven new authenticated staging RPC grants and two new tracking RPCs (plus replaced detail RPC), private RLS tables, denial paths, existing legacy writers and retention requirements. Synthetic PGlite tests are not full Supabase/PostgREST/Auth-session validation. Current private draft list exposes the latest 25 to managers only; older drafts remain accessible by receipt ID. Add paginated staff discovery before higher-volume enrollment.
4. Approve and implement public promotion separately. Existing public menu reads do not uniformly hide onboarding accounts. This is why staging never writes `public.restaurants`, `owner_emails`, categories or items. Promotion needs exact tenant/source mappings, stable ID migration/reconciliation, protected preview destination, publication gate and verified public readback. Do not connect a static menu by simply enabling the queue.
5. Complete the chosen source's publishing adapter and certify public path/value/version readback. The prepared queue verification RPC accepts a trusted service assertion; it is not an HTTP verifier. No credential, certificate, provider connection or autonomous runtime is provisioned here.
6. Anthony approves the narrow tenant-owner policy, expiry/revocation, allowed fields, reviewer responsibility and rollback. Existing queue still requires per-request authority approval. Do not remove that gate or activate old requests automatically.
7. Approve the prepared code/schema/grant release, then separately control app/database flags. `ACCOUNT_STAGING_ENABLED`, `OWNER_REQUEST_QUEUE_ENABLED`, queue execution/notification settings remain absent/false. Staging alone cannot publish even if enabled. Notifications and execution have no scheduler/caller installed by this continuation.
8. Validate actual Auth owner/manager sessions, source adapters, concurrent writers, owner confirmation, inverse rollback, notifications/dead letters and public-menu verification before a narrowly scoped production pilot. Existing-account creation/provisioning remains a separately approved workflow. Add durable redacted failed-sync diagnostics, staff typed review UI and owner reset/recovery enrollment UX before routine client rollout. Integrate and recheck against current main, including the parent's separately deployed email patch; this worktree was deliberately not rebased onto or mixed with that work.

## Cost and verification

No new package or service, infrastructure, credential or spend was introduced. Code uses existing Next/React/Supabase, Node/Web Crypto and cached PGlite/tsx. A manual authenticated review and private staging path can fit existing infrastructure **subject to current quotas**. No claim of free unlimited polling, provider delivery, guaranteed savings or income is made. If usage would require spending, stop for approval.

Run focused checks from `APP/web`:

```powershell
node --import tsx scripts/account-import-selftest.ts
node scripts/account-staging-db-selftest.mjs
node --import tsx scripts/account-actions-selftest.ts
```

The results and browser evidence are recorded in [OWNER_ACCOUNT_VERIFICATION_20261017.md](OWNER_ACCOUNT_VERIFICATION_20261017.md). The earlier full build of `388fa45` passed after disk recovery; old audit notes about ENOSPC are historical.

Preview locally from this isolated worktree with provider variables unset; do not copy production dotenv files:

```powershell
$env:NEXT_TELEMETRY_DISABLED='1'
$env:LOCAL_PILOT_PREVIEW='1'
npm run dev -- --webpack --hostname 127.0.0.1 --port 3147
```

Open `http://127.0.0.1:3147/pilot/accounts`. The fictional form and sync simulation never call the staging server actions or Supabase. Refresh clears all test state. The production-facing forms remain disabled without their release flag. No live SQL, push, deploy, client messages, spending or changes to another worktree occurred.
