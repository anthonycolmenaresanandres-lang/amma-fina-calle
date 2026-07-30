# Grant Application Package — Development PC for AMMA Ventures / Fina Calle

> DRAFT for Anthony to adapt and submit. Paste-ready sections for a Unity-ecosystem grant
> (e.g. Unity for Humanity / community hardware grants) or any small-business / creator
> grant. Everything below is TRUE and evidenced from our own build logs — no inflation.
> Anthony submits; nothing here is sent anywhere automatically.

---

## 1. One-paragraph summary (the elevator)

AMMA Ventures (Virginia Beach, VA) is a solo-founder studio building safety-focused
interactive software: a **Unity white-label multi-sport platform** serving local sports
facilities, an in-development **room-scale AR safety/entertainment experience** (Unity), and
a disaster-preparedness evacuation game grounded in FEMA/CDC public guidance with a
reusable **crowd-evacuation simulation** used for public-safety education. Our development
is fully AI-assisted and rigorously automated — but it is currently blocked by hardware:
neither of our two machines can run a modern real-time engine at development scale. We are
requesting funding for **one development PC (~$1,900)** — the single constraint between our
shipped pipeline and our next releases.

## 2. The need — measured, not estimated

| Machine | Reality (from our build logs) |
|---|---|
| Primary dev laptop | 2016-class ultrabook: Intel i7-7600U (2 cores), Intel HD 620 iGPU, 16 GB RAM. Renders our crowd scene at **~217 ms/frame (≈4.6 fps)** at 1,000 agents; GPU screenshot capture non-functional (black frames on two render backends); run-to-run variance too high to measure optimizations at all. |
| Secondary desktop | After deep cleanup: **44 GB free** — the modern engine toolchain requires ~150 GB. Hosting it would require deleting the Unity Editors our client work runs on. |

Every performance target in our roadmap (60 fps at 1,000 simulated agents), our visual QA
loop (automated screenshot review), and our user playtesting program are blocked on this.

## 3. What the studio has already shipped with current hardware (traction)

- **Unity white-label multi-sport platform** (Unity 6): configurable per-client sports
  game framework with automated build/test pipeline (compile, EditMode, PlayMode, device
  smoke tests) — serving real local-business clients.
- **AI phone assistant** in production for local businesses (Virginia Beach Field House
  league line; Colattao café line) — live, answering calls today.
- **Disaster-preparedness evacuation game** (vertical slice complete): five-path scenario
  teaching FEMA/CDC-grounded protective decisions (shelter depth, crowd-crush avoidance,
  alert interpretation); crowd simulation of 1,000+ agents; full physics-grounded
  audio-visual model of a blast timeline (silent flash, ground wave, delayed arrival) —
  built to teach "read the room" survival judgment, with a blind-playtest protocol.
- **Reusable evacuation-simulation module** with metrics export (evacuation rates, crowd
  density, chokepoint detection) — the foundation for venue-safety analysis work.
- Fully automated, auditable build pipeline (headless generation of 3D assets, terrain,
  audio; scripted verification gates) — public evidence in our repositories.

## 4. What the grant unlocks (specific, near-term)

1. **Ship the preparedness game's public release**: 60 fps target validated, visual QA
   loop running, playtesting at scale (currently impossible at 4.6 fps).
2. **Launch the room-scale AR experience (Unity)**: door-anchored encounters in the
   player's own home; requires a machine that can run Unity + device simulation + builds
   concurrently.
3. **Grow the white-label Unity platform**: current client builds compete with development
   for the same underpowered machines.
4. **Community angle**: the evacuation scenarios are built from public FEMA/CDC guidance;
   we intend the safety-education content to remain freely accessible.

## 5. Requested budget — one development PC

| Component | Spec | Est. cost |
|---|---|---|
| CPU | AMD Ryzen 7 7800X3D (8C/16T) | $360 |
| GPU | NVIDIA RTX 4070 Super 12 GB | $600 |
| RAM | 64 GB DDR5 | $180 |
| Storage | 2 TB NVMe SSD (engine toolchains are 100+ GB each) | $140 |
| Motherboard / PSU / case / cooling | B650, 750 W Gold, airflow case | $420 |
| OS | Windows 11 | $120 |
| Peripherals (if allowable) | 1440p monitor, keyboard/mouse | $250 |
| **Total** | | **≈ $1,820–2,070** |

Every dollar maps to a measured bottleneck: cores/RAM for engine + AI-assisted builds,
GPU for the 60 fps validation and visual QA, storage for the toolchains our current disks
demonstrably cannot hold.

## 6. Timeline after hardware arrives

- Week 1: toolchains installed; performance baseline re-measured and published.
- Weeks 2–4: preparedness game playtest program (5+ blind testers) + fixes; store
  packaging for the evacuation-sim module.
- Weeks 5–8: AR experience MVP (room setup flow, door-anchored scenario director,
  first creature pack) in Unity.
- Ongoing: white-label client builds unblocked in parallel.

## 7. Team

Anthony Colmenares — founder/operator, AMMA Ventures / Fina Calle (Virginia Beach, VA).
Solo founder running an AI-augmented studio: architecture and product direction are
human-led; implementation is AI-accelerated with auditable, committed build evidence for
every claim in this application.

---

### Submission notes (for Anthony, not for the form)
- **Unity-specific grants** (e.g. Unity for Humanity): lead with §4.2 (the Unity AR
  experience) and §3.1 (the shipped Unity platform); the preparedness/safety-education
  mission is the impact story. Unity grants fund Unity work — keep the Unreal specifics
  out of the headline and framed as "our safety-simulation research."
- **General small-business/creator grants**: lead with §3 traction (live client products)
  and §2's measured hardware block.
- Attach: 2–3 screenshots (the terrain/media captures once the visual loop runs), the
  gate-results CSVs as evidence of the measurement discipline, and repo links if the
  reviewer accepts them.
- Grant amounts, deadlines, and eligibility vary — check the specific program's rules
  before adapting the budget ceiling.
