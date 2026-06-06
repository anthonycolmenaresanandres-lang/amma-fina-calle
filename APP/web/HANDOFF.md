# HANDOFF

## PROJECT PURPOSE
- AMMA/Fina Calle web app for the main Fina Calle OS landing page and related demo routes, including the parked `/conquest` experience.

## CURRENT STAGE
- Active task: update the bottom of the main landing page with a premium, funny Instagram CTA for `@fina_calle`.
- Repository state before task: clean working tree.

## KEY DECISIONS
- Keep the main landing page premium, cinematic, black-and-white, entrepreneurial, and local-business focused.
- Anthony reviews deployed preview or production URLs, not localhost.
- Do not touch `/conquest` gameplay files unless a shared layout component makes it unavoidable.

## PROTECTED FILES / OUT OF SCOPE
- `/conquest` gameplay files and mechanics.
- Pricing, payment logic, auth, database, secrets, and environment configuration.
- Unrelated app routes, data, and styling.

## PARKED WORK
- `/conquest` remains parked gameplay/demo work and is not part of this landing-page CTA task.

## STARTED
- [2026-06-06 11:32:23] Session started
- [2026-06-04 12:23:40] Session started

## DONE
- [2026-06-06 11:35:16] Implemented server-side internal admin gate for /customers and /customers/[id] using Supabase Auth session plus INTERNAL_ADMIN_EMAILS allowlist
- [2026-06-04 12:27:01] Committed funny Instagram CTA landing page update
- [2026-06-04 12:26:02] Verified Instagram CTA landing page update with npm.cmd run build
- [2026-06-04 12:25:02] Added funny premium Instagram CTA to the main landing page footer
- [2026-06-04 12:23:51] Created minimal handoff system and confirmed landing-page CTA scope

## NEXT
- [2026-06-06 11:35:16] Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and INTERNAL_ADMIN_EMAILS before using internal customer routes; public and owner routes remain untouched
- [2026-06-04 12:27:10] Push landing page Instagram CTA commit to origin main and verify deployed production URL
- [2026-06-04 12:25:11] Run npm.cmd run build, inspect scoped diff, then commit and push if build passes
- [2026-06-04 12:23:51] Inspect package and main landing page files only, then add Instagram CTA
- Add the final-section Instagram CTA to the main landing page, then build, commit, push, and verify the deployed URL.

## BLOCKERS

## NOTES
