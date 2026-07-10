# UI Design System + Colattao Menu Integration — Chat Handoff

**Purpose.** Hand off to a chat/agent that **can reach the live sites** (this
sandbox's network policy blocks external hosts, so I could not open
`colattao-cafe-rush.vercel.app`). Your job: pull the **live Café Rush menu**
look + the **game** look into the Fina Calle OS public menu (`/m/[id]`) and
organize the site around it — **using the design system already established in
this repo** (documented below). Everything here is presentation-first and must
respect the existing guardrails.

Written by the session that built the premium UI pass (merged PRs **#151–#154**).
Read those diffs first — they are the reference implementation for every pattern
below.

---

## ⛔ CRITICAL CONSTRAINT — do not change the QR URL (owner directive, 2026-07)
Colattao's **physical in-store QR code** points to
`https://colattao-cafe-rush.vercel.app/menu`. That URL is **printed on signage
in the restaurant**, so changing it — or migrating Colattao's menu in-house to
`/m/colattao` — would force the owner to **reprint the physical QR**. Therefore:
- **Keep `publicMenuHref("colattao")` linking OUT** to the Café Rush menu. Do
  **not** move Colattao onto `/m/[id]`.
- The live **Café Rush menu is the DESIGN REFERENCE**, not something to relocate.
  Any actual Colattao menu redesign happens **inside the Café Rush app, at the
  same URL** (separate deployment/repo).
- `/m/[id]` stays the **generic template for *new* clients** — the goal is to make
  it look as good as Colattao's real Café Rush menu, so future restaurants get
  that quality out of the box.

## 0. TL;DR task
1. Open `https://colattao-cafe-rush.vercel.app/menu` **and** the game screen;
   capture full-page screenshots (mobile + desktop) and extract palette,
   typography, layout, components, and any playful/game motifs. **This is the
   reference to emulate** — you are not moving this menu.
2. Apply that look to the generic `APP/web/src/app/m/[id]/page.tsx` as **one
   shared warm template** (Phase 1 / Option A — see §7.4), serving every *new*
   restaurant by id. Route colors through CSS variables (warm defaults) so the
   later per-brand theming (Phase 2 / Option B) is a clean drop-in. Colattao
   itself keeps its external Café Rush menu — don't hardcode Colattao here.
3. Reuse the CSS system + kit primitives documented in §3–§4. Add warm
   café tokens; keep the operator surfaces (sapphire) untouched.
4. Keep the `SAMPLE` watermark for sample menus; gate it per `live` flag (§6).
5. Verify (tsc + eslint + screenshots), open a **draft PR**, keep changes
   presentation-only.

---

## 1. What this product is (surfaces & audiences)
| Surface | Route | Audience | Look (current) |
|---|---|---|---|
| Customer registry + request inbox | `/customers`, `/customers/requests` | AMMA internal ops | **Sapphire** (cool, corporate-tech) |
| Customer account | `/customers/[id]` | AMMA ops | Sapphire |
| Public build intake | `/request-update` | Prospects | Sapphire + sapphire hero PNG |
| Owner dashboard | `/owner/[id]` | Restaurant owner (self-serve menu edits) | **Sapphire** |
| **Public QR menu (basic tier)** | **`/m/[id]`** | **Diners** | **Warm gold** + `SAMPLE` watermark ← *this is the target* |
| Penalty Shootout game | `/penalty-shootout` | Campaign/add-on | Per-skin (Colattao = warm café) |

**Core rule — warm vs. cool:** operator/back-office tools are **sapphire**
(reads as "tech"); anything a **diner** sees stays **warm/appetizing**. Keep
that split. The menu integration is on the *warm* side.

---

## 2. The Colattao source material (already in this repo)
You still need the **live** menu screenshot for exact layout/type, but the brand
is already here:

- **Brand hero photo:** `APP/web/public/assets/colattao/colattao-menu-hero-4x5-v1.webp`
  — warm, moody, artisanal café: espresso wood, cream, blue-floral porcelain,
  latte art. This is the emotional target.
- **Cream logo:** `APP/web/public/assets/colattao/colattao-logo-cream-1600.png`
- **Game art (the "game look"):** `APP/web/public/assets/colattao/penalty/*`
  — playful cartoon: bright blue sky, green striped pitch, cheering warm-brown
  crowd holding cream "CHURRO LATTE / WE ♥ COLATTAO" signs + coffee cups.
  Friendly, rounded, vibrant.
- **Exact Colattao palette** (from the game skin
  `APP/web/src/penalty/skin/skins.ts` → `colattaoColors`):
  - espresso `#1b0f07` · warm brown `#3a2616` · grass `#14331a`
  - cream `#f4e6cc` (text/goal frame) · net/tan `#d8c3a3`
  - **caramel/amber accent `#d8a24c`** · keeper caramel `#c98a3c` · deep brown `#6b3f17`
  - game accents: mint `#8fe6a8` · coral `#ff8a6b` · yellow `#f4d35e`
- `publicMenuHref()` in `OwnerDashboard.tsx` sends Colattao to the **external**
  `https://colattao-cafe-rush.vercel.app/menu`. **DECIDED: keep linking out** —
  the in-store physical QR points there and must not change (see ⛔ constraint
  above). Do not migrate Colattao to `/m/colattao`.

---

## 3. The CSS system — `APP/web/src/app/globals.css`
All classes are additive and theme-agnostic unless noted. **Reuse these; add a
warm-brand variant rather than inventing a parallel system.**

- `.fc-bg` — sapphire operator ground (gold spotlights → recolored to sapphire),
  faint grid, graphite gradient. **Do not touch** (operator surfaces).
- `.fc-bg-warm` — café-gold textured ground for the menu (base `#060403`).
  **You will likely branch this** into a Colattao/espresso variant, e.g.
  `.fc-bg-espresso` (base `#0d0805`, caramel `#d8a24c` spotlights) — or make the
  ground a CSS variable set by the per-brand theme (preferred, see §5).
- `.fc-grain` — fixed film-grain overlay (theme-agnostic; keep).
- `.fc-vignette` — top bloom + bottom vignette (theme-agnostic; keep).
- `.fc-panel` — milled card: hairline border, **sapphire** specular top edge
  (`::before`), soft inner top light, blur. Used by operator surfaces.
- `.fc-panel-warm` — overrides `.fc-panel::before` to a **gold** edge. Apply as
  `class="fc-panel fc-panel-warm"`. For Colattao, add `.fc-panel-espresso`
  overriding `::before` to caramel `#d8a24c`, or drive it from a var.
- `.fc-panel-link` — hover lift + accent keyline (reduced-motion safe).
- `.fc-watermark` — tiled diagonal low-opacity gold `SAMPLE` overlay
  (`pointer-events:none`, `aria-hidden`). **Gate this** (§6).
- `.fc-balance` — `text-wrap: balance` for headings.
- Focus rings — `:focus-visible` 2px ring scoped per ground:
  `.fc-bg …` = sapphire, `.fc-bg-warm …` = gold. Add a matching rule for any new
  warm ground.
- Selection + caret colors are scoped per ground the same way.
- `.rb-shiny-text` — animated sheen on display titles; `.fc-bg .rb-shiny-text`
  re-tints it sapphire. Motion-safe (static fallback under reduced-motion).

**Preferred refactor:** introduce brand tokens as CSS variables
(`--brand-accent`, `--brand-ground`, `--brand-cream`, `--brand-panel-edge`) set
by a wrapper class per restaurant, so `.fc-panel`/eyebrows/prices read
`var(--brand-accent)` instead of hardcoded hex. This is how you make the menu
**per-brand themable** without duplicating classes.

---

## 4. The component kit — `APP/web/src/components/ui.tsx`
Server-safe, presentational, **shared with the owner routes** — so existing
exports must stay backward-compatible (only add; don't restyle in place).

Exports: `cn`, `Card`, `Panel`, `SectionHeading` (props: `tone: "gold"|"accent"`,
`icon`, `hint`), `Button`/`ButtonLink` (variants:
`primary | gold | accent | ghost | subtle | danger | success`), `buttonClass`,
`Field`/`fieldClass`, `StatusPill` (`tone`, `dot`) + `StatusDot`
(tones: `success | danger | neutral | gold | accent`), `Chip`, `PageShell`
(`width`), `TopBar`, `SignOutButton`, `Eyebrow`, `PageTitle` (`shine`), `Lede`,
`Monogram` (initials avatar), `StatTile` (`icon`, `label`).

Rules learned:
- **Additive only** on shared exports. To theme the menu warm, add a variant
  (e.g. a `warm`/`espresso` button variant, or drive color via var) — the sapphire
  `accent` variant and gold `gold` variant already exist as the pattern.
- `SectionHeading tone="accent"` = sapphire, `tone="gold"` = gold (default).
  For Colattao you'll want a caramel option — add `tone="brand"` reading a var.

---

## 5. Iconography — Lucide (`lucide-react`, ISC)
Already installed and used across every surface. Rules:
- **Icon + label** on actions — never icon-only except universal glyphs
  (external-link, chevron, close) which get `aria-label`.
- Sizes: 12–14px inline (buttons/pills/meta), 15–16px headers; `strokeWidth`
  1.75 (2 for tiny/emphasis); `aria-hidden`; color inherits.
- **Status = color + shape + text** (colorblind-safe) — keep the green/coral
  semantics (86 = coral, bring-back = green).
- Menu icons in play today: `ExternalLink` (website), `Clock` (hours),
  `Sparkles` (promos). For the game-flavored menu consider `Coffee`, `CupSoda`,
  `Croissant`, `Star`, `Trophy` — tastefully, don't clutter a menu.

---

## 6. Watermark gating (do this as part of the task)
Currently `.fc-watermark` renders on **every** `/m/[id]`. Add a small "live"
allowlist so paying clients drop it:
- Extend `APP/web/src/lib/brand.ts` (`BrandAssets`) with `live?: boolean` (or a
  `LIVE_MENU_IDS` set), default sample.
- In `m/[id]/page.tsx`, render `.fc-watermark` + the `sr-only "Sample menu"`
  span only when the restaurant is **not** live.
- Colattao is a real client → likely `live: true` (no watermark). Confirm in §7.

---

## 7. Owner decisions (2026-07)
1. ~~In-house vs link-out~~ **RESOLVED: keep linking out** — the in-store physical
   QR points to the Café Rush URL and must not change. Café Rush is the design
   reference only; `/m/[id]` is the generic template for new clients.
2. **Game energy — RESOLVED: use the actual Penalty Shootout game as the
   reference.** It's in THIS repo and attached to the Vercel site:
   - Route: `/penalty-shootout` (`APP/web/src/app/penalty-shootout/`), engine +
     skins under `APP/web/src/penalty/**`, Colattao **"Café Shootout"** skin in
     `APP/web/src/penalty/skin/skins.ts`, art in
     `APP/web/public/assets/colattao/penalty/**`.
   - Its visual language: warm café-stadium, cartoon crowd, cream signs, green
     pitch, caramel/gold, chunky friendly rounded shapes, playful energy.
   - Borrow that ENERGY into the menu tastefully — rounded friendly cards, warm
     café-stadium palette, a small mascot/ball/coffee motif — **but the menu must
     stay legible and appetizing**; do not let cartoon overwhelm scannability.
     Play the game first, screenshot it, then echo its feel.
3. **Watermark — CONFIRMED.** `SAMPLE` shows on sample menus; it **drops when a
   client goes live** (per the `live` flag in §6). (Note: Colattao itself is NOT
   served by `/m/[id]` — it links out — so this only governs new-client menus.)
4. **Per-brand theming scope — RESOLVED: start A, then B (phased).**
   - **Phase 1 (build now) — Option A, one shared warm look:** a single strong
     warm café template for every new client's `/m/[id]`, echoing the Penalty
     Shootout game energy (§7.2). Only logo/hero/name/items differ per client.
     Do NOT build the theming machinery yet.
   - **Phase 2 (roadmap, build later) — Option B, per-brand themes:** when a
     non-café client's brand clashes with warm gold, add a small theme keyed by
     restaurant id (the §3 CSS-variable refactor: `--brand-accent`/`--brand-ground`/
     etc.) so each menu auto-matches its brand with zero per-menu code.
   - **Design Phase 1 so Phase 2 is a clean drop-in:** even while hardcoding the
     warm palette now, route accent/ground/edge/cream through CSS variables (with
     the warm values as defaults) so Phase 2 only has to supply per-id variable
     overrides — no template rewrite.

---

## 8. Execution checklist (mirror the workflow used for #151–#154)
- [ ] Screenshot live menu + game (mobile + desktop); note exact colors/type/layout.
- [ ] Add Colattao/warm brand tokens (CSS vars preferred) in `globals.css`.
- [ ] Extend `brand.ts` with theme + `live` flag.
- [ ] Restyle `m/[id]/page.tsx` per-brand: atmospheric hero, espresso/caramel/cream
      palette, café motifs + a dash of game energy, keep prices legible.
- [ ] Gate the watermark.
- [ ] **Guardrails:** presentation-only; no data/auth/Supabase/routing logic
      changes; keep all menu data untouched; **client approves art**; non-human
      mascots only; **logos are approved overlays, never AI-generated**.
- [ ] Verify: `cd APP/web && npm i && npx tsc --noEmit && npx eslint <files>`.
      Preview with a **temporary** route (e.g. `src/app/m-preview/page.tsx`) that
      mirrors the markup with mock data; screenshot mobile + desktop; **delete the
      preview before commit** (they were never committed for #151–#154).
- [ ] Draft PR to `main`; presentation-only; link this doc.

### Verification notes specific to this sandbox family
- Supabase env is usually absent locally → menu/dashboard read paths fail soft
  (return empty). Use `readOnly`/mock preview routes to screenshot populated UI.
- Chromium is pre-installed at
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; drive it with the
  `playwright` npm pkg (install into a scratch dir, `executablePath` above).
- Branch flow: work on `main`-based branch; if the prior PR merged, reset the
  branch to `origin/main` and `--force-with-lease` push (the merged history is
  already upstream).

---

## 9. Key files & references
- Menu: `APP/web/src/app/m/[id]/page.tsx`
- Brand registry: `APP/web/src/lib/brand.ts`
- CSS system: `APP/web/src/app/globals.css`
- Kit: `APP/web/src/components/ui.tsx`
- Colattao game skin/palette: `APP/web/src/penalty/skin/skins.ts`
- Colattao assets: `APP/web/public/assets/colattao/**`
- Governance/guardrails: root `CLAUDE.md`, `APP/web/AGENTS.md`
  ("this is NOT the Next.js you know" — Next 16, read vendored docs before new APIs),
  `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md`,
  `PRODUCT_MODULES/COLATTAO_COLATTANINI_COLLECTIBLE_CAMPAIGN.md`
- Reference implementations: PRs **#151** (premium refresh), **#152** (sapphire
  hero + focus rings + stat icons), **#153** (owner dashboard), **#154** (warm
  menu + watermark). The diffs ARE the style guide.

## 10. Stack facts
Next.js **16.2.7** (App Router, server components), React **19.2**, Tailwind
**v4** (`@import "tailwindcss"`, `@theme inline`; arbitrary values + `before:`/
`hover:`/`focus-visible:` variants used heavily), `lucide-react` **^1.24**.
App root: `APP/web`. Deploys on Vercel (root dir `APP/web`) — every PR gets a
preview URL.
