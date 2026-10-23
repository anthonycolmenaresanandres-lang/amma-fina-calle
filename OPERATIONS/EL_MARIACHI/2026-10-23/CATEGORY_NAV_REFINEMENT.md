# El Mariachi category placement and colors — local revision

## Screenshot-grounded scope
Both supplied screenshots were materialized from Library and viewed before implementation: `libfile_823f52032a748191803cf9ceb385fa5b` (`41768.png`) and `libfile_526d2ce330248191a151871cc18f9557` (`41769.png`). The first clearly shows the decorative green Tacos/Fajitas/Birria strip between the hero and menu. The second shows counts beside category names, the overall 260-dish total and the accordion count. Screenshots remain private reference artifacts outside the repository.

User requested removal of the green portion, category navigation at the top without item counts, and Mexican-flag colors. The resulting category bar is the first content in the menu section, immediately after the unchanged hero and before the menu heading, Jacksonville details and search. This removes the identified strip rather than removing green from the approved artwork or all controls.

## Implementation
- Remove the decorative food-name band and its unused responsive CSS.
- Move the existing horizontal category navigation to the start of the menu and tighten its preceding spacing.
- Give buttons stable green/white/red tones derived from original category order, so filtering does not recolor a category. Palette: green `#006847`, white `#ffffff`, red `#ce1126`; dark text `#244536`, white-button border `#657b70`. Preserve existing display/body typography and all other brand tokens.
- Remove visible counts from category chips, accordion headings and the total/results row. Search counts remain only in the screen-reader live announcement.
- Preserve native buttons, expanded/pressed state, panel associations, keyboard activation, category focus/scroll, single-open accordions, URL state and search. Selected categories retain their flag color and add an underline plus inset stroke; selection is not communicated by color alone.
- Keep the category area present for empty search results and use 48px button targets. Extend menu-only scroll offsets to location links, hours and search now that the sticky category row precedes them.

Only application files changed: `APP/web/src/app/el-mariachi/MenuExperience.tsx` and `menu.module.css`. Required queue/handoff and this record are the only other repository edits. No shared theme variables, game navigation/footer or other-client files changed.

## Verification and boundaries
Static color calculations: white on green 6.84:1; dark text on white 10.61:1; white on red 5.63:1; white-button border on white 4.54:1. Independent source review found no material issue. Git blob comparisons confirm menu/location JSON, data adapter, phone tenant registry, all game source/style/page files, visual asset manifest and both approved images remain byte-identical to production base `cfb7ffad4e7e56c4eacf921708c8b038dbff4adc`. All 260 menu records and prices are preserved.

Required scoped ESLint (`eslint src/app/el-mariachi --max-warnings 0`): PASS, exit 0. Production build (`npm run build -- --webpack`): PASS, exit 0; Next 16.2.11 compilation, TypeScript, all 60 static pages and build traces completed, including both El Mariachi routes. Final diff hygiene is checked before the local commit.

User explicitly excludes post-change browser/gameplay/smoke checks and phone calls. No browser/server/preview was opened, no rendered after-image was captured and no functional/visual verification is claimed. Supplied screenshots are pre-change references only. No post-change test suite was added or run; static/build checks are permitted. Existing future CI safeguards remain unchanged.

Branch: `codex/el-mariachi-category-colors-20261023`, based on production `cfb7ffad4e7e56c4eacf921708c8b038dbff4adc`, using the retained El Mariachi worktree. Previous release/evidence branch is preserved. This revision is local only: no push, remote PR, preview, merge, deployment or phone action. Publication requires a new approval; the prior approval covered the preceding revision.
