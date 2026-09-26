# Cable-driven parallel robots (CDPR) — Stringman research brief

_2026-09-25 · Claude (cloud) · queue 69 · trigger: Neufangled Instagram reel "Why CDPRs are the best robot for household work"_

## Bottom line

- The reel shows **Stringman**, built by Nathaniel Nifong and sold by **Neufangled Robotics**. It is a ceiling-mounted cable robot that picks laundry, toys and trash off the floor and drops them in bins. The software, firmware, board designs and simulator are open source under Apache-2.0 and actively developed (last commit 2026-09-23).
- Its hardest open problem is vision-based grasping, and the author's own notes say the limit is **lack of training data**. That is the gap Anthony wants player data to fill.
- What we built: **Grúa**, a game that runs Stringman's real physics and records each run in Stringman's own training format. Runs replay in Stringman's MuJoCo simulator with 4.5 mm tracking error. Game spec: `GAME_LIBRARY/GRUA_CABLE_CRANE.md`.
- What game data can and cannot train is spelled out in §5. In short, it helps with planning and control. It does not help camera-based grasping until someone renders camera views for it.

## 1. What a CDPR is

A cable-driven parallel robot moves a small platform (here, a gantry carrying a gripper) by winding and paying out several lines anchored around a workspace. Position comes from line lengths: each line's length is just the distance from its corner eyelet to the platform. The same principle flies Skycam and Spidercam over stadiums.

- **Strengths:** reaches a whole room, light, cheap motors, nothing on the floor.
- **Weaknesses:** lines can only pull, never push. Flat lines (a high gantry, or one near a wall) need much more tension to hold the same weight, so the reachable space shrinks under load. The lines also hang through the room while the robot works.

## 2. Stringman, from the source code

Source: github.com/nhnifong/cranebot3-firmware @48123d3 (`nf_robot` 6.9.1). PCBs: github.com/nhnifong/stringman-pcbs.

| Area | What the code says |
|---|---|
| Rig ("Arpeggio") | 2 powered anchors in opposite ceiling corners, 2 lines each: one direct, one routed through a passive eyelet post in another corner. The gripper hangs on a pole below the gantry. |
| Anchors | Raspberry Pi Zero 2 W, DaMiao motors on CAN, anchor camera (1920×1080 @ 15 fps). The earlier "Pilot" anchors used NEMA 17 steppers (press). |
| Gripper | Pi Zero 2 W. ST3215 servos for wrist and fingers. VL53L1X laser rangefinder, MPU6050 IMU, finger pressure sensor (ADS1015 ADC). Wide camera at 684×384 @ 54 fps. |
| Host brain | `stringman-headless` (observer.py) on a PC: ≥ 8 cores, 8 GB RAM, PyTorch acceleration (they suggest a Ryzen 7 7840HS mini PC). Finds components over Wi-Fi with zeroconf. |
| Control API | WebSocket on port 4245 carrying protobufs (`TelemetryBatchUpdate` out, `ControlBatchUpdate` in). Local browser UI (three.js "playroom") on port 8090. Optional remote relay at neufangled.com/playroom after binding the robot to a Google login. |
| Localization | Anchor cameras track an AprilTag card on the gantry (solvePnP), fused in a Kalman filter. Calibration uses printed cards on the floor. |
| Motion limits | Seek: 0.4 m/s, 0.15 m/s². Overall speed limit 0.35 or 0.45 m/s depending on firmware. Pendulum-based swing cancellation. |
| Safety | `passive_safety()`: if the moving average of any line's tension passes 16 N (default), cancel the move and switch the motors off for 1 s so the gantry sags. |
| AI | Hybrid. A handwritten pick-and-drop loop, plus models for subtasks: target finding on a merged floor view (DINOv2 backbone) and grasping by visual servoing or a LeRobot policy (DiT; VLA-JEPA; pi0.5/SmolVLA/X-VLA tried). Models are on Hugging Face under `naavox/`. |
| Training data | Teleoperation recorded as LeRobot datasets. Actions (`dual_vel_contact`): gantry velocity in the gripper and room frames, wrist and finger speeds, contact vector, episode end. |
| Simulator | MuJoCo 3.12 model of the Arpeggio rig. The real firmware servers run against it unchanged. |

### Press-reported, not verified here
Our container's network policy blocks neufangled.com, hackaday, heise, ui44 and gagadget, so these come from search summaries only:
- Work area up to 5 × 5 × 3 m, about 3 kg lift (depends on speed and height), about 0.4 m/s travel.
- Price: **$965 assembled**. Kit price is reported inconsistently: $655 in one summary, "about $1,000" in another. Check neufangled.com/store before any purchase decision.
- Reviewer caveats: flat objects are hard for the vision models, the lines descend into the room while it works, and setup is not plug-and-play.

### The author's open problems (`docs/notes_on_pick_and_place.md`)
1. Predicting whether a grasp succeeded (today: a finger-pressure edge plus a height check).
2. Judging "is the room clean" by comparing against a clean baseline image.
3. Better vision encoders; JEPA world models; pi0.5 fine-tuning bugs.
4. The target network was trained on raw overhead images but runs on merged floor images.
5. Quote: "it is only lack of data that prevents me from training an end to end model."

### Security and privacy notes (if we ever run one)
- The README publishes a default password for the Pi components. Change it and install SSH keys (`experiments/deploy_ssh_keys.py`) before connecting a robot to any shared network.
- The local control channel has no authentication. It binds to loopback by default; `--bind_address 0.0.0.0` lets **anyone on the network drive the robot and view its cameras**. Never do that on a café or guest Wi-Fi.
- The remote relay is optional and ties the robot to a Google login. The author states they do not store video.

## 3. Fit with each AMMA project

| Project | Verdict | Why |
|---|---|---|
| amma-fina-calle (Fina Calle OS, game library) | **Built: Grúa** | Game packages are a sellable capability. The crane mechanic suits cafés, and it runs on Stringman physics so it can produce training data. |
| colattao-cafe-rush | No change | Guardrail: the Colattao menu URL is printed on a QR code. A Colattao-branded Grúa would be a client skin in the game library and needs the client's approval. |
| fina-calle-landing | No change | Legacy landing that points to Fina Calle OS. |
| fina-calle-voice-gateway | No fit | Nothing a phone agent needs here. |
| whitelabel (Unity, parked) | Idea parked | A Spidercam-style broadcast camera rig is a real CDPR application for sports clients. The project is parked Tier 3 and Unity can't be compiled in this environment. |
| EscapeTheBomb-DC (UE5) | Idea parked | A cable-cam spectator camera would be a nice-to-have, but it is not the project's core bet (crowd simulation). |
| VBFH Media Engine (not in this session) | Idea parked, gated | A physical cable-cam over a court is the most literal CDPR use for sports media. It needs hardware spend, facility approval, and safety review (loads moving over players). |
| A physical Stringman for AMMA | Not now, gated | Wrong for an occupied café floor (loads moving overhead, lines in walkways). Possible after hours in a back room. Purchase, install and security hardening all need Anthony. |

## 4. Why a game can help train a cable robot

Stringman learns by imitation: people fly it by hand, and the recordings teach policies. Human demonstrations are the bottleneck. A game that is physically faithful to the robot turns play into demonstrations. That only works if the game uses the robot's own units, limits and action fields, so we built it that way and checked it against the robot's simulator:

- Every limit comes from Stringman's source: room geometry, pole length, speed, acceleration, the 16 N safety limit and the sag response.
- Recordings use Stringman's LeRobot field names and units at 30 fps of robot time, labelled with plain-language tasks after the fact ("Put the mug in the dish tub").
- Replaying game runs through Stringman's MuJoCo model reproduces the gantry path to within 4.5 mm RMS.

## 5. What player data can and cannot do

**Can:**
- Task-level decisions: which item next, where it goes, recovery after a miss.
- Tension-aware routing: heavy loads through the middle of the room.
- Approach and braking behaviour near targets.
- Success labels for training a grasp-success predictor (the author's open problem 1).
- Warm-starting policies in simulation, since runs replay in MuJoCo.

**Cannot, yet:**
- Vision-based grasping, which is Stringman's hardest problem. Our recordings have no camera images.
- A route exists: replay each run in MuJoCo and render the model's gripper and anchor cameras. That produces synthetic images with a known gap between simulation and reality. Not built.

**Also not modelled:**
- Floor contact at the bottom of a grab (frames are flagged `sim_floor_contact`).
- Line stretch and dynamic tension (a 9–11% gap while moving).
- Wrist rotation.

## 6. What needs Anthony

1. **Uploads.** Approve the consent wording and privacy-policy text, choose where data is stored, and set a policy for minors. Café games may be played by children, so get a legal review before any upload.
2. **Public release.** The route is noindex and unlisted. Going public, or adding a client skin, needs approval (and the client's, for a skin).
3. **Sharing data.** Publishing a dataset to Hugging Face, or sending it to Neufangled, is an external send.
4. **Hardware.** Any Stringman or cable-cam purchase.

## Sources
- Stringman source: https://github.com/nhnifong/cranebot3-firmware (read in full where cited) · PCBs: https://github.com/nhnifong/stringman-pcbs
- Product and docs (blocked here; titles seen via search): https://neufangled.com/ · https://neufangled.com/docs/ · https://neufangled.com/store
- Coverage (search summaries only): https://hackaday.io/project/205264-stringman · https://hackaday.com/2026/06/15/building-a-ceiling-based-crane-robot-to-keep-a-room-clean/ · https://www.heise.de/en/news/Stringman-Permanently-installed-open-source-robot-tidies-individual-rooms-11335167.html · https://gagadget.com/en/724432-stringman-is-a-ceiling-mounted-robot-that-picks-up-your-clutter-and-its-on-sale-now/ · https://ui44.com/blog/ceiling-mounted-home-robots-stringman-clutter · https://www.eweek.com/news/ceiling-mounted-diy-robot-picks-up-toys-clothes/
- CDPR background: https://en.wikipedia.org/wiki/Cable_robots · https://en.wikipedia.org/wiki/Skycam · CDPR 2026 conference proceedings: https://link.springer.com/book/10.1007/978-3-031-94608-0
