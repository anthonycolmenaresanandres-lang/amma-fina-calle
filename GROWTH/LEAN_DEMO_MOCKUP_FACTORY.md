# Lean Demo Mockup Factory

_The acquisition demo, done the factory way: don't build the full game+menu per
prospect. **Stamp a cheap, consistent preview image** (menu + game), **logo-only,
no characters**, for every lead — then build the real product only after they say yes._

## Why this shape
- **Defer production cost.** A built skin+menu per prospect is craft labor; a stamped
  preview is a $0, seconds-long artifact. Build the real thing post-close.
- **Logo-only, no AI characters.** Characters are the slow, defect-prone part (the
  AI-logo / fidelity issues we already hit). Skip them for the demo.

## The correction that "minimizes mistakes" (die-and-stamp)
Image generators **mangle logos and text** — structured prompts reduce but never
eliminate this. So we split the job:

1. **The die — generate the scene ONCE.** A characterless **master template**
   (phone showing a menu page + the game) with **neutral placeholder zones** for the
   logo, name, and brand color. Generate it once with ChatGPT (prompt below), QC it
   once, reuse forever.
2. **The stamp — code places the real parts per lead.** `tools/lead_mockup_stamp.py`
   composites the **real, approved logo + exact brand hex + business name + signature
   item** into the zones. The logo is *placed*, never AI-drawn → **pixel-perfect every
   time, ~zero marginal cost, fully repeatable** (and compliant: logos are approved
   overlays, never generated).

A working stamp already exists (no fancy master needed to start) — it uses the
brand-neutral **Stadium Shell** as the game scene. Sample:
`GROWTH/samples/lead-mockup-colattao-demo.png`.

```
python tools/lead_mockup_stamp.py \
  --logo <approved-logo.png> --name "BUSINESS" --item "Signature Item" \
  --color "#261810" --accent "#d8a24c" --out out.png \
  [--items "Item:Price,Item:Price,..."]
```

## Per-lead inputs (all come from the dossier)
`logo` (approved file) · `name` · `signature item` · `brand primary hex` ·
`accent hex` · (optional) `menu items`. These are exactly the **HOOK INPUTS** the
Client Dossier system produces — so dossier → stamp is a clean handoff.

## Structured ChatGPT prompt — the MASTER scene (generate once, for higher fidelity)
> Create a clean, photoreal **product mockup**, portrait, on a plain off-white
> studio background. Show **two smartphones side by side**, both powered on:
> - **Left phone — a restaurant digital-menu app:** a solid-color **header band**
>   across the top (leave it a **flat neutral block** — do NOT add any logo or text),
>   below it a tidy vertical **menu list** of 5 generic rows (item name left, price
>   right) with thin dividers, and a single rounded **call-to-action button** near the
>   bottom (leave the button a **flat neutral block**, no text).
> - **Right phone — a penalty-shootout soccer game:** a daytime stadium with crowd,
>   a goal with net, a ball on the spot, a thin **scoreboard bar** at the top and a
>   blank rectangular **advertising board behind the goal** (leave the board and the
>   scoreboard **flat neutral blocks**, no logo or text). **No characters, no players,
>   no mascots.**
> Flat, even lighting; crisp edges; no text anywhere; leave the header, button,
> scoreboard, and ad board as clean empty zones for compositing. Highest resolution.

Why the empty zones: code stamps the real logo/name/color into them — so the model
never has to render a logo (where it fails). Export ≥2500 px; Claude maps the zone
coordinates once, then every lead is a stamp.

## Pipeline (the intake → demo line)
1. **Lead list** (Client Dossier system) → per-lead HOOK INPUTS.
2. **Stamp** (`lead_mockup_stamp.py`) → per-lead preview PNG.
3. **Publish** to the **Lead Arcade** tab (below) for the owner to browse.
4. Owner picks winners → outreach with the preview → on close, build the real Campaign Pack.

## The Lead Arcade (the owner's game-like review tab) — PLAN
A single online page (static, **Vercel-deployed, outside Client OS routes**) that
shows each lead as a **card**: the stamped preview, dossier summary (rating, signature
item, fit score HOT/WARM/COLD), and a "preview / mark for outreach" action — styled so
**browsing leads feels like playing**. Aesthetic is a deliberate choice (pending):
- **Penalty-stadium arcade** — scoreboard UI, leads as "shots on goal," HOT = on target.
- **Trading-card collection** — leads as Colattanini-style cards you flip/collect (reuses our card language).
- **Retro arcade level-select** — leads as "levels" to unlock; pick your next match.

## Guardrails
- **Approved logos only, placed not generated**; non-human/no characters in the demo.
- **Public data only** for inputs; **no PII in the repo** (previews + dossiers with
  contact data live in a private/owner store; in-repo samples are example-only).
- The Arcade tab must not touch Client OS routes/data — it's a standalone internal page.
