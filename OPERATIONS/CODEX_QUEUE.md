# Codex Queue — canonical live queue

_Claude writes; Codex executes. This is the only live queue._

Canonical repo: `C:\Dev\amma\amma-fina-calle`
App: `APP/web`
Production branch: `main` (human approval required)
Live handoff log: `OPERATIONS/HANDOFF_LOG.md`
Superseded Desktop queue: `OPERATIONS/archive/desktop-20260710/CODEX_QUEUE.md`

## Revalidation gate — archived tasks only

The archived Desktop queue contains stale clone paths, a stale migration counter, and production/send steps that require human action. Claude must revalidate each item against the current canonical branch before restoring it as an actionable task.

Required revalidation fields:

- exact canonical paths and branch base;
- proposed migration filename unused, plus applied production state verified or explicitly unknown;
- whether the task crosses a secret, access, send, deploy, or production boundary;
- targeted PASS condition and explicit stop condition.

## Claude handoff template

````markdown
## [ ] N — short imperative title

**State:** READY | IN PROGRESS | DONE | BLOCKED
**Codex effort:** LOW | MEDIUM | HIGH
**Scope:** exact files/surfaces and explicit exclusions.
**Token-saving rule:** targeted reads; changed lines/new files only; final verification only.
**Why:** concise context.
**Exact prompt to paste:**
```text
Anthony, ...
PASS = ...
```
````

No task is live until it appears below this line with a current PASS condition.

## [x] 1 - Add secure owner billing and repair mobile sign-in

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly directed Codex to own this implementation here on 2026-07-17, overriding the normal Claude-only queue-writing rule for this task.
**Branch base:** `codex/owner-billing`, created from `ops/data-center-docs` at `83a1e27`.
**Scope:** `APP/web/src/app/owner/[id]`, new server-only Stripe/billing modules, one Stripe webhook Route Handler, one unused Supabase migration after `0009`, Stripe dependency metadata, and targeted documentation. Existing menu, game, public `/m`, and production surfaces are excluded.
**Migration state:** `0010_owner_billing_subscriptions.sql` is unused locally. Applied production migration state is unknown; do not apply it.
**Boundaries:** local/test-mode code only. Do not enter secrets, apply migrations, configure bank access, deploy, merge, push, or touch production.
**Token-saving rule:** targeted reads; changed lines/new files only; final verification only.
**Why:** Owners need responsive sign-in, payment status, recurring billing enrollment, invoice recovery, and a safe hosted billing-management path.
**PASS:** Local code builds without Stripe/Supabase server secrets; owner actions re-authorize restaurant access; Checkout uses only a server-configured recurring price; Customer Portal uses only the server-side customer mapping; webhook verifies the raw-body signature and deduplicates events; billing UI exposes no Stripe identifiers; 320/390 px sign-in does not overflow; targeted lint and build pass.
**STOP:** Stop before secrets, live Stripe configuration, migration application, deployment, push, merge, or production access. Stop and report if current repo state conflicts with this scope.

## [x] 2 - Build the client ledger and owner-controlled team access

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony continued the Codex-owned implementation and requested a way to identify every client, see what each pays, and onboard future employees.
**Branch base:** `codex/owner-billing` at `ba866e8`.
**Scope:** Upgrade `/customers` and `/customers/[id]`; add `/customers/team`; extend prepared migration `0010` with recurring price facts; add unused migration `0011_client_ledger_and_team_access.sql`; update existing Supabase magic-link admin auth. Public menu, owner editing, games, bank credentials, and production are excluded.
**Migration state:** `0011_client_ledger_and_team_access.sql` is unused locally and depends on prepared `0010`. Applied production state remains unknown; apply neither migration.
**Access rule:** New team members receive internal operations access only. Only the existing Anthony owner email is prepared to manage the team. No access is granted by Codex.
**Boundaries:** local code only. Do not add a live employee, send an invite, enter secrets, apply migrations, deploy, push, merge, or touch production.
**PASS:** Client ledger identifies each business/contact and displays plan, recurring amount/interval, payment status, invoice state, and renewal date; client detail shows owner-portal access route and allowed owner emails; team roster shows active staff; only a team manager can prepare add/deactivate actions; first-time allowlisted employees can request a magic link without email enumeration; server authorization is rechecked; targeted lint, type/build, and browser checks pass.
**STOP:** Stop before any live access change, invite/send, migration application, deployment, push, merge, credential entry, or production action.

## [x] 3 - Finalize owner billing with Stripe and Zelle reconciliation

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly directed Codex to finish the owner portal, finalize the Stripe and Zelle integration, install the prescribed browser runner and useful supporting skills, and place the SOPs in Drive Documents.
**Branch base:** `codex/owner-billing` at `5d5bc33`.
**Scope:** Harden the prepared Stripe workflow; add an authenticated owner Zelle payment-reporting surface and an admin verification inbox; add one unused Supabase migration after `0011`; correct billing documentation; verify with the installed agent-browser; create one comprehensive AMMA SOP manual and import it into the Drive `Documents` folder. Public menu, games, bank credentials, automatic Zelle settlement, and production are excluded.
**Migration state:** `0012_zelle_payment_notices.sql` will be prepared locally and depends on unapplied migrations `0010` and `0011`. Applied production state remains unknown; apply none of them.
**Payment rule:** Stripe remains the authoritative recurring rail. Zelle is a manual Bank of America rail: an owner report remains `reported` until an authorized AMMA billing manager marks it `verified` or `rejected`. Mercury is not represented as Zelle-compatible.
**Boundaries:** local/test-mode code and Drive document creation only. Do not enter secrets, access bank accounts, apply migrations, change live Stripe/Zelle settings, deploy, push, merge, or touch production.
**PASS:** The owner portal securely displays server-configured Zelle instructions, records an owner report without marking the account paid, shows recent report status, and exposes billing-manager-only verification; Stripe records the invoice paid timestamp and rejects insecure production callback configuration; the billing runbook covers Stripe, Bank of America Zelle, Mercury, reconciliation, and activation; lint, type/build, security review, and browser fail-closed checks pass; the verified SOP manual is a native Google Doc inside Drive Documents.
**STOP:** Stop before secrets, bank login, live payment configuration, migration application, deployment, push, merge, or production access. Stop and report any repo conflict.

## [x] 4 - Reframe the Fina Calle public landing page

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly directed Codex on 2026-07-19 to proceed with the approved landing-page redesign and make it feel expensive, intricate, innovative, calm, secure, and edgy without becoming scary.
**Branch base:** `codex/landing-premium-20260719`, created from current `origin/main` at `422352b` in `C:\Dev\amma\worktrees\landing-premium-20260719`.
**Scope:** Public root landing page, root metadata, one bespoke social-preview asset, and this task's operations log. Preserve all owner/customer/menu, billing, authentication, database, API, game-engine, `/conquest`, and production behavior.
**Boundaries:** Local branch, verification, push, and review PR only. Do not merge, deploy, publish, enter secrets, alter access, or touch production.
**Token-saving rule:** Read and change only the root landing surface, metadata, directly used public assets, and handoff records; run targeted lint plus one final production build.
**Why:** The current homepage is visually cinematic but communicates the offer weakly. The redesign must make local-business owners understand the offer, trust the proof, and request a build while preserving the Fina Calle identity.
**PASS:** The first viewport explains Fina Calle plainly and routes to a build request and verified work; Colattao proof and live modules are represented without future-feature claims; visual language is open/editorial, premium, calm, secure, and responsive; keyboard focus and reduced motion are respected; protected routes have no diff; targeted lint and the production build pass; a review PR is open.
**STOP:** Stop before merge, Vercel deployment, Sites hosting, production publish, or any change to protected routes, data, access, billing, or secrets.

## [x] 5 - Publish the approved Fina Calle landing redesign

**State:** DONE
**Codex effort:** LOW
**Authority:** Anthony explicitly approved the live production release on 2026-07-19 with: `go for it i want to see it live`.
**Branch base:** Ready PR #163 from `codex/landing-premium-20260719` into `main`; approved head before release logging was `813bb3e` and all GitHub/Vercel checks passed.
**Scope:** Merge PR #163, wait for the corresponding Vercel production deployment, then verify `https://finacalleos.com/`, `/og.png`, canonical metadata, and representative protected routes without changing them.
**Boundaries:** No additional product code, secrets, access, data, billing, migrations, email, purchases, or unrelated deployment work. Stop at the first deployment or live-content divergence.
**PASS:** PR #163 is merged to `main`; the exact merged head reaches a Ready Vercel production deployment; the root and OG image return HTTP 200; live HTML contains the new headline, proof, CTA, canonical URL, and OG image; `/conquest`, `/owner/colattao`, `/customers`, and `/m/colattao` still return their expected reachable/auth-gated responses; production logs show no release-time error.
**STOP:** Stop and report before any remediation if mergeability changes, checks fail, Vercel does not reach Ready, the live alias points elsewhere, new homepage content is absent, or a protected route regresses.

## [x] 6 - Simplify and center the Fina Calle mobile landing page

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly requested on 2026-07-19 that the mobile site use way fewer words, centered composition, and a very simple presentation.
**Branch base:** Continue `codex/landing-release-log-20260719` from production `main` at `44cb3c1`; PR #164 remains the single unmerged review surface.
**Scope:** Mobile-only presentation and copy variants in `APP/web/src/app/page.tsx` and `APP/web/src/app/page.module.css`, plus this task's operations records. Preserve the premium desktop composition.
**Boundaries:** No merge, production publish, protected-route edits, new assets, secrets, access, data, billing, migrations, email, purchases, or unrelated code.
**PASS:** At phone width, every section is centered and reduced to a short headline, primary action, image, or terse list; supporting paragraphs, codes, facts, secondary links, and metadata are removed from the mobile flow; desktop content remains intact; accessibility, targeted lint, production build, and responsive preview checks pass.
**STOP:** Stop before production merge or if the change alters desktop hierarchy, protected routes, link destinations, or verified business claims.

## [x] 7 - Present each mobile section as a premium graphic-novel page

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly requested on 2026-07-19 that each mobile section read like a cool comic-book page while avoiding a lame or novelty-comic result.
**Branch base:** Continue `codex/landing-release-log-20260719` from verified PR #164 head `5b35e1e`; production remains `44cb3c1`.
**Scope:** Mobile-only sequential framing and layout in `APP/web/src/app/page.tsx` and `APP/web/src/app/page.module.css`, plus this task's operations records. Preserve the simplified mobile copy and premium desktop composition.
**Boundaries:** No speech bubbles, novelty comic fonts, sound-effect graphics, new claims, new assets, merge, production publish, protected-route edits, secrets, access, data, billing, migrations, email, purchases, or unrelated code.
**PASS:** The six phone sections read as an intentional 01-06 sequence with distinct splash, proof, module-grid, storyboard, control, and finale compositions; the graphic-novel character comes from gutters, crops, ink texture, and restrained page marks; mobile remains centered and concise; desktop, accessibility, links, routes, lint, build, and preview verification pass.
**STOP:** Stop before production merge or if the treatment becomes harder to scan, clips content at supported phone widths, harms focus/touch behavior, alters desktop composition, or changes protected behavior.

## [x] 8 - Deepen mobile comic texture, contrast, and shadow

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly requested on 2026-07-19: `More texture more comic more words contrast more contrast in general use shadowing please`.
**Branch base:** Continue `codex/landing-release-log-20260719` from verified PR #164 head `45beceb`; production remains `44cb3c1`.
**Scope:** Mobile-only finish work in `APP/web/src/app/page.module.css` plus this task's operations records. Preserve the short mobile copy, sequential 01-06 structure, desktop composition, and existing assets.
**Interpretation:** Increase contrast around the words rather than adding more words: deepen Ink, brighten Paper/Gold/Sapphire, layer halftone and crosshatch texture, and use crisp offset shadows and heavier panel gutters.
**Boundaries:** No new copy, speech bubbles, novelty comic fonts, sound effects, new assets, merge, production publish, protected-route edits, secrets, access, data, billing, migrations, email, purchases, or unrelated code.
**PASS:** At 390 px and 320 px, headings and labels have stronger readable separation; all six sections carry richer ink/paper texture, harder panel depth, and clearer contrast without visual menace or clutter; desktop, focus/touch behavior, routes, lint, build, and preview checks pass.
**STOP:** Stop before production merge or if texture competes with legibility, shadows clip content, small-phone layout overflows, desktop changes, or protected behavior changes.

## [x] 9 - Publish the approved mobile sequential-art refinement

**State:** DONE
**Codex effort:** LOW
**Authority:** Anthony explicitly approved the production merge on 2026-07-19 with: `merge pleae`.
**Branch base:** Ready PR #164 from `codex/landing-release-log-20260719` into `main`; approved head is `07a8d09`, and production `main` is `44cb3c1` before release logging.
**Scope:** Commit this release check-in, squash-merge only PR #164, wait for the exact resulting `main` revision to reach Vercel production, then verify the public root and representative protected routes read-only.
**Boundaries:** No new product code, visual changes, secrets, access, data, billing, migrations, email, purchases, or unrelated deployment work. Stop at the first branch, check, merge, deployment, alias, live-content, route, or runtime-log divergence.
**PASS:** PR #164 is merged to `main`; its exact squash commit reaches a Ready Vercel production deployment; the root returns HTTP 200 and contains the approved 01-06 mobile sequence and short headline; `/conquest`, `/owner/colattao`, `/customers`, and `/m/colattao` remain reachable or auth-gated as expected; production logs show no release-time error.
**STOP:** Stop and report before remediation if the approved head changes, checks fail, mergeability changes, Vercel does not reach Ready, the live alias points elsewhere, approved content is absent, or a protected route regresses.

## [x] 10 - Add fluid editorial motion and publish when verified

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly requested on 2026-07-19: `great now give me a fluid movement make it really cool an unique and merge and pushe when satisfiy before rechecking our work`.
**Branch base:** `codex/landing-motion-20260719`, created from production `main` at `d13642b`; the prior release closeout is carried forward as ops-only commit `54fc906`.
**Scope:** Add a small landing-page-only motion controller, semantic reveal hooks in `APP/web/src/app/page.tsx`, motion styling in `APP/web/src/app/page.module.css`, and this task's operations records. Preserve all copy, assets, links, routes, metadata, data, and protected behavior.
**Motion direction:** Use a Fina Calle-specific `registration lag`: Gold and Sapphire print plates briefly trail the Ink frame before aligning; pair it with diagonal headline reveals, staggered comic panels, and slow mechanical-crest inertia. Avoid bounce, generic fade-up repetition, scroll hijacking, or constant distracting motion.
**Boundaries:** No `/conquest`, owner/customer/menu, authentication, API, billing, database, game, secret, access, email, purchase, or unrelated code changes. Production merge is authorized only after local and deployed-preview verification are fully satisfactory and every required check is green.
**PASS:** Motion progressively enhances the static page, uses compositor-safe transform/opacity behavior, reveals each section and panel once, keeps focus and touch behavior intact, honors reduced motion with complete static content, causes no overflow or layout shift at 390 px, 320 px, or desktop, passes targeted lint/build and browser checks, reaches a Ready preview, merges under an exact-head lock, and passes exact-production verification.
**STOP:** Stop before merge if motion hides content without JavaScript, becomes visually noisy or disorienting, harms readability/focus/touch behavior, clips supported widths, changes protected behavior, fails a check, or the preview differs from the approved local result.

## [x] 11 - Transform landing images into scroll-linked color dust and publish

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly requested on 2026-07-19: `Ok however possible I want the pics to dissolve into that color dust and transforma to the next slide as we scroll plan. First and when done merge and push`.
**Branch base:** `codex/landing-dust-20260719`, created from production `main` at `210b83b`; prior motion-release checkout is carried as ops-only commit `45e1d5c`.
**Scope:** Extend the landing-only controller in `APP/web/src/app/LandingMotion.tsx`, add semantic dust source/target hooks in `APP/web/src/app/page.tsx`, add the Canvas surface and progressive image treatment in `APP/web/src/app/page.module.css`, and maintain this task's operations records.
**Transition direction:** Sample the real Fina Calle crest and Colattao proof image, combine their colors with Gold/Sapphire/Paper dust, and map scroll progress so each image reversibly disintegrates toward the incoming page frame before reforming when the user scrolls upward. Keep native scrolling and the existing editorial reveal system.
**Conversion-safe mechanic:** Add a scoreless six-stage progress rail that mirrors pages 01-06 and gives the final build CTA a restrained completion ring. It must remain decorative, reversible, copy-free, pointer-transparent, and removable if mobile QA shows clutter or CTA competition.
**Boundaries:** No Phaser/game runtime, scroll hijacking, new copy/assets/claims, `/conquest`, owner/customer/menu, authentication, API, billing, database, secret, access, email, purchase, or unrelated code changes. Production merge is authorized only after exact local, preview, accessibility, responsive, performance, and protected-route verification.
**PASS:** The real images visibly dissolve into sampled color dust during section transitions; reverse scrolling reconstructs them; all work is requestAnimationFrame-batched and device-capped; mobile and desktop remain legible with zero overflow; reduced-motion and no-JavaScript paths retain complete static images/content; focus/touch behavior, exact links, lint/build, immutable preview, merge lock, production aliases, protected routes, and runtime logs pass.
**STOP:** Stop before merge if the effect reads as a fade/wipe, masks important copy, drops supported mobile responsiveness, causes sustained animation offscreen, exceeds a stable frame budget, taints the Canvas, changes content or protected behavior, fails reverse/reduced/no-JS checks, or diverges at preview.

## [x] 12 - Limit color dust to the opening logo transformation

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly requested on 2026-07-20: `keep the disolving motion to only the logo design and it transforms into the next pic but ommit the desolvin for the next one lets keep the graphics only for that inisial one`.
**Branch base:** `codex/landing-single-dust-20260720`, created from production `main` at `e890a5c`.
**Scope:** Remove the later Colattao proof-image opt-in from `APP/web/src/app/page.tsx`; preserve the opening logo-to-page-02 dust transformation, static proof image, six-stage journey mechanic, all copy, layout, assets, links, and protected routes.
**Boundaries:** No particle-engine rewrite, new effect, new copy, asset change, route change, merge, or production publish. Push a review branch and preview only after local verification.
**PASS:** Exactly one dust source initializes; the logo dissolves into the page-02 transition; the Colattao proof image remains fully visible while entering and leaving its section; reverse scroll restores the logo; responsive, reduced-motion, no-JavaScript, lint, and build checks pass.
**STOP:** Stop before merge or if the proof image opacity changes with scroll, the opening transition regresses, static fallbacks fail, or any protected behavior changes.

## [x] 13 - Form the proof image from the opening logo dust

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly clarified on 2026-07-20: `the next pic to be form from the dust of the logo. meaning there is no image there and as i scrooll the next image is froming not just appearing`.
**Branch base:** Continue draft PR #167 on `codex/landing-single-dust-20260720` from verified head `52828c1`; production remains `e890a5c`.
**Scope:** Extend `APP/web/src/app/LandingMotion.tsx` to sample the Colattao proof image as the opening crest scene's target grid; add source/target semantics in `APP/web/src/app/page.tsx`; add target-opacity progressive enhancement in `APP/web/src/app/page.module.css`; maintain operations records.
**Morph direction:** Keep the proof image visually absent at the beginning of the transition. Move crest-derived Gold/Sapphire/Paper particles into the proof image's exact grid, interpolate toward sampled photo colors, then crossfade to the real image only during final assembly. Reverse scroll must deconstruct the proof and rebuild the crest.
**Boundaries:** Preserve native scrolling, one dust scene, the six-stage journey, copy, layout, assets, links, hover treatment, static reduced-motion/no-JavaScript photo, and protected routes. No later dissolve, new dependency, merge, or production publish.
**PASS:** The rendered proof image begins at opacity zero during normal motion; an active non-empty particle field travels from crest coordinates into proof-image coordinates; late-stage particles cover the target grid and carry sampled photo color; the DOM photo reaches full opacity only near completion; reverse scroll returns it to zero and restores the crest; lint, build, responsive, reduced-motion, scripts-disabled, idle-frame, and preview checks pass.
**STOP:** Stop before merge if the photo merely fades in, target pixels do not visibly assemble, the image is absent in reduced/no-JavaScript modes, the transition obscures copy or overflows mobile, reverse motion breaks, performance regresses, or the preview diverges.

## [x] 14 - Publish the approved crest-to-proof morph

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly approved on 2026-07-20: `merge and or push`.
**Branch base:** Draft PR #167 from `codex/landing-single-dust-20260720` into production `main`; approved head before release check-in is `148e868`, and production base is `e890a5c`.
**Scope:** Push this release check-in, require all checks on the resulting exact head, mark PR #167 ready, squash-merge under an exact-head lock, wait for the resulting `main` commit to reach Vercel production, and verify the public landing morph plus representative protected routes read-only.
**Boundaries:** No new product, copy, layout, asset, route, data, access, billing, authentication, API, or game changes. Do not merge if the head, base, checks, preview, or mergeability changes unexpectedly.
**PASS:** PR #167 is merged under the exact-head lock; its squash commit reaches a Ready production deployment aliased to `finacalleos.com`; the live root has the crest source/proof target without a later proof source; live browser checks confirm photo formation, completion, reverse reconstruction, zero overflow, and no page error; representative protected routes return expected HTTP responses; production error logs contain no entries.
**STOP:** Stop and report before remediation on any branch divergence, failed check, merge conflict, deployment error, alias mismatch, missing hook, broken live morph, protected-route regression, or runtime error.

**Result:** PR #167 merged on 2026-07-20 as `10be3ef`; GitHub currently reports the PR merged. The stale open queue state was corrected during the 2026-08-02 Las Palmas check-in.

## [x] 15 - Simplify the Las Palmas owner-review landing

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony directly approved the AJ Gator's production merge and requested the same minimal landing treatment for the Las Palmas menu on 2026-08-02, overriding the stale queue order for this scoped task.
**Branch base:** `codex/las-palmas-minimal-landing-20260802`, created from current production `origin/main` at `bb0cb42` in a clean sibling worktree.
**Scope:** Refine only `/demo/las-palmas` into a logo-first, three-action first viewport using the registered exact sign asset and the existing silver-palm-to-`MENU` scroll motion. Preserve the menu single source of truth, enhanced food media, disclosures, Guest Notes, game and table-preview destinations, noindex metadata, and pending-client-approval language.
**Boundaries:** No Supabase, Stripe, POS, Client OS, customer data, secrets, menu/pricing/media edits, game engine/config, table behavior, live QR changes, or production merge. AJ Gator's release logging may be carried as operations-only history.
**PASS:** The phone first viewport contains only minimal status, the registered logo/motion, and Menu, Game, Table actions; all three destinations work; the motion completes and reverses; reduced motion, keyboard focus, responsive layout, menu/photo counts, notices, metadata, targeted lint, types, production build, and browser checks pass; a draft review PR is open.
**STOP:** Stop before the Las Palmas production merge. Stop and report if the registered logo, motion, menu, media, game, table preview, Guest Notes, approval labels, or protected surfaces regress.

**Result:** Feature commit `18ef60b` is pushed to draft PR #200. Local lint, types, production build, responsive/motion/reduced-motion/focus/content/destination checks pass; GitHub `web`, Vercel, and Vercel Preview Comments checks pass. The Ready preview is Vercel-SSO protected. Production is unchanged pending Anthony's explicit approval of PR #200.

## [x] 16 - Publish the approved Las Palmas minimal landing

**State:** DONE
**Codex effort:** LOW
**Authority:** Anthony explicitly approved Las Palmas for production on 2026-08-02 with: `Aprove las palmas`.
**Branch base:** Draft PR #200 from `codex/las-palmas-minimal-landing-20260802` into `main`; approved head before this release check-in is `2c8d947`, and production base is `bb0cb42`.
**Scope:** Add this release authorization record, require all checks on the resulting exact head, mark PR #200 ready, squash-merge under an exact-head lock, wait for the resulting `main` commit to reach Vercel production, and verify the Las Palmas demo plus its Menu, Game, and Table destinations read-only.
**Boundaries:** No new product, visual, copy, asset, menu/data/media, Guest Notes, game, table, Client OS, integration, secret, access, billing, QR, or customer-contact changes. Stop on any unexpected head, base, diff, check, mergeability, deployment, alias, route, motion, content-count, or runtime result.
**PASS:** PR #200 merges under the exact-head lock; its squash commit reaches a Ready production deployment aliased to `finacalleos.com`; the live demo returns HTTP 200 with the registered sign, minimal actions, reversible motion, noindex metadata, 39 disclosures, 37 enhanced photos, and truthful pending/no-send boundaries; representative protected surfaces retain expected responses.
**STOP:** Stop before remediation on any divergence. Do not claim production success until the merged revision and live behavior are directly verified.

**Result:** PR #200 was squash-merged under the approved exact-head lock as production commit `21d032c`. Vercel production deployment `dpl_HpFdBwXbnx7wdYHgVLFB5Gp98Nb3` reached Ready and aliases `finacalleos.com`. Live phone-width verification passed for the logo-first landing, three actions, reversible and reduced-motion states, 39 disclosures, 37 enhanced menu photos with no broken media, noindex metadata, Guest Notes, game and table destinations, and the pending-client-approval/no-send boundaries. Representative protected routes retained HTTP 200 responses; no protected surface was changed.

## [x] 17 - Point Las Palmas Menu to the current original menu

**State:** DONE
**Codex effort:** LOW
**Authority:** Anthony requested that the Las Palmas menu use the current original restaurant menu on 2026-08-02, overriding the stale queue order for this scoped task.
**Branch base:** `codex/las-palmas-original-menu-20260802`, created from current `origin/main` at `15edd95` in a clean sibling worktree.
**Scope:** Change only the `/demo/las-palmas` first-viewport Menu action from the local `#menu` anchor to the exact Lynnhaven menu PDF currently linked by the restaurant's official website. Keep the existing curated owner-review proof below the landing unchanged.
**Boundaries:** No menu transcription, price/media/data change, Guest Notes change, motion redesign, game/table behavior change, Supabase, Stripe, POS, Client OS, customer data, secret, live QR target, customer contact, or production merge.
**PASS:** The Menu action opens the verified official Lynnhaven PDF in a separate tab; Game and Table remain unchanged; the landing, motion, local owner-review proof, notices, noindex metadata, responsive layout, keyboard behavior, lint, types, build, and browser checks pass; a draft PR is ready for Anthony.
**STOP:** Stop before production merge. Stop if the official source no longer exposes the same menu URL or any protected behavior changes.

**Result:** Commit `0f2bfa5` is pushed to draft PR #201. The official PDF returns HTTP 200 as `application/pdf`; the 390 x 844 browser test confirms the Menu action opens it in a separate tab while Game and Table retain their exact routes and 46 px targets. Zero-overflow, keyboard focus, noindex, 39 local proof disclosures, and the reversible 500-particle motion pass. Targeted ESLint, `tsc --noEmit`, the Next.js production build, GitHub `web`, Vercel, and Vercel Preview Comments pass. Production remains unchanged pending Anthony's approval of PR #201.

## [ ] 4 - Make the owner portal installable and organize the optimization backlog

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly approved publication of the completed sales-system branch and directed Codex to organize and optimize the operation, including finding a way to make the customer portal an app, on 2026-07-18.
**Branch base:** `codex/owner-portal-app-20260718`, created from `origin/main` at `422352b`.
**Scope:** Add tenant-scoped install metadata and generated app icons for `/owner/[id]`; preserve the existing route, authentication, billing, Zelle, menu, and tenant-isolation behavior; add a canonical company optimization register and owner-app runbook. No visual dashboard redesign, service worker, offline cache, native App Store package, database change, secret, access change, or production change.
**Why:** Owners should be able to install the existing portal from their browser and launch directly into their restaurant account without creating a second application or duplicating sensitive business logic.
**PASS:** Every owner route emits a tenant-stable manifest link; the manifest has a unique app id, owner start URL, owner scope, standalone display, and 192/512 icons; icon and manifest routes work without credentials; authenticated pages and billing data are never cached for offline use; targeted lint, type/build, manifest assertions, and mobile browser checks pass; the optimization register has owner, KPI, evidence, priority, and approval gate fields.
**STOP:** Stop before push, PR, merge, deploy, production access, App Store submission, service-worker caching, secret entry, access change, customer communication, or payment action. Report any conflict before editing protected owner or billing behavior.

**Result:** Local commit prepared on `codex/owner-portal-app-20260718`. Manifest self-test, targeted ESLint, `tsc --noEmit`, and two production builds pass. Local production verification confirms tenant manifest linkage, four standard/maskable icon entries, 192/512 PNG output, 320/390 px no-overflow rendering, no browser error overlay, owner `Cache-Control: private, no-cache, no-store`, and public-only caching for manifest/icons. No service worker, database, access, billing, push, PR, merge, deploy, or production change was made.
