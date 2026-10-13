# Olympia open menu and original lettering — local review

Status: local-only revision, prepared for Anthony's review. No push, PR, merge or deployment is authorized for this revision.

Base: `a32c672` (main, includes PR #334 and PR #335).
Branch: `codex/olympia-original-lettering-20261013`.
Worktree: `C:\dev\amma\worktrees\olympia-visual-menu-20261012`.

## Result

- Removed menu/category/item/navigation/juice/game-teaser/footer rules and text underlines. Removed the dark header panel and green CNU block. Retained the exact CNU wording as ordinary text on the existing navy background.
- Kept the navy texture, official logos, six supplied photos, 39 current menu names/prices/descriptions, category and individual-item disclosures, functional keyboard focus outlines, links and both games.
- Added **Olympia Counter**, original vector display lettering authored directly as A–Z and period SVG path coordinates. Upright, chunky rounded capitals with uneven proportions and offset crossbars. No existing font outlines or Maracaibo assets were reused. This is a custom lettering system, not an installable font or a claim of worldwide uniqueness.
- Replaced the display titles: Selected menu, five category headings, Fresh energy, Juice Rush and Come by. Item names and utility/body copy remain ordinary text. Semantic headings/link text remain in the DOM; decorative SVG words are hidden from assistive technology. Words wrap in CSS and can shrink within a narrow heading column. No client-side font download or dependency added.

## Review artifacts

- `lettering-proof-320.png` / `.svg` — 320 × 946.
- `lettering-proof-390.png` / `.svg` — 390 × 919.
- Reproduce from `APP/web`: `node --import tsx scripts/olympia-lettering-proof.mjs`.

These are actual-size **lettering specimens**, rendered from the same glyph paths with Sharp, not browser screenshots or a reconstruction of the complete page. Conservative 206 px / 268 px category measures expose the longer words at phone sizes. Both images were visually inspected: title shapes, counters and wrapping are readable; the CNU line is unboxed. This does not verify browser layout, sticky navigation, focus or interactions.

Browser control and `agent-browser` were unavailable in this session. The user's computer browser was not used for a fresh visual check. Historical screenshots predate this lettering and must not be presented as current. Library saving was attempted through its supported prepared-upload helper; it reported `Library prepare_uploads is not available` before a write. No new Library attachment ID exists. The four local artifacts are the review deliverables.

## Checks

- PASS: focused ESLint on the four touched/new Olympia TS/TSX files and two scripts; final script lint has zero warnings.
- PASS: `node node_modules/typescript/bin/tsc --noEmit --incremental false` — zero diagnostics.
- PASS: `node --import tsx scripts/olympia-selftest.ts` — 39 unique source-matched items, delivery prices, genuine groups, standard game.
- PASS: local `scripts/olympia-http-selftest.mjs` — menu/Juice Rush HTTP 200; noindex/nofollow; 39 exact source names/prices/descriptions; 39 native item disclosures; five category disclosures/defaults; accessible real title text and decorative SVG semantics; six photos/all 12 variants; unchanged logos/art assets; source wording/arrows/template claims absent.
- PASS: final menu request after the CSS hover cleanup recompiled and returned 200; Sandwich Counter `/demo/olympia-sandwich/index.html` also returned 200.
- PASS: preservation diff against base for menu data, supplied photos, both games, shared venue components and dependencies — no changes.
- PASS: source accessibility/style audit against repository web-design guidance and https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md. Native controls, real heading text, visible keyboard focus, reduced-motion support, image dimensions, scroll margins and flexible word sizing remain. This is a source audit, not a browser accessibility result.
- PASS: `node node_modules/next/dist/bin/next build --webpack` — production compilation, TypeScript, all 51 static pages and traces completed with exit 0; `/olympia` and `/olympia/play` prerendered successfully. Run once after stopping the preview.
- BLOCKED: fresh mobile/desktop browser rendering, before/after captures, keyboard/disclosure/navigation flows. No repeated game loop was run for this presentation-only revision; game source and assets are unchanged from PR #335.

The one owned Next preview used `http://127.0.0.1:3121/olympia` and was stopped after HTTP checks; port 3121 has zero listeners. No parallel servers or long playtesting loops were started. For review, start `node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 3121` from `APP/web`, visit `/olympia`, then stop the process.

## Remaining review

Anthony can approve or adjust the original title lettering from the specimens. A real 320/390 px and desktop browser check, including menu open/close, anchor links, focus and game-return navigation, remains necessary before publication. Olympia owner approval of the prospect and current content remains outstanding; third-party delivery prices have not been relabeled as verified in-store prices. No new business claims, hours, offers, testimonials or images were introduced.