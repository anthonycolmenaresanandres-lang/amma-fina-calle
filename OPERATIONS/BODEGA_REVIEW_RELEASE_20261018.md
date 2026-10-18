# Bodega approved review-phase release: preflight

Anthony approved the disclosed code release and restricted queue/Bodega schema permissions. Owner email/authority/consent is still missing. This authorization does not activate publishing, intake, notifications or execution.

## Verified targets and preserved source

- Vercel `amma-fina-calle`, project `prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4`, team `team_MwMFazBLYzRGQnqRAJOPDPH3`; canonical `https://finacalleos.com`.
- Before release: production deployment `dpl_9NDxTFkck9TWYtxwWkwisBVa4hGv`, READY, commit `513f2d9d23db6993cc3e2a8fcfa0a6327f0f4ca6` (traffic identifier-status fix #351, after email presentation #350).
- Production `NEXT_PUBLIC_SUPABASE_URL` was read individually and equals `https://eipypwifiorzqopindfl.supabase.co`; its last update predates that production build. No credential values were retrieved. App source reads that variable directly, with no Next config override. A public client-bundle scan was inconclusive (no URL embedded), not evidence of another database.
- Supabase management metadata confirms existing `colattao-owner-requests`, ref `eipypwifiorzqopindfl`, region us-west-2, ACTIVE_HEALTHY, PostgreSQL17. No new project/branch or infrastructure was created.
- Current main was merged into the isolated owner branch. Only append-only queue/handoff logs conflicted; both histories were retained. All deployed traffic source, tests and email documentation match origin/main byte-for-byte. No traffic configuration or other worktree/tab changed.

## Database installation is blocked; zero migrations applied

Read-only project/branch inventory finds only this production project and its default `main` branch. No separate existing authorized nonproduction validation environment is available. The default branch reports historical `MIGRATIONS_FAILED` metadata from 2026-06-07 while the project itself is ACTIVE_HEALTHY; it is not a safe substitute for a test branch. No Supabase/Docker/psql CLI runtime was found on PATH. Synthetic PGlite is useful regression evidence but does not satisfy the required hosted Auth/PostgREST/concurrent-role validation.

Live catalog reads confirm the foundation tables and RLS exist; `owner_request_private`, `bodega_menu_private` and `account_staging_private` do not. New attribution/revision/audit-link columns are absent. Live intake/admin/owner writer signatures match the documented baseline; existing `submit_change_request` and `apply_owner_change` still inherit PUBLIC execute, with the existing function-body checks. No function/grant/row was changed. Existing migration history has six records; no owner/Bodega queue migration is installed.

Therefore production schema/grants installation is not attempted. No new migration file is placed in migrations/ and no proposal is blindly applied. Resolving this requires identifying an existing explicitly authorized nonproduction environment and validating the exact reviewed SQL there; any new paid branch, credentials or expanded access is outside this release. The four proposals remain the only candidate installation scope; account-staging SQL remains excluded. Shared intake hardening and menu-update version trigger still require actual caller/concurrency validation before installation.

## Release gates and tests

Production environment metadata contains none of `OWNER_REQUEST_QUEUE_ENABLED`, `OWNER_REQUEST_QUEUE_TENANTS`, `ACCOUNT_STAGING_ENABLED`, `BODEGA_MENU_CONTROLS_ENABLED`, `BODEGA_READBACK_ENABLED`, `BODEGA_EXECUTION_ENABLED` or `OWNER_REQUEST_NOTIFICATIONS_ENABLED`. The application defaults off. Database queue/control settings do not exist because installation is blocked. No owner enrollment, baseline stock approval, certificate, worker, invoker, scheduler or client notification is created. Other tenant queue scopes remain inactive. Existing traffic/email controls are untouched.

CI now includes the synthetic owner receipt/actions, queue/tracking, staging, Bodega source/renderer/deployment readback, tenant isolation and rollback suites. These tests use fixtures/mocks only, not live data or messages. The release requires exact-head local checks, existing full CI and a READY production deployment; remote run/PR/released SHA are reported after verification, not inferred here. See BODEGA_OWNER_PILOT_20261018.md and BODEGA_PILOT_VERIFICATION_20261018.md for implementation policy and prior evidence.

Next owner input is only the exact authorized Bodega manager email and Anthony's authority confirmation; derive the Auth UUID through verified access and obtain authenticated consent. Do not provision credentials or enroll anyone based solely on release approval. Publication/intake remain off until identity, consent, owner-approved real availability/order baseline and source/deployment certification all pass. Automatic execution and notifications remain excluded from activation.
