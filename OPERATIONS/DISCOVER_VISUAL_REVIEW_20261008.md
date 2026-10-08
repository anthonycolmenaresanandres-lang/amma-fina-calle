# Discover visual-first revision - verified local preview

This supersedes the 574eafe messaging preview for publication review. Anthony requested minimal wording and stronger visual likeness. Continue `codex/discover-reciprocal-messaging-20261008`; only /discover and its local offer data/styles changed. No push, merge or deployment.

## Final result

- Original CSS/lucide travel seals connect **Perk -> honest disclosed Post -> completed demo Stamp**. Short creator/business paths retain both benefits and open real local demo content. Existing sapphire/navy paper, type, passport and category illustrations retained; no new dependency or generated bitmap.
- Remove browsing-card descriptions and repeated city text. Shorter labels and an icon-led term sheet replace explanatory prose. The smaller phone artwork gets the material terms into view sooner.
- Every fictional perk still shows cost, required honest social post, deadline, conspicuous merchant-specific disclosure, location/hours, cap and expiry **before** claim. No positive review required. Adult family content excludes child names/images. All acknowledgements, repeat-click protection, map/categories, storage and reset remain intact.

Visible whitespace-separated word counts at the same default desktop state, including navigation/demo labels:

| Screen | Prior | Final | Reduction |
|---|---:|---:|---:|
| Discovery | 386 | 280 | 27.5% |
| Exchange section | 57 | 34 | 40.4% |
| Sunday Thread offer | 334 | 249 | 25.4% |

## Verification passed

From APP/web:

- `node --import tsx scripts/discover-demo-selftest.ts` - meaningful prerequisite gates, stale/repeated actions, honest post/deadline/disclosure data, idempotent stamps and safe saved state/navigation.
- `node node_modules/eslint/bin/eslint.js src/app/discover/DiscoverDemo.tsx src/app/discover/data.ts scripts/discover-demo-selftest.ts` - final source, zero errors/warnings.
- `node node_modules/next/dist/bin/next build --webpack` - final-source production compile, TypeScript, 47 static pages and traces. Reused installed dependency junction, no install/config change.
- `git diff --check` - pass.

Desktop browser: **Google Chrome 154.0.8037.92 on Windows, headed**, using existing Playwright. Built localhost preview, 1440x1000 and 390x844, plus 320x740 layout checks. Workspace `verify-discover-visual.mjs` and `verify-discover-visual-phone.mjs` passed:

- Updated creator/business paths and semantic 3-step visual route; decorative icons hidden from assistive tech.
- All 5 complete fictional term sets before claim; acknowledgement check/uncheck/reload, proof gate, double clicks through each step, exactly one stamp per redemption.
- Back/Forward/deep-link/reload/focus, existing and new v1 saved places/destinations/stamps, trail/badge, reset/reload, filters/empty states/unlaunched city, map/list/marker/attribution/live geographic OSM frame.
- No overflow at desktop/390/320px, keyboard Enter/heading focus/3px summary outline, 44px creator and terms tap targets, reduced motion. Paired before/after desktop and phone screens visually inspected.
- New active text/seal color pairs exceed 4.5:1. Lowest tested text pair: muted on paper 5.86:1; blue action 7.86:1; seal pairs 6.86-8.96:1. Fresh web-design-guidelines review found no blocking issue in touched source.

No Discover runtime exceptions. Existing local Vercel analytics script produces expected localhost 404/MIME messages. Physical devices, Safari/Firefox, screen-reader audit and Lighthouse unrun; no production claim for this revision.

## Updated Library previews

All 10 creates succeeded. These IDs supersede the prior preview images:

| View | Library ID |
|---|---|
| Offer desktop | libfile_87663af97b288191be632e408e1591a5 |
| Discovery phone, no claims | libfile_2d01c1d47ac88191bfa6b2c986b90b16 |
| Offer phone | libfile_2443db47754c8191a91002502f5df3c4 |
| Discovery desktop | libfile_0787ca9382648191a2ee1e3317f39e08 |
| Passport phone | libfile_1c98404ce02c81918953d13c70b64820 |
| Hero phone | libfile_c1fb5addd72c8191bd1d9822e43ebdf0 |
| Exchange desktop detail | libfile_0efa1f5125208191bb743140c12abd75 |
| Exchange phone detail | libfile_28fcfecbd9d48191953468112c4fa458 |
| Complete pre-claim terms phone | libfile_7820be55715c8191a89d910c8b923a5d |
| Disclosed sample post phone | libfile_14b37b296f1481918259526969776156 |

Local captures, word-count baseline, verification JSON, contrast and ordered Library receipts: delegated workspace `screenshots/discover-visual`. Current prepared helper reported prepared uploads unavailable before mutation; ordered supported direct creates succeeded. Windows metadata helper cannot set local extended attributes; exact successful identities/versions remain in receipt JSON.

## Publication handoff

Ready for review with Anthony; this is the more visual revision. Other client runtime untouched. No new services, accounts, keys, installs, spending, signup or uploads in the product. All owned server/build/browser processes stopped, port 3032 closed; unrelated MCP servers left alone. Publication remains unauthorized for this new revision; reconcile main and gate exact-head CI when publication is requested.