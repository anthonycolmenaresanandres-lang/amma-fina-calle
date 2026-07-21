# Shadow Doors — room-scale AR MVP (phone-first)

> Working title. A 3-minute survival scare played in YOUR room: shadows emerge from YOUR
> real doorways. Unity 6000.3.x + AR Foundation (ARCore), Android-first (Anthony's phone).
> The whitelabel multi-sport project is PARKED; this is a separate Unity project at
> `products/shadow-doors/` in this repo. Design law: fastest path to a demo that scares
> one person in one real room. Everything cuttable is cut.

## Why these choices (speed ranking)

| Choice | Why fastest |
|---|---|
| Phone ARCore, not headset | The device exists today; Quest 1 cannot do MR |
| Manual door-tagging ritual | Works on EVERY phone (no LiDAR/RoomPlan); doubles as dread-building setup |
| Shadow creature | Flat billboard silhouette + eyes shader — zero rigging/animation |
| Flashlight banish | Phone IS a flashlight metaphor — aim reticle + hold; no new input concepts |
| JSON scenario director | Same pattern as the DC game's SkyWarDirector + whitelabel's client.json |
| Procedural audio | Reuse the DC pipeline's stdlib WAV generator style (whispers/heartbeat/stinger) |

## Core loop (MVP, nothing more)

1. **Setup ritual (~60 s, in-app, dark room encouraged):** scan floor until planes lock →
   tap the **FLOOR at each doorway threshold** to place a **door anchor** (min 1, max 4;
   door-height gizmo snaps vertical as the visual beacon). Floor-anchor ruling (Anthony,
   2026-07-20, from the first device playtest): vertical door surfaces are unreliable to
   tag on-device; floor planes lock instantly and precisely, so the engine knows exactly
   where every door is the moment it's tapped → tap floor to set the player's
   "safe center" → START.
2. **Survival (3:00):** the JSON scenario schedules events per door:
   `whisper` (spatial audio AT the door, nothing visible — the dread beat) →
   `emerge` (a darkness stain spreads on the floor at the threshold; the shadow RISES
   up through it) → shadow glides toward the player
   (camera position) at configured speed → **banish**: center the aim reticle on it and
   hold ~1.2 s (a light-cone shader + rising tone); shadow burns off with a stinger →
   escalation: shorter gaps, simultaneous doors, feints (whisper at door A, emerge at B).
3. **Fail:** a shadow reaches within 0.5 m — screen darkens, heartbeat peaks, "IT FOUND
   YOU" card + survival time. **Win:** the 3:00 clock expires — dawn tint + "DAWN" card.
   R-restart from the same door setup (no re-scan).

## Architecture (mirrors our proven patterns)

- `ScenarioDirector` — loads `scenario.json` (schema below), fires timed events; the DC
  SkyWarDirector pattern: timers, no per-frame logic beyond movement.
- `DoorPortalManager` — setup ritual + persisted anchors (ARAnchor per door).
- `ShadowAgent` — billboard toward camera, glide + slight sine drift, three states
  (Emerging/Hunting/Banishing); soft-edge silhouette shader with eye glow, dissolve-on-banish.
- `BanishSystem` — screen-center raycast dwell + progress ring UI + light-cone visual.
- `GameLoop` — countdown, fail-distance check, win/lose cards, restart.
- `AudioKit` — pre-generated WAVs (whisper loop, heartbeat with intensity param, emerge
  hiss, banish stinger, dawn chord) played through spatialized AudioSources at anchors.
- **Scenario JSON schema:** `{ "duration": 180, "events": [ { "t": 12, "door": 0,
  "action": "whisper" }, { "t": 20, "door": 0, "action": "emerge", "speed": 0.35 }, ... ] }`
  — door index resolves to tag order; `speed` in m/s; feints are whisper-only events.
  MVP ships ONE handcrafted scenario ramping 1→3 concurrent shadows.

## The breach portal (floor stain — placement-agnostic by design)

Ruling on "what about the actual door" (Anthony, 2026-07-20, revised same day after the
first device playtest): we never try to FIT the real door — and we never depend on the
vertical surface at all. Each emerge is preceded by a **breach** — an amorphous pool of
darkness (`DarknessPortal.shader` + `DarknessPortal.cs`) that spreads FLAT ON THE FLOOR
at the tagged threshold over 0.8 s, holds while the shadow rises up through it, then
drains away. Because its edges are procedural noise-eaten smoke, it has no "correct"
size or shape: a stain of darkness on the floor reads right at a narrow door, a double
door, an archway, or a window. Placement uses only the floor anchor point (+1 cm lift
against z-fighting) — zero dependency on detected door geometry, which ARCore can't
reliably give us anyway.

**Windows:** ARCore on phones cannot semantically identify doors or windows (plane
detection gives walls, not openings) — which is why tagging is manual. A window IS
taggable today: tap it in TagDoors and it joins the rotation; the breach stain and
shadows work over it unchanged. A distinct "window" tag type (smaller portal, sill-leak
animation) is backlog, not MVP.

## Device-playtest rulings (Anthony, first on-device session, 2026-07-20)

1. **Floor cracks, not a raw stain:** the breach opens in two phases — thin
   ember-glowing cracks split outward first, then darkness pools out of them
   (`DarknessPortal.shader` two-phase timeline; unconditional border falloff so the
   quad shape can never show again).
2. **Seem watched:** whisper beats became WATCHED beats — a distant muffled bell toll
   at the door plus an eyes-only apparition (`WatcherEyes`) at a random offset low to
   the floor near the threshold. Appears, stares ~2 s, vanishes. No gameplay threat.
3. **Evil filter, not lighting:** a fullscreen screen-space veil (`EvilVeil`,
   blood-red vignette) ramps in fast while any shadow is out and drains slowly when
   the room is clear — same doctrine as Escape the Bomb's screen-flash lightMode.
4. **Bells, not chant:** ambient is now Undertaker-style funeral tolls
   (`bells_loop.wav`, deep G2 every 8 s, tails ringing across the loop point);
   whisper cue is `bell_far.wav` (distant muffled D2). Voices stay demonic-only.
   The chant WAV stays in the repo, unused, in case it returns as a scenario variant.
5. **Guided player instructions (2026-07-21):** the setup ritual leads a first-time
   player by the hand — Intro card (what this is, how to survive) → "STEP 1 OF 3:
   point at the FLOOR" → "STEP 2 OF 3: tap the floor at each doorway" → "STEP 3 OF 3:
   tap the floor at your feet" → ArmedReady ("lights LOW, sound UP — tap OK to
   begin"): the night only starts on the player's final OK. One plain imperative
   instruction per screen; OK button visible from launch.
6. **Suspense progression + fluid motion + the arm (2026-07-21):** the night itself
   escalates — bells swell 0.30→0.55, the evil veil gains a creeping floor (0→0.25:
   late-night never feels fully safe), and shadows spawn up to 1.3× faster near dawn.
   Shadow motion is fluid: Perlin speed breathing, true lateral+vertical weave,
   slerped turning, eased surfacing. And twice a night (45% and 85%), a code-built
   bone-white **skeleton arm** reaches into frame from behind the player's right
   shoulder, trembles, and withdraws (`SkeletonArm` — camera-space, zero art assets,
   primitive-cube bones + `BoneUnlit.shader`).

7. **The hook — false safety, then we move in (2026-07-21):** fear needs contrast, so
   safety is scripted. (a) **The Quiet Minute:** nothing happens for the first 35 s —
   long enough to genuinely relax — and the first emerge waits until t=48 at the
   night's slowest speed. (b) **The False Dawn:** a `lull` scenario action (t=100,
   16 s) fades the bells and the veil floor to near-nothing (GameLoop's calm
   multiplier, CalmFloor 0.15 over 2.5 s) — it reads as "it's over." The next emerge
   BREAKS the lull instantly: a two-door slam at t=119/121 with everything surging
   back at once. (c) The heartbeat now decays to calm when the room is empty (it used
   to freeze at its last intensity), so the lull reads on every channel. `lull`
   events carry their duration in the `speed` field — JSON schema unchanged.

8. **The Offering — the hook, final form (2026-07-21):** the ruling in (7) evolved:
   the opening isn't waiting, it's *playing*. After setup, five glowing coins appear
   on the floor near the thresholds and a frightened HUMAN whisper begs the player
   not to take them ("please... don't" → "put them back" → silence). The player,
   being a player, takes them — and the last coin answers in the entity's own voice:
   "IT KNOWS WHAT YOU TOOK." Beat. The night begins. The transgression is the hook:
   the haunting is the player's fault, and the scenario's quiet first 35 s now reads
   as "maybe I got away with it" (they did not). Refusal path: after 45 s untouched,
   the coins sink back into the floor ("your refusal is an answer") and the night
   begins anyway — the game never wedges on an obedient player. Restarts skip the
   Offering: you don't get to un-take them. (`CoinOffering` + `OfferingCoin` +
   `OfferingCoin.shader`; voices via espeak +whisper, un-demonized on purpose —
   someone tried to warn you.)
9. **No safe choice — refusal is punished too (2026-07-21):** leaving the coins is
   NOT the escape hatch. Taking them is theft; refusing them is *defiance*, and the
   entity punishes defiance harder. On refusal (`CoinOffering.WasRefused`) the entity
   answers in its own voice — "YOU CANNOT REFUSE ME." — and GameLoop marks the night
   `_angered`: (a) the skeleton arm lashes out the INSTANT the night starts (no Quiet
   Minute grace — greed earns the slow dread build, defiance earns an immediate slap),
   and (b) every shadow spawns 1.25× faster all night (stacks with the late-night
   ramp). Anger persists across restarts (you don't get to un-defy it); a fresh setup
   clears it and re-runs the Offering.

## Explicitly cut from MVP (backlog)

Zombies/goat packs (theme system later — whitelabel-style content packs) · occlusion via
Depth API (add if the test phone supports it, else skip) · persistence between sessions ·
multiplayer · iOS · store polish. NO real faces, NO gore (silhouettes only).

## Build/verify ladder (the whitelabel discipline, new project)

L0 batchmode compile → L1 EditMode tests (director schedule math, banish dwell logic,
fail-distance) → L2 PlayMode test with a mocked AR rig (portals at fixed transforms —
the whole game loop must run WITHOUT a device in the editor: `MockAERig` substitutes
camera + anchors) → L3 Android build → L4 on-device smoke (adb install + logcat markers:
SETUP_COMPLETE, FIRST_EMERGE, BANISH_OK, RUN_END). Codex executes on the Unity machine
(Unity 6000.3.19f1 already installed there).

## Acceptance (MVP done =)

One blind person, in one ordinary room at dusk, completes setup unaided in <2 min, gets
visibly startled at least once, and finishes a full 3:00 run without crash at ≥30 fps on
Anthony's phone. That's it — that's the demo that sells the concept (and feeds the AR
section of the grant applications).
