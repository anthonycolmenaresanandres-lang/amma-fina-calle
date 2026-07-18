# Approved tool routing

## Local production stack

| Need | Tool | Route |
|---|---|---|
| React-driven video | Remotion official skills | Create, compose, caption, preview, and render deterministic branded video. |
| Browser-side media processing | MediaBunny skill | Inspect or transform media in web workflows where browser-native processing is appropriate. |
| Encode and inspect | FFmpeg 8.1.2 | Use `ffmpeg` for transforms and `ffprobe` for objective output verification. |
| Pixel art and sprite sheets | Pixelorama 1.1.10 | Create raster sprites, animation frames, tiles, and exportable sheets without a subscription. |
| Web game visuals | Existing Phaser 4.1.0 runtime | Use the installed official Phaser skills for asset loading, sprites, animation, particles, filters, render textures, responsive scaling, and v4 rendering features. |

## Selection rules

1. Prefer deterministic local production when it can meet the brief.
2. Reuse the existing app runtime and real approved assets before adding a dependency.
3. Use Pixelorama for authored 2D game art; use Phaser for runtime presentation and motion.
4. Use Remotion for repeatable campaigns, variants, captions, and template-based video.
5. Use FFmpeg for delivery conversion and verification, not for inventing creative direction.

## Technology watchlist

LTX-2 and similar open video models are useful edge-of-market research, but this workstation's Intel HD Graphics 620 does not meet practical local CUDA/VRAM requirements. Treat them as cloud/API options only and require approval for spend, uploads, likenesses, and external processing. Do not install ComfyUI or local diffusion-video weights on this machine.
