# CASTLE TAKERS — design spine v0.1 (working title)

_Anthony's original game IP. Status: **Build-later** — design doc only, per portfolio priorities
(Newsroom + Fina Calle OS are the Bet-now items). This doc exists so the vision is resumable in
one sitting. 2026-06-10._

## Premise

You lead a legendary mercenary company of **twelve**. Kings don't hire you to fight wars —
they hire you for the one thing armies are worst at: **taking castles**. Every contract is a
fortress, a garrison that outnumbers you 50-to-1, and a payout. The campaign arc: contractor →
conqueror. One day the mercenary stops handing castles back to the kings who hired him.

## Pillars

1. **Twelve defeat a thousand — and you SEE it.** The power fantasy is real on screen (swarms,
   routs, a big "defeated" counter), but it is *earned* by preparation, never given.
2. **Hard, but fair.** Difficulty comes from systems (alarm, injuries, time, money), never from
   twitch skill. No reflex combat at all. When you die, you can name the decision that killed you.
3. **The castle in parts.** A castle is a node graph, not a 3D level. You take it piece by piece —
   or all at once, loudly, and probably die.
4. **Your roster is your toolkit.** Unit evolutions unlock siege routes. A Ghost IS the postern
   path; a Berserker IS the gatehouse path. Army building and tactics are the same decision.

## Core loop

Take a contract → scout the castle (intel quality = how much of the node graph is revealed) →
take it in parts (sneak) or in one push (berserk) → capture the keep → payout + reputation →
heal, recruit, evolve → harder contract.

## The castle: node graph + alarm meter

A castle is 6–12 zones (gatehouse, walls, postern, courtyard, barracks, armory, well, keep…),
each with a garrison count, a defense profile, and connections. One **castle-wide alarm meter
(0–100)** is the spine of the whole game:

- **Sneak actions** (slip a patrol, silent kill, open the postern, bar a door, burn the armory,
  poison the well) take or weaken a node with little/no alarm — but each has a failure chance,
  and a failed sneak **forces berserk mode on the spot**. Every quiet action is a push-your-luck bet.
- **Berserk mode** is an instant auto-resolve fight: warband strength + gear + a roll vs. garrison
  strength + node defense. Fast, certain, loud. Alarm spikes.
- **Alarm drives the castle.** Low: guards stay in their zones. Mid: patrols double, sneak odds
  worsen. Max: the barracks empties and everything converges on you — the "berserk and die" outcome.

One sentence: **sneaking spends time and risk to shrink the fight you eventually have to take.**

## How 12 defeats 1000 (the force math)

The garrison is 1000 on paper. You never fight 1000 — unless you let it happen:

- **Dispersion.** The 1000 are split across nodes and shifts: 400 asleep in the barracks, 200 on
  the walls, 150 in the keep, patrols, gates. Each fight is local.
- **Engagement width.** Fights happen at chokepoints. A corridor lets ~5 defenders engage per
  round against your 12 elites; an open courtyard lets 50. Where you fight matters more than
  how many they are.
- **Sabotage multipliers.** Armory burned → garrison fights at half strength. Barracks door
  barred → 400 men never wake up for the battle. Well poisoned → morale drains every hour.
- **Morale and rout.** Most of the 1000 are levies. Kill their captains, breach their keep, and
  they *break* — the bulk of "defeated 1000" is hundreds routing on screen, which is also how a
  12-man victory stays believable.
- **The failure case.** Max alarm with no prep = the full garrison converges = you are twelve
  men in an open courtyard against a thousand. The game lets you do it. Once.

## Difficulty rules (the "not easy" contract with the player)

- Casualties are **permanent**; serious injuries persist between contracts and cost money to treat.
- Each siege is a run: no mid-siege saves.
- Contracts have **time limits** (the king's army arrives, or the harvest ends) and failure costs
  reputation → worse future contracts and pay.
- Money is tight: healing, recruiting, and gear all compete for the same payout.

## The warband: deeds and evolutions

Small, named roster (6–12 — Darkest Dungeon scale, never M&B troop stacks). Units earn XP from
**what they actually do**: quiet jobs accumulate shadow deeds, fights accumulate blood deeds. At
thresholds they **evolve** — a visible, ceremonial identity change (new art, new name, full-screen
reveal — the Pokémon moment):

- Recruit → **Brawler** → **Berserker** (breaks gatehouses; loud line)
- Recruit → **Footpad** → **Ghost** (opens posterns, silent kills; quiet line)
- Support line later (Quartermaster/Sawbones: sabotage + injury management).

Evolutions unlock **routes**, not just stats. Losing an evolved veteran in a botched sneak hurts
for three contracts — that is what gives the berserk button its weight.

## Contracts (V1 wrapper)

A king, a castle, an objective, a deadline, a payout. Objective variants: take the keep, capture
the lord alive (no berserk in the keep), open the gates for the king's army by dawn, burn the
granary and leave. Reputation gates which kings will hire you.

## MVP cut (V0 — one sitting to scope, one castle to prove the loop)

One castle, 6 nodes, alarm meter, the two verbs, auto-resolve combat, 3 classes with **one**
evolution each (no branching), one contract type, win/lose. Nothing else. If this isn't fun,
nothing downstream survives.

## Roadmap

- **V1** — contract chain, reputation, injuries/economy, branching evolutions, 3–4 castle layouts.
- **V2** — world map: traveling between kingdoms, trading, recruiting regionally; intel/scouting depth.
- **V3** — the heel turn: **keep a castle instead of handing it over.** Hold it against the kings
  who used to hire you. Conquest mode: the mercenary takes the world for himself.

## Comps to study (mechanics, not theme)

Invisible, Inc. (the alarm clock) · Battle Brothers / Final Fantasy Tactics (deed XP, auto-resolve,
named-roster attachment) · Darkest Dungeon (small roster, permanent consequences) · Slay the Spire
(node-map legibility) · FTL (pause-and-decide pacing).

## Tech notes

2D, Phaser 4, reuses the Penalty Shootout engine/input/skin architecture and the existing art
pipeline (ChatGPT generates → Claude keys/sizes/composites). Auto-resolve = math + tweens, no
physics, no pathfinding AI. The 12-vs-1000 spectacle is cheap sprite swarms + counters, not
simulation. Own IP — separate repo/area from Client OS; none of the client-game guardrails
(approved-logo, mascot rules) apply, but it must never share code paths with customer data.
