# Maracaibo textured flag motion review - October 4, 2026

Anthony reviewed the previous GIF and asked for a more realistic flag. This local refinement starts from 5f57b4b on codex/maracaibo-flag-ripple-20261004. It supersedes that preview's flat vector/segmented approach. No publication is authorized for this revision.

The existing venezuelan-flag-concept-480.webp / -960.webp artwork provides fabric texture, natural folds, yellow-blue-red stripes and eight white stars. One continuous native WebGL surface adds a smooth traveling ripple, soft directional fold lighting and small free-edge flutter. No panel joins, whole-image rotation, replacement assets or dependencies. This is a browser cloth effect over existing artwork, not filmed cloth or a physical simulation.

Motion plays once for 4.8 seconds then rests at the original artwork. The normal image is available before hydration/loading and when WebGL is unavailable/lost. Reduced motion skips the shader entirely and displays the static image. Flag wrapper dimensions, accessible treatment, other artwork and all product functions remain unchanged.

Validation: scoped ESLint and Next route type generation/TypeScript pass. Native Chrome at 390/1440 has changing actual rendered pixels, stable 98x65 / 112x75 wrappers, no horizontal overflow and exact original pixels at rest. Reduced motion and forced WebGL context loss expose the loaded static artwork. Zero runtime exceptions or attempted application writes. External analytics GET was blocked in local review. Desktop/mobile and motion key frames visually inspected. Real physical phones remain outside this focused browser check.

[Watch the moving preview](https://chatgpt.com/api/library/files/libfile_acd4f8bd40f081918c60cb4096c2080f/download): six seconds, 640x460, 20 fps capture, 120 actual browser frames; 97 encoded GIF frames because identical rest frames coalesce; 5,571,991 bytes. Decoded motion and total duration verified. The GIF repeats for review; the product animation plays once.

Local evidence is in .review/realism/: checks.json, context-fallback.json, gif-encoding.json, desktop/mobile screenshots and captured frames. Large review outputs are not committed. Only flag component/styles and scoped operations records change. No push, PR, merge or deployment. Prior published sway remains main 176093b / PR #306. Traffic, canonical dirty files, old signature and paused reliability work are preserved.
