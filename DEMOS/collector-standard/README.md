# Collector race standard v2

Only Olympia imports this opt-in standard. Other clients keep their current behavior.

`rules.ts` supplies45-second maximum rounds with targets3,000 /6,000 /10,000, rival counts1 /2 /3, speed multipliers0.62 /0.68 /0.74 and decision intervals0.65 /0.50 /0.40 seconds. Player movement head start2.5 seconds; all actor captures disabled for4 seconds. Later rivals stagger their first decisions by0.15 seconds to spread CPU work.

Capture requires radius at least1.30 times the victim's radius AND full containment of the victim's visible0.9-radius collection circle for0.20 continuous seconds. Mere overlap or equal size is safe. The exact same rule applies player-to-rival, rival-to-player and rival-to-rival. Captures transfer100% of the victim's earned current score and mass, then zero the victim and remove it. No arbitrary bonus; total points remain bounded by collected food. Pending food retains progress and transfers to the survivor. Player capture ends immediately, with pre-capture score shown in the loss result.

The engine records one immutable result. Finish priority is player consumed, then no uncollected food AND no queued spawn batches, then timeout. In-flight ingredients remain uncollected until their drop completes and points are credited. Cosmetic crumbs do not delay results. Living rivals do not prevent a cleared counter from ending. Olympia's current levels place all food at start; the reusable engine also correctly handles queued future spawns. Pausing freezes movement, contact holds, drops and clock. Slow frames count toward the45-second maximum without a heavy catch-up simulation.

Each rival has an independent brain and spawn. Open counter uses food gathering. Tray crossing emphasizes valuable food and opportunistic pursuit/retreat. Deli circuit pursues smaller collectors within10 world units and flees larger collectors within8, considering rival opponents as well as the player. No team targeting, player-input prediction, teleportation or injected points.

`raceLevels.ts` in Olympia supplies48/60/72-unit squares,168/248/349 spaced ingredients, a clear open counter, one central serving tray, and two islands with looped routes and valuable pockets. Original catalog, input and legacy level files remain frozen as references. The camera retains the prior pixel-per-world-unit sizing; food scale1.05 keeps it readable. Fixed-obstacle passages remain connected for the largest8.28-unit-wide visible collector.

Run `node DEMOS/olympia-sandwich/verify.mjs`. CI checks food/capture accounting, both capture directions and rival-vs-rival, threshold/hold/grace, pending drops/spawns, one result, pause/reset/timer, maximum-size connectivity/all-food reachability, spacing/count budgets, original source/art hashes and135 footprint cases. Automated scenarios are feasibility observations, not human playtest results.
