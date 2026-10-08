# Discover reciprocal messaging - verified local revision

Anthony approved clearer reciprocal value on Discovery while keeping the travel/passport theme. Fresh branch `codex/discover-reciprocal-messaging-20261008` from origin/main `8027217e2b979fc00f05ca29ee488b2ad7c13a33`. No push, PR, merge or deployment authorized for this revision.

## Result

- Creators: enjoy a perk and collaborate through an honest disclosed social post. The creator link reaches the actual sample collection and moves keyboard focus there.
- Businesses: provide a freebie/discount in exchange for social content introducing their brand, with no guaranteed reach/results. The business path opens a short campaign explanation and actual fictional campaign terms; no signup or booking implied.
- All five fictional offers show their perk, cost, required social story, 48-hour sample deadline and merchant-specific conspicuous disclosure before claim. Positive reviews are never required. Adult family content shows only materials/space, never children's identities or images.
- Claim requires acknowledging the sample terms; proof requires acknowledging honest disclosed sample content. Stale actions and double clicks cannot skip steps, award duplicate stamps or trigger the newly displayed passport navigation. Stamps explicitly mark completed demo experiences.
- Sapphire/navy paper, Impact/Geist, original illustrations, passport/stamps/trail/badge, map, categories, noindex, browser-only storage key/schema and reset preserved. No other client runtime changed; no dependencies, services, accounts, spending or collection added. No Google/Yelp reviews or real verification.

## Exact checks passed

From APP/web:

1. `node --import tsx scripts/discover-demo-selftest.ts` - prerequisite gates, stale/repeated action rejection, per-merchant post/disclosure/deadline, idempotent stamps, valid/corrupt saved state, city/hash normalization.
2. `node node_modules/eslint/bin/eslint.js src/app/discover/DiscoverDemo.tsx src/app/discover/data.ts scripts/discover-demo-selftest.ts` - final source, zero errors/warnings.
3. `node node_modules/next/dist/bin/next build --webpack` - final source, compile, TypeScript, all 47 static pages and build traces pass. Uses existing dependency junction; no installation/config change. Webpack supports this local junction.
4. `git diff --check` - pass.

Desktop browser: installed **Google Chrome 154.0.8037.92 on Windows, headed**, driven with the existing Playwright installation. Local built preview on 127.0.0.1:3032. Same-state before/after at 1440x1000 and 390x844; extra 320x740 bounds checks.

Workspace `verify-discover-messaging.mjs` and `verify-discover-messaging-phone.mjs` passed: two actual paths; all five pre-claim term sets; checkbox check/uncheck/reload gates; double clicks through claim/visit/proof/redemption remain one step; proof cannot skip acknowledgement; one stamp once; Back/Forward/deep-link/reload and focus; save/filter/empty/unlaunched destination flows; map/list/marker/attribution and live geographic OSM frame; 3-stop trail/badge; new and existing v1 saved place/destination/redeemed stamp persistence; reset/reload; skip/Enter/visible focus and reduced motion. No Discover runtime exceptions. Only expected inherited local Vercel analytics 404/MIME console messages.

Fresh web-design-guidelines source review completed for touched files. Native labeled controls, visible summary/button focus, heading anchor focus/clearance, readable wrapping and no overflow passed. Paired discovery and offer screenshots visually inspected; travel treatment retained.

## Saved screenshot evidence

All 12 Library creates succeeded, in capture order. Files may receive suffixes in Library; IDs below are authoritative.

| Evidence | Library ID |
|---|---|
| Before discovery desktop | libfile_58c484062b588191aa1e11eeca784f9e |
| Before offer desktop | libfile_263b0b51ce688191aa98b54b30e62f4e |
| Before discovery phone | libfile_572e1d7571408191a98e6ac7364a2785 |
| Before offer phone | libfile_ec7a998308888191b3f300d72fe61802 |
| After offer desktop | libfile_0db062aef7b481919a1a049795a1747c |
| After discovery phone, no claims | libfile_2c1b6186c3788191be062406ddeb057d |
| After offer phone | libfile_bde7b3a1868881919eb7563764797916 |
| After discovery desktop | libfile_dd18ed735f788191a6c912f45eb01f55 |
| After passport phone | libfile_b9a3e50bedd081918a310e0baf9799b8 |
| Creator/business phone paths | libfile_30dd504eaadc8191a0c33ef59bd81eb0 |
| Required post/deadline/disclosure phone | libfile_b7989aa4eb7c81918787e3838f23b69a |
| Disclosed sample-proof phone | libfile_6b87fdf891b08191aa589191ceefafbb |

Local screenshots, full verification JSON and ordered Library receipts remain in the delegated workspace `screenshots/reciprocal-messaging`. The current prepared helper reported prepared uploads unavailable before any mutation; supported ordered direct creates succeeded. Local Windows metadata helper cannot apply extended attributes; exact identities/versions are retained in receipt JSON, without claiming attribute writeback.

## Handoff

Ready for publication review. No push/merge/deploy performed. Reconcile main and run exact-head CI when publication is authorized. Physical devices, Safari/Firefox, screen-reader audit and Lighthouse unrun. All owned build, preview and browser processes stopped; port 3032 closed. Other Node processes identified as MCP servers and left untouched.