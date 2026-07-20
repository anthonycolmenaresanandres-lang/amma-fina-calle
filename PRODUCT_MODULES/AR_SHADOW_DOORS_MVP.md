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
