# Completed owner visual release - 2026-10-18

Anthony explicitly requested deployment of the preserved completed open-layout/mobile work after stopping further design. Release is isolated on codex/owner-open-visual-release-20261018 from main58497a1079cc551db1c8fd7377baa8fb13447795. Original owner audit worktree remains untouched.

## Included
Six reusable production UI/style files: OwnerDashboard.tsx, owner-portal.module.css, menu-quick-edit.module.css, AccountWorkspace.module.css, ItemRequestForm.tsx and RequestProgress.tsx. Open spacing replaces repeated framed containers; owner desk has the existing request link as its primary action; mobile controls and before/after previews are clearer; request metadata and delivery details use native disclosures. Delivery failures remain expanded. One existing test expectation changes from Account & payments to Account; destination and billing checks stay intact.

## Excluded and preserved
No pilot/owner route, synthetic adapter, screenshots, Library metadata, customer records, SQL proposal/migration, native tools, package change, traffic code, backend action, authentication, tenant permission, enrollment, notification, worker or configuration change. Unreleased7273e44,2a5c9b0 and1ecefaf are not ancestors of this branch. No automatic production execution is enabled. No new service or spending.

## Validation
Focused ESLint and owner-app, owner-menu(51), owner-request, account-import/progress(42), queue-client/source/notification(43), actual account-actions(17), account/payment(13) and billing(21) regressions pass; all external calls mocked. TypeScript AST comparison confirms every ItemRequestForm/RequestProgress onSubmit/onChange expression unchanged from main, including request UUID, expected revision, required confirmations and rollback; RequestProgress action prefix unchanged. Auth/traffic/SQL/dependency files unchanged. Production environment metadata read without decryption: all eight owner/Bodega/staging/notification/preview activation keys absent.

Completed visuals previously verified at320/390/desktop with no horizontal overflow or browser errors, minimum52px primary controls, preserved keyboard focus and readable contrast; fictional private captures remain only in the original local worktree. Clean release build and exact-head CI are tracked in the PR; final deployment identity and live probes recorded separately after release. No real owner session used.

## Release checks
Merge only after exact-head CI/build succeed. Verify production project amma-fina-calle/prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4 in team_MwMFazBLYzRGQnqRAJOPDPH3 is READY at merged SHA; verify canonical finacalleos.com, unauthenticated owner sign-in, fixture404s and unchanged public Bodega menu. All activation remains off; real owner enrollment and database rollout remain separate work.

Local isolated production webpack build: PASS, including TypeScript,58 static pages and build traces; all credentials/activation keys absent from build environment. Focused lint PASS. Existing dependency lock hash matched before junction reuse; no installation.
