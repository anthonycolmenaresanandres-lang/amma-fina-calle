# Project memory — AMMA / Fina Calle

_Concise, durable context for Claude sessions. Keep it short._

## Multi-agent collaboration model (work happens in PARALLEL)
- **Claude** (cloud container): reasoning, code, GitHub PRs/merges, and **visual recognition** —
  can pull repo images and view them, compute alignment math, and render preview/tuning overlays.
  **Can also run image tooling here** (`pip install pillow numpy scipy`): key out backgrounds,
  PNG→WebP with alpha, simple procedural art (e.g. the café-tinted ball), and faithful
  composite previews of the scene. **Cannot**: reach the local machine, or do AI image
  *generation* (that's ChatGPT). So Claude can process/convert/cut/draw simple art + preview;
  ChatGPT generates the rich art.
- **Codex** (local agent on Anthony's machine): reads local files (Desktop / OneDrive), copies
  & converts images (PNG→WebP), runs local builds, and publishes. Use for local file ops; for
  art that Anthony pastes into chat, Claude can process + commit directly.
- **ChatGPT**: image generation (backgrounds, crowd, kicker, keeper, mascots). Exports PNG.
- **Pipeline:** ChatGPT generates art (use the prompt library `PROMPTS/PENALTY_ASSET_PROMPTS.md`)
  → Claude keys/sizes/wires + tunes fit via composite preview → phone QA → merge (Vercel auto-deploys).
- Coordinate via short-lived `claude/...` branches → draft/ready PR → squash-merge to `main`.

### Asset protocols (learned, important)
- **Faked transparency:** generated PNGs often paint a grey/white **checkerboard** (or a drop
  shadow) into a **100% opaque** file. ALWAYS verify corners are `alpha=0` before use. To fix:
  flood-key the grey/bright background from the image edges, protected by the mascot's dark
  keyline (so interior whites survive), then re-add a clean white die-cut stroke. Best upstream
  fix: ask for true alpha or a flat magenta `#FF00FF` ground.
- **Never bake the goal into background art.** The engine draws the goal; AI backdrops are
  crowd/stands/pitch ONLY (no posts/net). A baked goal won't match the engine's goal *aspect*
  (background-fit only scales uniformly), so keeper/ball/targets drift. Generate the backdrop
  with the **crowd/pitch line at 42%** (the goal line) and let the engine own the goal.

## Penalty Shootout V2 (game) — status on `main`
Architecture: engine/input/skin split → color skins → asset renderer → assisted swipe (default tap).
- **Asset slots** (all optional, primitive fallback, no 404): `background` (+ per-skin `backgroundFit`
  {scrim,scale,offsetX/Y}), `logo`, `ball` (+ per-skin `ballFit.scale`; image draws at diameter
  `r*2.4*scale`, stays on the spot), `kicker` (+ `kickerFit` scale/offsetX/Y, leans on shot),
  `keeper` (+ `keeperFit` scale/offsetY; image keeper slides+tilts on the dive, else primitive).
- **Renderer chrome:** engine draws the goal (thick posts + net extended to a **ground line**
  below the goal line so it looks planted — visual only; aim zones/keeper line/targets stay
  `goalTop..goalBottom`); top **scoreboard** panel; behind-goal **ad zone** can render as an
  engine-drawn **stadium-native signage board** (`adZone.image` insets into it) OR be left off.
- **Skins:** Fina Calle (default, primitive), Colattao (**art-complete**, see below), Stadium
  (brand-neutral shared **Stadium Shell** `shell-daylight-v1.webp`, used across restaurants).
- **Colattao set (live, art-complete):** crowd-with-fan-signs backdrop (CHURRO LATTE / WE ♥
  COLATTAO — branding lives in the crowd, so the signage-board ad zone is **off** for Colattao;
  board renderer stays for other clients), cup-striker kicker (real logo on jersey), green
  Sentinel Keeper (lowered onto grass), café-tinted ball art, planted goal posts, scoreboard.
  Asset prompts: `PROMPTS/PENALTY_ASSET_PROMPTS.md`; sticker spec: `ASSET_SPECS/PENALTY_PLAYER_STICKER_SPEC.md`.
- Default tap behavior + all existing skins are preserved; skins/assets/input-mode never change
  gameplay, scoring, keeper logic, levels, or routes.
- Governance: `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md` (Sentinel Keeper, Match Ball, tiers).
- **Productized model:** Penalty Shootout uses a **fixed Stadium Shell + Campaign Pack** —
  the only per-client variables are the **behind-goal ad zone**, **player shirt**, and
  **keeper shirt** (non-human mascot kit recolor); everything else (engine, geometry,
  field, gameplay, top scoreboard/menu strip, score placement) is frozen. Specs:
  `ASSET_SPECS/PENALTY_AD_ZONE_SPEC.md`, `ASSET_SPECS/PENALTY_KIT_SPEC.md`. The behind-goal
  ad zone **supersedes** the earlier LED/scoreBug/adBanner ad ideas — don't ship those as
  the customizable surface; reassess any open Stadium ad PR against this model before merge.
- **Status (parked, stable):** behind-goal **ad zone** (live, Colattao coffee/pastry) + **keeper kit**
  (live, Colattao green) are built; **player kit** and **campaign-on-Stadium-Shell binding** are not.
  Full snapshot + sales wording + resume sequence: `GAME_LIBRARY/PENALTY_SHOOTOUT_CAMPAIGN_PACK_STATUS.md`.
- Roadmap next: **keeper kit** pass (deferred per owner); optionally adopt the shared Stadium
  Shell on the Stadium skin; campaign-on-Stadium-Shell binding. Ball/kicker/keeper/backdrop art
  for Colattao are DONE (PRs #37–#43).

## Hard guardrails (always)
- Never touch Client OS routes (`/m/[id]`, `/owner/[id]`, `/customers`), Supabase, Stripe, POS,
  secrets, or customer data.
- Game art: **non-human mascots only**, no FIFA/World Cup/club/real-face branding, client approves
  assets before publish. Asset skins must keep primitive fallback (no broken/404 visuals).
  **Logos are approved overlays only — never AI-generated** (use the client's real approved logo file).
- This environment is ephemeral — commit/push anything worth keeping.
