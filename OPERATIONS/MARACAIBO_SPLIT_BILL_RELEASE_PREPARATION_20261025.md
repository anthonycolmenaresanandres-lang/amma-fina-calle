# Maracaibo split-bill DEMO release preparation

State: **VERIFIED LOCAL; PUBLICATION HELD**. Wait for explicit parent clearance for this Maracaibo release. The Seed-specific approval in main does not release this hold. No remote write was performed.

Branch: `codex/maracaibo-split-bill-release-20261025`

Worktree: `C:\dev\amma\worktrees\maracaibo-split-bill-release-20261025`

Latest base: `76a0547d2409e4a146a2a7a904a707e917a1c232` (Project Seed test-only PR363). Initial preparation/build base was `7a9d87f57f6099afc294f97aa45f1786ffb3a48e` (PR361). The intervening update changes only two Seed browser scripts and operational evidence; all application runtime/config/dependencies are identical. The completed build/browser checks therefore cover the final application source without repeating a heavy build for tests/docs alone.

## Reconciliation and narrow scope

- Original `bbd9a81586018e9d7cc77560cff9cc31bb884d3e` is absent from main; no stop or replacement instruction for this guest split-bill demo was found in current repository records. Personal Context was unavailable. This conclusion relies on the explicit delegated owner deployment request, current repository records, and the retained original task history.
- All eight carried runtime/test files are byte-equivalent to the original implementation after Git normalization. Original `cf5ec74fec4b62d8d2756cc6b7a95c6be1aa71a0` supplied the earlier QA history; this receipt supersedes its dated validation without importing stale coordination files.
- Preserve the existing `/table/maracaibo/1` menu, gameplay, art, standalone Street Football and all other clients. Only Pay / Split bill entry points and the existing fictional native-dialog preview are added. Source comparison confirms no menu data, game engine/public game bundle, route, owner-portal or other-client changes.
- Fictional $86.43 bill, 1-12 guests, integer-cent shares, selected-share/hypothetical remaining preview and reset. DEMO, sample and Nothing charged remain explicit. No card/customer data inputs, saved progress, real orders, charges, tips or paid-status inference.
- Toast handoff stays disabled: `OWNER_REVIEW_REQUIRED`, `OWNER_SETUP_REQUIRED`, empty table URLs. Exact host/table validation and separate owner verification gates remain unchanged. No guessed links, API, credentials, activation or new service. [Owner setup and official-source limits](MARACAIBO_SPLIT_BILL_SETUP_20261008.md).
- Current package scripts and CI suites are retained; only the demo selftest command/step is added. No dependency, lockfile or deployment configuration changes. Existing dependencies were reused through a local junction, with no install.
- Fresh sibling worktree only. Canonical dirty coordination/Bodega files and original demo branch remain untouched. Latest-main reconciliation had append-only queue/handoff conflicts; both tasks' records were retained.

## Refreshed checks

| Check | Result |
| --- | --- |
| Split selftest | PASS: 120 allocation cases, invalid inputs, rounding/remainder, selected share/reset/repeat and disabled/exact-table/HTTPS host gates |
| Existing Maracaibo regressions | PASS: football30 (40 rooms/160 simulated phones), controls19, sideline1008 roundtrips/16 variants, visit boundaries14, DB41, penalty ball13 |
| Focused lint | PASS: no warnings/errors in touched TS/TSX |
| Full application lint | PASS: zero errors, 111 inherited warnings in unchanged files, including generated Street Football/lead UI |
| Production build/types | PASS: Next16.2.11 Webpack, TypeScript, 60 generated pages and traces. One early attempt stopped to avoid a shared build; the completed run compiled in97s/types31.5s |
| Scope/source/whitespace | PASS: exact original runtime/test comparison, protected menu/game paths unchanged, diff check clean |
| Browser | PASS: installed Google Chrome155.0.8059.86, existing Playwright1.61.1, fresh isolated headless contexts at1440x1000,390x844,320x740; no user profile/data touched |
| Browser flows | PASS: entry/repeat/one dialog;1/12 bounds; selected$21.60 -> hypothetical$64.83 once; reset; native modal; Back/Forward/reload; Close/Escape focus and scroll restoration; menu content retained |
| Browser boundaries | PASS: no horizontal overflow, no card/data inputs or live anchors in demo, zero page errors or feature console errors, zero external/mutating requests |

The unchanged local Vercel Analytics script returns404 with MIME warnings (four known console messages per context after reload). These are retained in the raw evidence and reported separately, not described as a clean total console. The first harness run correctly surfaced them; classification was narrowed to this exact local script and the full smoke then passed. No analytics application change was made.

Private evidence: `C:\dev\amma\evidence\maracaibo-split-release-20261025\qa.json`, `browser-smoke.cjs`, and `split-1440.png`, `split-390.png`, `split-320.png`. Screenshots were visually inspected. These are local QA files, not uploaded user attachments. Existing Library capability failure was not retried for this preparation task.

## Held release gates and limits

No push, PR creation, remote CI, merge, deployment or production verification. Parent must explicitly release the Maracaibo hold, reconcile any newer main, then use normal exact-head CI/protected PR and production verification. Do not revive stopped owner portal or other pending features.

No real-device/multiplayer/payment or Toast merchant readiness certification. Physical touch/FPS and existing game-exit flow were not rerun; this refresh is limited to the changed demo. Actual owner/Toast eligibility, exact table URLs and enabled product remain unverified. Owned isolated browser contexts closed; loopback preview stopped and port3149 checked closed.
