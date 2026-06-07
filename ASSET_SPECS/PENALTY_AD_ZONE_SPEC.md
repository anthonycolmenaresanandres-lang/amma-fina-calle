# Penalty Shootout — Behind-Goal Ad Zone Spec

_AMMA Ventures LLC DBA Fina Calle_
_Created: 2026-06-07 | Version: 1.0_
_Governed by `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md` → Campaign Pack tier._

---

## Purpose

The **behind-goal ad zone** is the **single dynamic campaign placement** in the
Penalty Shootout **Stadium Shell**. It is the large panel in the upper-field
backdrop, **behind the goal** (the goal frame and net render in front of it).
It is where a client's campaign lives: food/drink promos, seasonal art, a "fuel
your game" hero, a launch announcement, etc.

**One zone. Swappable per campaign. Everything else in the shell is fixed.**

This is the **only** placement a client/campaign controls in the shell. It is
**not** a free-for-all: it is a reserved rectangle with fixed dimensions and
safe-area rules so the game never breaks and gameplay stays readable.

---

## What this zone is NOT

To keep the product standardized, the following are **explicitly out of scope**
for the current Campaign Pack and must **not** be added as part of an ad zone:

- ❌ **No keeper message box** (no speech/告示 box over or near the keeper).
- ❌ **No bottom promo text strip** (no lower-third sponsor copy band).
- ❌ **The top scoreboard / menu strip stays FIXED.** It is part of the frozen
  shell — it is **not** a per-campaign customizable zone right now. The only
  per-campaign text it may carry is a fixed menu-button label/link (see protocol),
  not campaign creative.

If a campaign needs more than the one behind-goal zone, that is a **product
change**, not a campaign — escalate to update this spec and the protocol first.

---

## Placement & dimensions (reference)

> Exact pixel values are a renderer tuning step (done when the ad-zone code lands).
> This spec fixes the **intent and constraints**; the renderer fits any compliant
> image into the reserved region via cover-fit + an optional per-campaign nudge.

- **Region:** the upper-field backdrop **behind the goal mouth**, above the
  grass line. The goal frame + net are drawn **in front** of the zone.
- **Aspect:** authored **landscape**, wide enough to fill the backdrop on the
  narrowest supported phone (portrait, ~390px wide reference canvas) without
  letterboxing after cover-fit.
- **Source resolution:** high-res (long edge ≥ 1600px) so it stays crisp when
  scaled up on large phones.
- **Format:** **WebP**, optimized; verified (no fake/baked-in transparency).
- **Budget:** the ad-zone image should stay within the per-skin art budget
  (**< ~1–2 MB** total per campaign, shared with any other assets).

---

## Safe-area rules (readability is non-negotiable)

The game must remain fully playable over any ad. The renderer enforces a
**readability treatment** (edge feather into the grass + a light scrim); the
**art** must also cooperate:

1. **Keep the center-and-lower band clear of critical detail.** The goal mouth,
   net, keeper, ball, and the six aim targets sit in front of the lower portion
   of the zone. Busy art or fine text there fights the gameplay — keep that band
   visually calm (let the hero/product sit in the **upper** part of the zone).
2. **No critical text in the corners or extreme edges** — cover-fit may crop the
   edges on different phone ratios. Keep logos/headlines within a centered safe
   margin (~8% inset on every side).
3. **High contrast for any in-art text** vs. a mid-tone background; the score
   (top) and status text (center) are light — art directly behind them must not
   wash them out.
4. **Connect visually to the scene.** Bottom edge should read as receding into
   the field, not a hard floating rectangle — the renderer feathers it, but
   avoid a hard horizon line at the very bottom of the art.
5. **No essential information that must be readable to play** — the ad is
   decorative/promotional; gameplay never depends on reading it.

---

## Legal / brand guardrails (inherited, absolute)

Per the protocol's guardrails — restated because the ad zone is the most likely
place to violate them:

- **No FIFA / World Cup / UEFA / federation / tournament** names, logos, trophies,
  or marks. No replica official-ball or competition identity.
- **No real club kits, crests, or club identity.**
- **No real human faces** (players, celebrities, owners, staff) without written
  likeness rights on file.
- **No unverified factual claims** in ad copy (prices, "official", guarantees).
- **Only owned / licensed / client-approved imagery** — no scraped or watermarked art.
- **Client must approve the ad creative in writing before publish.** Until then
  the campaign is **PENDING CLIENT APPROVAL** and does not deploy to production.

A creative that cannot satisfy these ships with **no ad image** → the shell falls
back to its default backdrop (no broken/404 look).

---

## Per-campaign intake (ad zone)

| Item | Spec |
|------|------|
| Ad-zone creative | Landscape WebP, long edge ≥ 1600px, < ~1–2 MB, safe-area compliant |
| Campaign id | kebab-case, e.g. `colattao-fuel-your-game` |
| Menu label / link (optional) | Fixed top-strip button text + URL (not creative) |
| Written client approval | Sign-off that Fina Calle may publish this creative |

Files land under `/public/assets/{campaign-id}/penalty/` and the client's
`ASSET_REGISTRY/{CLIENT}/` folder, confirmed via the existing
`ASSET_REGISTRY/ASSET_QA_CHECKLIST.md`.

---

## Cross-references

- `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md` — Campaign Pack tier + guardrails
- `ASSET_SPECS/PENALTY_KIT_SPEC.md` — player/keeper shirt customization
- `GAME_LIBRARY/PENALTY_SHOOTOUT.md` — package spec + lineage
