# Maracaibo cloth ripple review - October 4, 2026

Anthony rejected the prior rigid sway and authorized replacement artwork provided it remains a Venezuelan flag. The prior sway is already published as PR #306 / main 176093be67a35ccf44fd87c4b304975ffd78f2ee. This follow-on revision is isolated from that exact main commit and remains local until reviewed.

## Change

MaracaiboFlag.tsx supplies new code-native SVG artwork: equal horizontal yellow, blue and red stripes, with eight white stars in an arc within blue. Twelve clipped sections share continuous edge displacement while the hoist stays fixed. Their distinct transforms bend the fabric itself. A subtle shifting light gradient accompanies the motion. This is vector artwork, not a photographic or generated flag.

Motion plays once for 4.8 seconds then rests. Reduced-motion users receive the static vector without animated panels or SMIL. Existing flag dimensions, layout, accessible label/decorative treatment, other artwork and product functions are preserved. No new dependencies, services, gameplay, staff integrations or paid assets.

## Evidence

- Scoped ESLint for MaracaiboFlag.tsx and MaracaiboMarks.tsx: pass.
- Next route type generation and TypeScript --noEmit --incremental false: pass.
- Native Chrome at 390 and 1440 pixels: eight stars, correct stripes, twelve distinct deformation matrices, shared seams within 0.0004 SVG units, stable wrapper size and no horizontal overflow. Final transforms rest at identity.
- Reduced motion: zero panels, CSS animations or SMIL; eight stars retained.
- Zero runtime exceptions and no application writes. External analytics GET was blocked in the local preview.
- Mobile/desktop rendered screenshots and motion frame visually inspected.
- Actual browser-captured motion: 120 PNG frames at 20 fps, encoded with installed Pillow into a six-second GIF (97 encoded frames due identical rest-frame coalescing; 640 x 460; 3,782,034 bytes). Motion verified through distinct decoded frames and total duration. GIF repeats for review; product motion plays once.

Moving Library preview: [Maracaibo cloth ripple GIF](https://chatgpt.com/api/library/files/libfile_1e69a19097d48191a4d0d4cc7f917202/download).

Local evidence: .review/ripple-checks.json, .review/gif-encoding.json, .review/ripple-390.png, .review/ripple-1440.png and .review/frames/. These large review outputs are intentionally outside the commit.

## Release boundary

Branch: codex/maracaibo-flag-ripple-20261004. No push, PR, merge or deployment of this revision. Existing traffic fix, canonical dirty operations files, old signature branch and paused session-reliability work are untouched. Review the moving GIF before any publishing decision.
