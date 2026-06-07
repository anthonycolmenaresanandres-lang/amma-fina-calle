# Penalty Shootout — Player & Keeper Kit (Shirt) Spec

_AMMA Ventures LLC DBA Fina Calle_
_Created: 2026-06-07 | Version: 1.0_
_Governed by `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md` → Campaign Pack tier._

---

## Purpose

In the Penalty Shootout **Stadium Shell**, two characters carry a **customizable
shirt (kit)**:

1. **Player (kicker) shirt** — recolorable per brand/campaign.
2. **Keeper shirt** — recolorable per brand/campaign.

Kit customization is **color-driven**, not new art per client. One mascot set
serves every brand by recoloring its kit from a small config — that is what keeps
this a **standardized product** instead of a bespoke build each time.

---

## Non-negotiable: non-human mascots only

- The kicker and keeper are **original, non-human Fina Calle mascots** (the keeper
  is the company-owned **Sentinel Keeper**). They are **never** real humans.
- "Shirt customization" means **recoloring the mascot's jersey/kit** — it does
  **not** mean dressing a real player or wearing a real team's uniform.
- **No real team kits, crests, club identity, FIFA/World Cup/federation marks, or
  real-person likeness.** (Inherited from the protocol guardrails; absolute.)
- Decision on file (2026-06-07): characters stay mascots; shirts = mascot-kit recolor.

---

## Target implementation: layered tintable kit

Decision on file (2026-06-07): **layered tintable kit** is the target (not a
quick whole-sprite tint, not per-client sprite variants). Art must be authored so
a single mascot can take any brand color via a config field:

- **Base body layer** — the mascot (body, head, limbs, boots, gloves) with **no
  jersey color baked in** where the kit shows. This layer is never tinted.
- **Kit layer** — a **separate** sprite for the **jersey/shirt region only**,
  authored in **neutral white (#FFFFFF)** with shading carried by luminance/alpha,
  so a multiply/tint renders the brand color **true** (white tints cleanly to any
  hue; a pre-colored jersey would muddy the result).
- The renderer composites **base + tinted kit** at the same anchor/scale, so one
  mascot serves unlimited brand colors with **zero new art per campaign**.

### Neutral kit-layer requirements

| Requirement | Why |
|-------------|-----|
| Jersey region authored **neutral white**, shading via luminance only | Tint reads true to the brand hue |
| Kit layer is a **separate file/sprite** aligned to the base | Lets the renderer tint only the shirt, not the whole mascot |
| **Transparent (real alpha)** outside the jersey region | No box/halo; verified, no baked-in checkerboard |
| Registered to the **same origin/anchor** as the base sprite | Base + kit stay aligned at every scale |
| Optional **secondary region** (trim/sleeves) as its own neutral sub-layer | Supports primary + accent kit colors |

Until the layered art exists, the kit may degrade to the shell's **default kit
colors** (no broken look) — the layered system is the target, defaults are the
fallback.

---

## Kit config (per campaign)

The kit is described by color, not art. Reference shape (final field names set
when the code lands):

| Field | Meaning |
|-------|---------|
| `player.primary` | Kicker jersey main color (hex) |
| `player.secondary` _(optional)_ | Kicker trim/accent color |
| `keeper.primary` | Keeper jersey main color (hex) |
| `keeper.secondary` _(optional)_ | Keeper trim/accent color |

### Color rules

- **Contrast:** player and keeper kits must be **clearly distinct from each other**
  and from the **field (green)**, **net (light)**, and **ball** — so the action
  reads at a glance on a phone.
- **Keeper readability:** the keeper must stay legible against the goal/net while
  diving; avoid near-white or near-net colors for the keeper kit.
- **No reliance on a specific brand color to play** — recolor is cosmetic; gameplay
  is unaffected.
- **WCAG-ish minimum:** aim for a strong luminance gap (not just hue) between the
  two kits and the field.

---

## Per-campaign intake (kit)

| Item | Spec |
|------|------|
| Player kit color(s) | 1–2 hex (primary, optional accent) |
| Keeper kit color(s) | 1–2 hex (primary, optional accent) |
| Mascot art status | Uses company-owned layered mascots; no new art needed per client |
| Written client approval | Sign-off on the chosen kit colors before publish |

---

## Cross-references

- `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md` — Campaign Pack tier, Sentinel Keeper, guardrails
- `ASSET_SPECS/PENALTY_AD_ZONE_SPEC.md` — behind-goal ad zone
- `GAME_LIBRARY/PENALTY_SHOOTOUT.md` — package spec + lineage
