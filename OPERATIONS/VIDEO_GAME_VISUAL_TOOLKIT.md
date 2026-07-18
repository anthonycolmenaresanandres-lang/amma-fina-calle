# AMMA Video + Game Visual Toolkit

## Decision

AMMA's free production lane is Remotion + FFmpeg for video and Pixelorama + the existing Phaser 4.1.0 runtime for game visuals. This keeps work reproducible on the current Intel workstation, gives Claude and Codex the same playbook, and avoids subscriptions or a speculative engine migration.

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

The official Remotion `remotion-docs` skill was rejected after the installer rated it high risk. `remotion-saas` was excluded because AMMA does not need a hosted rendering product, and the `remotion-best-practices` router was excluded because it bundled both rejected folders. The six direct production skills are all installer-rated low risk with no source-scanner alerts. No application dependency was added.

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
