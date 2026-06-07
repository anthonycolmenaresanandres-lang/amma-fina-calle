# Project memory — AMMA / Fina Calle

_Concise, durable context for Claude sessions. Keep it short._

## Multi-agent collaboration model (work happens in PARALLEL)
- **Claude** (cloud container): reasoning, code, GitHub PRs/merges, and **visual recognition** —
  can pull repo images and view them, compute alignment math, and render SVG preview/tuning
  overlays. **Cannot** reach the local machine, generate images, or run image tools here.
- **Codex** (local agent on Anthony's machine): reads local files (Desktop / OneDrive), copies
  & converts images (PNG→WebP), runs local builds, and publishes. Use Codex for getting
  generated art into the repo and local file ops.
- **ChatGPT**: image generation (backgrounds, ball, kicker, mascot). Exports PNG; Codex commits/converts.
- **Pipeline:** ChatGPT generates art → Codex commits it to `APP/web/public/assets/<skin>/penalty/`
  → Claude wires the skin + tunes fit via the preview tool → phone QA → merge (Vercel auto-deploys).
- Coordinate via branches; Claude pulls committed images to examine at full resolution for exact placement.
- We use Codex/ChatGPT integrations + image generation to increase accuracy.

## Penalty Shootout V2 (game) — status on `main`
Architecture: engine/input/skin split → color skins → asset renderer → assisted swipe (default tap).
- **Asset slots** (all optional, primitive fallback, no 404): `background` (+ per-skin `backgroundFit`
  {scrim,scale,offsetX/Y}), `logo`, `ball` (spins in flight), `kicker` (+ `kickerFit`, leans on shot).
- **Skins:** Fina Calle (default, primitive), Colattao (café bg), Stadium (in progress, PR #18).
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
- Roadmap next: ball art → kicker art → Sentinel Keeper sprite (tiers Product Ball → Kicker → Keeper).

## Hard guardrails (always)
- Never touch Client OS routes (`/m/[id]`, `/owner/[id]`, `/customers`), Supabase, Stripe, POS,
  secrets, or customer data.
- Game art: **non-human mascots only**, no FIFA/World Cup/club/real-face branding, client approves
  assets before publish. Asset skins must keep primitive fallback (no broken/404 visuals).
  **Logos are approved overlays only — never AI-generated** (use the client's real approved logo file).
- This environment is ephemeral — commit/push anything worth keeping.
