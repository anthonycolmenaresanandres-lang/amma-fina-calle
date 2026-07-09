# Colattao × Colattanini — Collectible Penalty Campaign
_AMMA Ventures LLC DBA Fina Calle · Product Module_
_Created: 2026-06-07 | Version: 1.0 (MVP, manual launch)_

---

## What this is

A **physical sticker collectible campaign** that rides on top of the live Penalty
Shootout game (`/penalty-shootout`). Customers scan a QR, play a keeper level,
**show staff the result screen**, and get the matching **Colattanini** character
sticker. Collect all **3** to earn **today's Colattanini reward**.

**MVP rule: 100% manual.** No backend, no POS integration, no customer accounts,
no loyalty database, no data capture, no automated reward validation, and **no
app‑code change** is required to launch. Staff verify the result screen by eye and
hand out a physical sticker.

> Reward wording is **"today's Colattanini reward"** everywhere until Anthony /
> Colattao approve the exact prize in writing. Do not print a specific prize yet.

---

## The roster (approved — do not add characters or menu items)

Three characters, each tied to one **verified** Colattao menu item and one keeper
level in the game:

| Keeper level (play this) | Colattanini character (sticker you get) | Signature menu item (cross‑sell) |
|---|---|---|
| **Street Keeper** | **Churro Chispa** | **Churro Latte** |
| **Club Keeper** | **Coco Beach Blitzer** | **Coco Beach** |
| **Pro Keeper** | **Cali Croissant Captain** | **California Sandwich** |

- **Only these 3 menu items** are part of the campaign. Do not invent others.
- Each character is *themed* to its menu item for cross‑sell ("Churro Chispa runs
  on Churro Latte") — buying the item is **not required** to get a sticker in the MVP.

---

## Customer flow (MVP)

1. **Scan** the Penalty Shootout QR at the counter / table.
2. **Play** a keeper level (Street, Club, or Pro).
3. **Show staff the result screen** (the end‑of‑match score screen).
4. **Get the matching sticker** for that keeper (see roster table).
5. **Stick it** on the laminated collector sheet.
6. **Collect all 3** keepers' stickers → staff give **today's Colattanini reward**.

EN: "Scan, play a keeper, show your screen, grab your sticker. Collect all 3!"
ES: "Escanea, juega contra un portero, muestra tu pantalla y llévate tu sticker. ¡Junta los 3!"

---

## What MVP does NOT do (guardrails)

This campaign **does not** and **must not** claim to:
- track players, scores, or visits in any database
- integrate with the POS or process any payment
- create customer accounts or capture personal data (no names, emails, phone)
- validate rewards automatically or "verify" results by software
- require any app‑code change to launch

Validation is a **staff eye‑check** of the on‑screen result. Stickers and the
reward are **physical and manual**. Keep it light, fast, and friendly.

---

## Why it works (sales framing, honest)

- Turns a one‑time scan into a **3‑visit collectible loop** (come back to finish the set).
- **Cross‑sells** the three signature items without requiring a purchase to play.
- **Zero tech overhead** for the owner — print stickers + a sheet + a counter sign, brief staff, go.
- Fits the Fina Calle game‑customization direction: the game already has 3 keepers
  (Street/Club/Pro), so the collectible maps 1:1 with no code change.

---

## Components (each has its own spec)

| Component | Spec file |
|---|---|
| Sticker art + print specs | `ASSET_SPECS/COLATTANINI_STICKER_SPECS.md` |
| Laminated collector sheet | `ASSET_SPECS/COLATTANINI_LAMINATED_COLLECTOR_SHEET.md` |
| Counter sign / table tent copy | `ASSET_SPECS/COLATTANINI_COUNTER_SIGN_COPY.md` |
| Staff playbook | `OPERATIONS/COLATTANINI_STAFF_PLAYBOOK.md` |

---

## Launch checklist (MVP)

- [ ] Owner approves the **exact reward** (replace "today's Colattanini reward")
- [ ] Owner confirms the **3 menu items** are current and correctly priced (separate from this doc)
- [ ] Print: 3 sticker designs (qty per `STICKER_SPECS`), collector sheets, counter sign
- [ ] Brief staff with `COLATTANINI_STAFF_PLAYBOOK.md`
- [ ] Confirm the Penalty Shootout QR resolves to the game on a phone
- [ ] Decide simple daily limits (e.g., one sticker per keeper per customer per visit) — owner's call
- [ ] Go live; review weekly by counting stickers handed out (manual)

---

## Pricing / packaging note

This is a **physical add‑on campaign** on top of the existing Penalty Shootout
game package. Print/sticker production is an **upsell** (see
`CASE_STUDIES/COLATTAO/DOCS/PRICING_AND_OFFER.md` — "printed QR stands / sticker
design package"). Governed by `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md`.

---

## Cross‑references
- `GAME_LIBRARY/PENALTY_SHOOTOUT.md` — the game the QR points to
- `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md` — customization + brand guardrails
- `SALES_DEMO_PACKAGE/QR_DEMO_SHEET.md` — QR usage
- `CASE_STUDIES/COLATTAO/DOCS/PRICING_AND_OFFER.md` — sticker/signage upsell
