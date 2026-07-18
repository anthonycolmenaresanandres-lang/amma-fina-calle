---
name: amma-video-game-visuals
description: Route AMMA video generation, motion graphics, game art, sprites, effects, and media finishing through the approved free Remotion, FFmpeg, Pixelorama, and Phaser 4 stack. Use for creating or revising MP4/WebM/GIF deliverables, social promos, animated explainers, captions, game sprites, texture atlases, particles, shaders, filters, responsive game scenes, or branded game skins.
---

# AMMA Video + Game Visuals

Build from real brand material, use the lightest capable local tool, and preserve a working fallback. Read [tool-routing.md](references/tool-routing.md) for the approved versions and role of each tool.

## Establish the brief

Confirm the outcome, audience, platform, aspect ratio or viewport, duration, CTA, delivery format, brand source, asset rights, and reference frame before producing. If matching an existing screen or video, capture the source first. Do not invent missing brand identity.

## Route the work

- For a new programmatic video, use `remotion-create` and `remotion-markup`; add `remotion-interactivity` for Studio-editable controls and `remotion-captions` when speech or accessibility copy is present; finish with `remotion-render`.
- For trim, transcode, probe, extract, combine, or optimize operations, use FFmpeg or `mediabunny`. Preserve originals and write outputs to a separate path.
- For game art, read `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md`, create or edit raster sprites in Pixelorama, and use only the Phaser skills relevant to the task: `loading-assets`, `sprites-and-images`, `animations`, `particles`, `filters-and-postfx`, `render-textures`, `scale-and-responsive`, or `v4-new-features`.
- For storyboard-first planning, use `video-storyboard-builder` when it is available before production.
- Treat diffusion video models and hosted generators as optional cloud lanes. Stop for explicit approval before uploading a customer asset, using a real person's likeness, accepting paid usage, or sending a generated output externally.

## Protect quality and performance

- Use real approved assets; never synthesize client logos, real faces, league marks, club marks, or event branding.
- Keep every game skin behind the existing primitive fallback so missing or slow assets never break play.
- Design mobile-first. Budget texture dimensions, atlas count, particle count, post-processing, memory, and load time before adding visual effects.
- Prefer one intentional visual system over stacked filters, gratuitous particles, or generic template motion.
- Keep stable QR-linked routes unchanged.

## Verify before handoff

- Video: render the intended resolution and codec, probe duration and streams with FFprobe, review the first frame, key beats, captions, CTA, and final frame, and confirm the file plays without errors.
- Game: test the primitive fallback and the asset-enhanced path at the same mobile viewport; check loading, input, resizing, frame stability, console errors, and asset failures.
- Compare reference and result at the same state and viewport. Record unknowns instead of claiming unverified quality.
- Stop before publish, deploy, customer send, paid generation, or external upload unless Anthony approved that exact boundary.
