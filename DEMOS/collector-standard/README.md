# Collector race standard (opt-in)

`rules.ts` exports a versioned three-round profile and the one capture-radius function. `engine.ts` is a deterministic, renderer-independent simulation. Olympia imports it; existing Pocket Cafe, Colattao, Bodega and Juice Rush do not. New skins may explicitly adopt this standard by supplying their own item catalogue, arena, growth stages and visual adapter.

Both actors move normally, collide with larger ingredients, claim from the same pool, grow through the supplied stages and earn only the points of uniquely collected ingredients. The rival reads current food/obstacle positions, routes around larger objects, has a slower speed and a 2.5-second head start for the player. It does not read player inputs, teleport, steal claimed food or receive bonus scores. Closest eligible actor claims food; an exact distance tie favors the player. No body collision or attacks. Pause freezes movement, sinking, scoring and clock. Win requires reaching the target AND strictly beating the rival at the deadline.

The original capture threshold (0.9 × collector radius), normalized movement, growth, scoring and 4.5/s sinking remain. A capture-radius arena margin prevents the visible rim crossing the counter edge. The simulation clamps external deltas to 0.1 seconds and substeps at 1/60 second. The source catalogue remains unchanged; rules are overrides, not edits to old clients.

Run `node DEMOS/olympia-sandwich/verify.mjs` from the repository root. This checks the immutable baseline/catalog/art plus race invariants, all-tier projected alpha-footprint containment and deterministic balance scenarios. Automated drivers demonstrate feasibility and competition, not a measured human win rate.

Version 1 settings: 45 seconds on each counter; targets 2,400 / 5,000 / 9,000; rival speed multipliers 0.62 / 0.68 / 0.74; target-decision intervals 0.65 / 0.50 / 0.40 seconds; player head start 2.5 seconds. Both start at the same safe point. The follow camera opens near the player and smoothly pulls back with growth; capture threshold and artwork rim share one function.
