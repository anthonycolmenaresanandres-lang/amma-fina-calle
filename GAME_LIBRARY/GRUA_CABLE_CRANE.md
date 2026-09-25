# Grúa — cable-crane game package (R&D)

| Field | Value |
|---|---|
| Route | `/grua-lab` (internal: noindex, unlisted, linked only from the Command Center) |
| Code | `APP/web/src/grua/` (engine, recorder, scene, bot, tests) · page `APP/web/src/app/(internal)/grua-lab/` |
| Status | R&D build, draft PR. **Not public, no client skin, no data upload.** |
| Queue | `OPERATIONS/CODEX_QUEUE.md` item 65 · research: `RESEARCH_AND_DEVELOPMENT/cdpr/CDPR_STRINGMAN_BRIEF.md` |

## The game
The café is closed. The player flies a four-cable crane over the floor and clears 8 items in 60 seconds:
- Mugs, a plate and a milk pitcher go in the **dish tub**.
- Paper cups and napkins go in the **trash**.

Scoring: +10 per item in the correct bin (the pitcher gives +20), +5 for a steady grab (swing under 4 mm), 0 for the wrong bin or the floor, and +2 for each second left if the floor is cleared. Scores never go negative.

Controls:
- Touch or mouse: drag anywhere on the floor to fly (a floating joystick; the drag sets speed).
- Keyboard: arrow keys or WASD fly, Space or Enter grabs/drops, P or Escape pauses.
- Grab/Drop is one context button. Grabbing runs an automatic sequence: descend, close the fingers, climb back up. Sideways steering stays with the player throughout, capped at the robot's 0.12 m/s fine-positioning speed.

## Frozen engine (never edited per client)
`round.ts`, `physics.ts` and `profile.ts` are pure and deterministic: the same seed and inputs always give the same round. As with every package, skins may change the look, never the rules (`PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md`).

### Physics from Stringman (source @48123d3)
| Constant | Value | Source |
|---|---|---|
| Room / eyelets | 4 m square, eyelets at (±2, ±2, 1.97) | `simulator/stringman_arp_carbon270.xml` |
| Pole offset / swing length | 0.4457 m / 0.3089 m (period 1.115 s) | `common/definitions.py` (carbon270) |
| Suspended mass | 1.075 kg | simulator README estimates |
| Speed / acceleration | 0.4 m/s / 0.15 m/s² | `host/observer.py` seek() |
| Fine-positioning speed | 0.12 m/s | `observer.py` NUDGE_SPEED_MPS |
| Line safety limit | 16 N | `observer.py` DEFAULT_MAX_SAFE_TENSION |
| Overload response | cancel the move, gantry sags for up to 1 s | `observer.py` passive_safety() |
| Finger scale | −90 open … +90 closed; positive speed closes | `robot/gripper_arp_server.py` (inferred; verify on hardware) |

### Game-side choices (ours, recorded in every export)
- Time scale 3× (robot seconds per screen second).
- Travel height 0.8 m; grab height 0.52 m. Vertical speed 0.25 m/s. Fingers move at 240°/s on the robot's scale.
- Swing damping ratio 0.02 (the robot's active swing cancellation is left off).
- Sag speed 0.1 m/s.
- Item masses and bin positions were chosen from a tension map so the 0.7 kg pitcher strains only near walls or corners and can always be delivered.

### Line tension
Static tension uses the minimum-norm split. If that split asks a line to push, the model drops that line and keeps the best feasible three-line split. A move that would raise the peak over 16 N is refused. If the climb is what overloads the lines, the sideways part of the move still goes ahead; otherwise the gantry sags. A test proves the heaviest load can be held everywhere at grab height, so the robot can never get stuck.

## Training data (opt-in)
- The consent checkbox is **off by default**.
- When it's on, the round is recorded at 30 fps of robot time and stays on the device. The player can download it after the round. Nothing is uploaded.
- Format `fina-calle.grua.teleop/v1`:
  - Actions follow Stringman's `dual_vel_contact` order exactly.
  - State uses Stringman's observation names where the game can fill them truthfully, plus `sim_*` extras (swing, payload, line lengths, strain, floor contact).
  - Features the game cannot measure (camera images, finger pressure, …) are listed as missing, not faked.
- Episodes end at each drop and are labelled in hindsight ("Put the mug in the dish tub"). `contact_vec` points to the grasp point, then to the release point. `episode_end` is 1 for the final 0.5 s, as the Stringman author proposes.
- The file holds no name, account, photo, location, device ID or IP.

## Verification (2026-09-25)
- **Engine tests:** 14/14 (`npm run grua:test`, also in CI). They cover kinematics, tension against Stringman's own simulator numbers, no-deadlock over the whole floor, pendulum period, speed and acceleration limits, grab hits and misses, scoring, strain and sag with delivery, determinism, completability on 60 seeds, and the recording schema.
- **Completability:** the scripted pilot clears 200/200 seeds, finishing in 115–161 of 180 robot seconds (median 134).
- **Replay in Stringman's MuJoCo model** (`tools/grua/replay_in_stringman_sim.py`; thresholds fixed before the first run). Three bot runs, about 11,500 frames:
  - Tracking RMS 4.5–4.7 mm, 95th percentile ≤ 6.7 mm: **PASS**.
  - Tension criterion (median gap ≤ 25%): **FAIL**, at 51–56%. Diagnosis:
    - The frames it sampled were mostly grab bottoms, where the gripper rests on the floor in MuJoCo (74–76% gap there).
    - Cruising, stopped: 5–6%. Moving: 9–11%.
    - At 10 settled static poses, the game and MuJoCo agree within 1% on peak tension.
    - Stringman's own safety trigger (moving average over 16 N) would have fired **0** times.
    - Response: frames at the floor are flagged `sim_floor_contact`. The threshold was not changed.
  - A browser-downloaded run (mostly idle) passes all criteria. That shows the UI→file→simulator pipeline works.
- **Browser, production build:** 28/28 checks at 390 and 1440 px, plus reduced motion. Covered: consent off by default, no download without consent, a valid export with consent, no identifiers, keyboard and drag flight, grab down and up, pause freezing the clock, the round ending, controls above the fold, no horizontal overflow, and no console errors (the local-only Vercel Analytics 404 is excluded).
- **Checks:** ESLint and TypeScript clean; Next production build clean; web-interface-guidelines audit applied. Button labels stay in sentence case (house style) rather than the guideline's Title Case.

Screenshots from the final production-build run: `GAME_LIBRARY/grua-evidence/` (390 px landing and play; 1440 px play and results).

## Open items
1. Anthony: consent wording, storage, minors policy, then an upload endpoint (queue follow-up; gated).
2. LeRobot dataset converter (needs `lerobot`; not built).
3. Render MuJoCo camera views along player paths for vision training (not built).
4. Human playtest on phones to tune difficulty (bot data only so far).
5. Client skins (approved logos only; primitive fallback kept).
