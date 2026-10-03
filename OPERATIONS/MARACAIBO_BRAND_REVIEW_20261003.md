# Maracaibo brand correction — local review, October 3, 2026

Anthony requested a less generic visual identity using the actual restaurant logo and three supplied Instagram references. This is a bounded, local-only revision of the already-published Maracaibo demo. Previous PR298 publication approval does not apply. Base: `40132ecf1536b8a4ce4b40301fd989fe5648d267`; branch: `codex/maracaibo-brand-iteration-20261003`.

## Reference and design decisions

All three source images were materialized into this Windows environment and inspected before choosing colors. The logo is the supplied black/white circular badge with its original angular monogram, concentric rings, two stars and curved Kitchen & Cocktails lettering. It was not redrawn or generated.

The shipped logo is a lossless 626×626 PNG extraction at x=160, y=712 from the 945×2048 source. Its decoded pixel buffer equals the same source region exactly. No resizing, retouching or content invention was applied. CSS displays the badge at 68–96px with its aspect ratio preserved. Instagram interface and portraits are outside the exported region. Original screenshots remain only in local `.review/references/`, excluded from the commit.

Proposed reference-derived palette: near-black `#101112`, charcoal `#202124`, off-white `#F5F5F1`, cork `#BD8A53`, orange `#F59B20`, citrus `#E8D43B`, leaf `#6DAB36`. These are design proposals, not an official brand-standard claim. Black/white dominate; cork circles reference the coaster, orange/citrus mark controls, and leaf identifies the second football side. The approved flag appears only as a small landing accent. The cocktail reel is visibly labeled AI content and was used only for atmosphere; no product photos, people, app chrome or award claims were reused.

## Changed paths

- `APP/web/src/table-os/maracaibo/MaracaiboExperience.tsx`: exact logo plus legible adjacent name, white Stay. with citrus punctuation, plate/bell/receipt/football action icons, fewer flag repetitions.
- `APP/web/src/table-os/maracaibo/MaracaiboMarks.tsx`: supplied-logo component and functional object icons.
- `APP/web/src/table-os/maracaibo/MaracaiboMatchView.tsx`: original badge on results and restrained lobby decoration.
- `APP/web/src/table-os/maracaibo/maracaibo.module.css`: black/white treatment, coaster-style markers, neutral check state and revised accents across all views.
- `APP/web/src/table-os/venue-config.ts`: only Maracaibo skin/team colors, keeping existing Lago/Rayo text and wave/lightning identifiers.
- `APP/web/public/assets/maracaibo/maracaibo-kitchen-cocktails-logo.png`: 187,288-byte exact source-region asset.

EAT. PLAY. Stay., the four-action order and existing layout architecture remain. Menu inventory/prices, Toast destination, service-preview behavior, game mechanics and transport are unchanged. No payment, staff messaging, credentials or server activation changed. Canonical dirty work and the previous Maracaibo worktree/source/evidence are preserved.

## Verification

- Scoped ESLint and TypeScript `--noEmit --incremental false`: passed.
- 30 responsive screens at 320, 360, 390, 430, 768 and 1180px: no horizontal overflow, decoded images, expected noindex, no runtime errors or attempted writes.
- 30 functional checks: keyboard focus, all menu anchors, repeated local requests, truthful Toast/check handoff, reduced motion, natural 90-second results, replay, canceled/confirmed exits and canvas cleanup all passed. Menu also passed a 200% root-text-size check.
- Touch input and primitive game with unavailable artwork: passed without runtime errors or attempted writes.
- Las Palmas table, Bodega demo, AJ Gators demo and Colattao case study: local read checks passed with no Maracaibo presentation/assets.
- Contrast samples: off-white/black 17.29:1, muted text/black 9.28:1, cork/black 6.23:1, black/orange 8.63:1, leaf/black 6.78:1. This is not a full assistive-technology certification.
- Production build: passed (`next build`, including TypeScript and all 44 static pages). The local build temporarily used the documented Turbopack root shared by the worktree and existing linked dependencies; original `next.config.ts` was restored byte-for-byte. No configuration change belongs to the deliverable.

The disk filled during an offline dependency restore. Only that incomplete new dependency folder and this task's disposable build caches were removed. Existing locked dependencies were reused; dependency manifests are unchanged. No unrelated code was repaired.

## Provenance

| Reference | Library identity | SHA-256 |
| --- | --- | --- |
| 1000393805.jpg — logo | `libfile_5b528a316790819184035462aa0a55f3` | `524f1e492374689682290b87221c984c3455143f3d827f142f6865e56fd0f611` |
| 1000393806.jpg — profile | `libfile_ba597550a40c8191ab82bc5a2c02521b` | `7c1b15b48096caad2efb700e4c0b453a9108fcb6feded6b90e5b2d3a0f60e10e5` |
| 1000393807.jpg — atmosphere | `libfile_7e317eba71a081918b8b4e0f5cb34aa7` | `736335ff7d90905f7b3e4af4b6a4b73f6598900d208c80c9671c741453676be7` |

Exported PNG SHA-256: `213148e712faeac2328e4944fbba4cec5292b7a68ff49aa37fd103c61cad7188`.

Actual screenshots and browser JSON evidence are in `.review/`. Real-phone multiplayer, reconnect/privacy hardening and POS-backed table payments remain outside this revision and unverified. No push, PR, merge or deployment was performed.
