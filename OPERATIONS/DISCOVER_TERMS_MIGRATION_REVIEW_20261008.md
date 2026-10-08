# Discover legacy terms migration — 2026-10-08

Anthony explicitly approved fixing and publishing PR317's diagnosed legacy-terms gap ("Yes fix all please"). Base main 03461c97d281644c7926878e1465636fd465281e. Isolated branch codex/discover-terms-migration-20261008. Other client runtime, including Seed and Colattao, unchanged.

## Problem and repair

The unchanged v1 browser key retained old unfinished stages. A legacy proof stage could redeem without acknowledging the newly required social post/deadline/disclosure. Add CURRENT_TERMS_VERSION=1 to normalized/saved DemoState. Under the same storage key, absent/outdated versions restart only claimed/visited/proof claims; valid saved places, destinations and historical redeemed stamps are preserved. Current-version stages survive parsing/reload. Reject advancing an outdated unparsed state, while retaining existing fresh-claim terms, disclosed-proof, stale-action and duplicate-redemption gates.

Normalization happens on read; the next ordinary demo state update writes the current version. Repeated reads remain safe and idempotent. Unversioned unfinished progress, including progress begun on PR317, cannot prove which terms were accepted and restarts conservatively. Historical stamps remain historical demo stamps; no retrospective verification is claimed. Browser state is editable demo state, with no server verification, real merchant claim or financial effects.

## Verification

PASS final source: Discover state self-test, scoped ESLint, Webpack production build/TypeScript and all 47 static pages, diff and scope checks. A missing test type annotation was corrected before the final successful build. No dependency/configuration changes.

Regression coverage: all five merchants × three legacy stages × missing/outdated version (30 cases); migrated save/destination preservation, stale-button rejection, fresh terms requirement, migration idempotence, mixed historical/unfinished saves, historical duplicate protection, outdated unparsed-state rejection, current-version round trips at every stage, disclosed-proof gate after reload and current duplicate protection. Existing offer/navigation/state cases retained.

PASS headed installed Google Chrome 154.0.8037.92 in temporary isolated profiles: missing-version claimed/visited/proof at 1440×1000, outdated-version claimed/visited/proof at 390×844, missing-version proof at 320×844. Each case restarts safely, completes the terms → claim → visit → disclosed sample proof → redemption gates, reloads every stage, preserves a historical Bloom stamp, Sunday Thread bookmark and Richmond destination, and adds exactly one Tideline stamp. No page overflow or runtime exceptions. Local Vercel analytics emits inherited localhost-only 404/MIME messages. LIVE verification follows exact-head CI and deployment.

Visual files/components unchanged. Local migrated-offer and passport captures inspected; premium visual layout, full pre-claim terms and conspicuous fictional/browser-only boundaries retained. Repository frontend-design/web-design-guidelines reviewed; fresh guidelines fetched. No UI findings introduced by these state-only edits. Physical devices, other browsers and assistive-technology audits unrun.

Evidence in delegated workspace: screenshots/discover-migration-20261008/local/verification.json, paired migrated-offer/passport screenshots at desktop/390/320 widths, verify-discover-migration.mjs. Browser/preview sessions stopped before publication; no personal browser data accessed. Production release receipt will record PR/exact SHAs/READY deployment, live isolated tests and Library evidence.
