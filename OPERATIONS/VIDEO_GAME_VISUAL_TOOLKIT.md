# AMMA Video + Game Visual Toolkit

## Decision

AMMA's local production lane is Remotion + FFmpeg for video and Pixelorama + the existing Phaser 4.1.0 runtime for game visuals. This keeps work reproducible on the current Intel workstation and gives Claude and Codex the same playbook. Remotion is source-available, not unconditionally free: confirm license eligibility before commercial use or scaling; hosting/render compute is a separate cost.

## License and cost gate - checked 2026-09-10

- Remotion's Free License covers individuals and eligible organizations/teams of up to three people. Commercial organizations of four or more generally need a Company License; collaborators and project ownership can affect the count.
- Delivering only a finished video does not add the client's headcount; jointly operating or transferring the Remotion project may. Check the actual arrangement rather than assuming AMMA is eligible.
- Current paid options: Creators $25 per seat/month for qualifying low-volume work; Automators $0.01 per render with a $100/month minimum. Cloud compute is additional. Do not purchase or activate either without Anthony's approval.
- Team size, project-ownership arrangements and AMMA's current paid-license status are unknown in this review. This document is not proof of license compliance.
- Sources: [pricing](https://www.remotion.dev/docs/license/pricing), [agency and automation FAQ](https://www.remotion.dev/docs/license/faq). Recheck before a purchase, upgrade or client delivery.

## Installed tools

| Layer | Tool | Status | Purpose |
|---|---|---|---|
| Video composition | Official Remotion skills | Project + global; Claude + Codex | Deterministic React video, editable templates, captions, and renders. |
| Media processing | MediaBunny skill | Project + global; Claude + Codex | Browser-native media inspection and transformations. |
| Delivery | FFmpeg 8.1.2 | Windows via winget | Probe, transcode, combine, optimize, and verify deliverables. |
| Game art | Pixelorama 1.1.10 | Windows via winget | Free sprite, animation, tileset, and pixel-art production. |
| Game runtime | Phaser 4.1.0 | Already in `APP/web` | Mobile web gameplay, sprites, filters, particles, render textures, and responsive scaling. |

Selected official Remotion skills: `mediabunny`, `remotion-captions`, `remotion-create`, `remotion-interactivity`, `remotion-markup`, and `remotion-render`.

Selected official Phaser skills: `animations`, `filters-and-postfx`, `loading-assets`, `particles`, `render-textures`, `scale-and-responsive`, `sprites-and-images`, and `v4-new-features`.

Historical standalone-install record: `remotion-docs` and the bundled router were excluded after the installer flagged the then-reviewed package; `remotion-saas` was excluded as out of scope. That snapshot is not a current verdict on a later plugin version or proof of today's inventory. Current discovery also includes the official Remotion plugin. Follow `OPERATIONS/SKILL_ROUTING.md` to select one task-specific, runtime-compatible guide; review the exact version before changing installation policy. This workflow update adds no application dependency.

## Required workflow

1. Read `amma-video-game-visuals` and the real brand or product source.
2. Lock the platform, dimensions, duration or viewport, CTA, rights, and reference state.
3. Route video work through Remotion/FFmpeg and game work through Pixelorama/Phaser.
4. Preserve originals, stable QR routes, approved logos, mobile performance, and the game primitive fallback.
5. Verify video streams and key frames or test both game visual paths at the same mobile viewport.
6. Stop before customer send, publish, deployment, paid generation, or cloud upload unless Anthony approved the exact action.

## Edge watchlist

Track LTX-2 and comparable open video models for cloud use. Do not install local diffusion-video stacks on this PC: Intel HD Graphics 620 does not satisfy their practical CUDA/VRAM requirements. Reassess when AMMA has a CUDA workstation with at least 16 GB VRAM or an approved cloud budget.

## Official sources

- Remotion: https://www.remotion.dev/ and https://github.com/remotion-dev/skills
- Phaser: https://github.com/phaserjs/phaser
- Pixelorama: https://github.com/Orama-Interactive/Pixelorama
- FFmpeg: https://ffmpeg.org/documentation.html
- LTX-Video watchlist: https://github.com/Lightricks/LTX-Video
