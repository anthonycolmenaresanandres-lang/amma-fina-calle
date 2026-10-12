# Olympia Sandwich Counter

An isolated Pocket Collector / Pocket Cafe presentation fork at `/demo/olympia-sandwich/index.html`.
The existing Olympia Juice Rush route remains available at `/olympia/play`.

Six simulation/input/level files remain byte-identical to the pinned Pocket Cafe source. `Game.tsx` retains the original simulation callback, including movement, collision, collection, scoring, growth and timing. A Canvas2D presentation adapter projects the same world coordinates onto the illustrated countertop. No client game artwork is reused.

Seven inspected, original generated illustrations provide the open sandwich, finished hero, three pickups, countertop and restaurant. The runtime WebP set is 250,252 bytes, including five transparent food sprites. The source PNGs, prompts and provenance are retained under `art/`; only compressed runtime assets are served. Frame rendering caps device pixel ratio at 1.5, caches the room composition and limits crumbs to 24.

The supplied photo supports a golden roll, brown cooked filling and pale melted cheese. The named sandwich, meat species, cheese variety and bread variety are unconfirmed. `recipe.ts` maps configurable visual slots onto the original gameplay IDs without claiming a restaurant recipe. This is an explicitly labeled sandwich study.

## Local validation

Use the package's existing dependencies or install this isolated package on another machine. On the shared desktop, never install/write through the existing ignored dependency junction.

- `npm run verify`: frozen-source, original simulation, projection bounds and asset hashes.
- `npm run build`: TypeScript and standalone Vite with the native configuration loader.
- `npm run preview`: loopback 4186. Coordinate capacity before browser/build work.
- Append `?art=fallback` to exercise image-free primitive rendering.

The Vite cache and static output are restricted to this package's `.cache/vite` and `APP/web/public/demo/olympia-sandwich`. No Next application source, live client game, website menu or website photo is replaced. See `QA.md` for observed checks and limitations.
