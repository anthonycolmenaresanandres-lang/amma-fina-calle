# Colattao Customer-Facing Asset Plan — Fina Calle Client OS

> **Implemented (brand chrome slice) — 2026-06-06.** Approved assets copied to
> `APP/web/public/assets/colattao/` and wired via a reusable resolver
> (`src/lib/brand.ts`, keyed by restaurant id) into `/m/[id]` (header logo +
> menu hero) and `/owner/[id]` (dashboard logo accent). `/` and `/request-update`
> left client-agnostic. QR generation still deferred until domain lock.
>
> | Final path | Source | Used on |
> |---|---|---|
> | `public/assets/colattao/colattao-logo-cream-1600.png` | `overlays_v1/colattao_logo_cream_transparent_1600px.png` | `/m/colattao` header, `/owner/colattao` dashboard |
> | `public/assets/colattao/colattao-logo-white-1600.png` | `overlays_v1/colattao_logo_white_transparent_1600px.png` | reserved (OG / dark sections) |
> | `public/assets/colattao/colattao-menu-hero-4x5-v1.webp` | `environment_product_v1/colattao-b001-product-coffee-pastry-4x5-v001.webp` | `/m/colattao` hero |
> | `public/assets/colattao/colattao-ambient-9x16-v1.webp` | `environment_product_v1/colattao-b001-atmosphere-fogata-9x16-v001.webp` | reserved (future accent) |


Asset discovery, normalization, and placement plan for Colattao's customer-facing
experience, plus a repeatable workflow for future restaurants. **Planning only —
no app changes, no files copied/renamed yet.** Implementation is gated on explicit
approval (see §9).

Scope guardrails honored: nothing here touches `/conquest`, Supabase migrations,
Stripe/payment code, owner auth/security, customer registry data, or secrets/env.

> Key principle discovered: the **parent surfaces are client-agnostic** (`/`,
> `/request-update` are AMMA/Fina Calle, per `APP/ROUTE_PORTAL_PLAN.md`). Colattao
> brand visuals therefore belong on **`/m/colattao`**, **`/owner/colattao`**, and
> **QR print assets** — not on the landing or intake pages.
>
> Second principle: **per-item menu photos are owner-managed** (uploaded through
> the owner dashboard into Supabase Storage `menu-images`), not bundled in the
> repo. The repo holds only **brand chrome** (logo, hero, OG image).

---

## 1. Files inspected

Asset folders (targeted, not a blind scan):
- `APP/web/public/assets/` — current customer-facing visuals.
- `ASSET_REGISTRY/COLATTAO/normalized/` — logos, environment/product, QR, owner, mockups.
- Registry docs: `QR_DESTINATIONS.md`, `DIGITAL_MENU_ASSETS.md`, `APPROVED_LOGOS.md`,
  `APPROVED_QR_CODES.md`, `LOGOS.md`, `OVERLAYS.md`, `OWNER_REFERENCES.md`.

## 2. Asset audit

### Logos
| Path | Dims | Fmt | Quality | As-is? | Action | Destination / placement |
|---|---|---|---|---|---|---|
| `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_cream_transparent_1600px.png` | 1600×884 | PNG-A | High | ✅ | rename (underscores→hyphens), compress | `/m/colattao` + `/owner/colattao` header logo |
| `…/overlays_v1/colattao_logo_white_transparent_1600px.png` | 1600×884 | PNG-A | High | ✅ | rename, compress | Alt on darker sections / OG |
| `…/overlays_v1/colattao_logo_*_master.png` | smaller | PNG-A | High | source | keep as master only | not shipped |
| `APP/web/public/assets/fina-calle-os-logo.png` | 1254×1254 | PNG | High but **1.8 MB** | ⚠️ heavy | compress / export webp | landing (AMMA, unchanged) |

### Environment / product (premium cafe visuals)
| Path | Ratio (px) | Fmt | Quality | As-is? | Action | Placement |
|---|---|---|---|---|---|---|
| `…/environment_product_v1/colattao-b001-product-coffee-pastry-4x5-v001.webp` | 4:5 (1080×1350) | WebP | High, ~192 KB | ✅ | copy + rename | `/m/colattao` section/hero image |
| `…/colattao-b001-product-coffee-pastry-9x16-v001.webp` | 9:16 (1080×1920) | WebP | High | ✅ | copy + rename | menu mobile hero / story |
| `…/colattao-b001-atmosphere-fogata-4x5 & 9x16-v001.webp` | 4:5 / 9:16 | WebP | High, ~125–131 KB | ✅ | copy + rename | menu/owner ambient accent |
| `…/colattao-b001-environment-plant-detail-*` , `…-shelf-decor-*` | 4:5 / 9:16 | WebP | High | ✅ | optional | secondary accents |

### QR
| Path | Dims | Fmt | As-is? | Action | Placement |
|---|---|---|---|---|---|
| `…/qr_v1/colattao_qr_poster_4x5.png` | 1080×1350 | PNG | ❌ **wrong destination** | **regenerate** | poster (after domain lock) |
| `…/qr_v1/colattao_qr_poster_9x16.png` | 1080×1920 | PNG | ❌ wrong destination | regenerate | vertical poster |
| `…/qr_v1/colattao_qr_scan_tile_1x1.png` | 1080×1080 | PNG | ❌ wrong destination | regenerate | table tile |
| `…/qr_v1/colattao_qr_source_master.png` | 1254×1254 | PNG | ❌ wrong destination | regenerate | master |

> `QR_DESTINATIONS.md` confirms these encode `colattao-cafe-rush.vercel.app[/menu]`,
> **not** the Client OS `/m/colattao` (public) or `/owner/colattao` (owner). Per the
> registry's own rule, QR images are regenerated when the destination changes — so
> **all four must be regenerated** once the final domain is locked (runbook gap G1).

### Owner imagery
| Path | Dims | Fmt | As-is? | Action | Placement |
|---|---|---|---|---|---|
| `…/owner_v1/owner_full_body_cutout_v1.png` | — | PNG-A | ⚠️ rights/approval unknown | confirm before public use | optional `/owner/colattao` accent |
| `…/owner_v1/owner_*_reference_*` | various | PNG | reference-only | **do not ship** | AI consistency references, internal |

### Mockups
| Path | Dims | Fmt | As-is? | Action |
|---|---|---|---|---|
| `…/mockups_v2/colattao-encanto-static-concept-a-9x16-v002.png` | 1080×1920 | PNG **1.9 MB** | ❌ campaign concept, heavy | keep for campaigns, **not** app embedding |

### Current app
| Path | Dims | Note |
|---|---|---|
| `APP/web/public/assets/fina-calle-intake-hero.png` | 1600×720 | Generic Fina Calle intake hero — keep (client-agnostic page) |

## 3. Best available assets (ready or near-ready)
1. **Colattao cream + white transparent logos** (1600×884) — clean, just rename + compress.
2. **Environment/product WebPs** (coffee-pastry, atmosphere-fogata) — already normalized, right ratios, well-compressed; the strongest customer-facing visuals on hand.
3. **QR source master** — usable as a *layout* template, but the encoded URL must be regenerated.

## 4. Missing assets
- **QR codes for the new destinations** (`/m/colattao`, `/owner/colattao`) — must be generated after domain lock.
- **Per-item menu photos** (Espresso, Cortado, Almond Croissant) — none exist; these are **owner-uploaded** via the dashboard into Storage, not repo files.
- **Open Graph / social preview** (1200×630) for `/m/colattao` — none exists.
- **Confirmed-for-public owner portrait** — only reference imagery exists.
- (Optional) a Colattao-tinted menu hero distinct from the generic atmosphere shot.

## 5. Normalized naming plan
Convention: `lowercase`, `hyphenated`, `{customer}-{purpose}-{ratio}-v{n}.{ext}`,
no vague names. Fix the logo underscores. Examples:

| Current | Normalized |
|---|---|
| `colattao_logo_cream_transparent_1600px.png` | `colattao-logo-cream-1600.png` |
| `colattao_logo_white_transparent_1600px.png` | `colattao-logo-white-1600.png` |
| `colattao-b001-product-coffee-pastry-4x5-v001.webp` | `colattao-menu-hero-4x5-v1.webp` |
| `colattao-b001-atmosphere-fogata-9x16-v001.webp` | `colattao-ambient-9x16-v1.webp` |
| (new) | `colattao-qr-menu-poster-4x5-v1.png` (→ `/m/colattao`) |
| (new) | `colattao-qr-owner-tile-1x1-v1.png` (→ `/owner/colattao`) |
| (new) | `colattao-og-1200x630-v1.png` |

Proposed shipped destination: `APP/web/public/assets/colattao/` (brand chrome only).

## 6. Customer-facing placements (Colattao)
| Surface | Asset | Notes |
|---|---|---|
| Landing `/` | **none Colattao** | client-agnostic AMMA parent — unchanged |
| `/request-update` | **none Colattao** | client-agnostic intake — unchanged |
| `/m/colattao` (public menu) | `colattao-logo-cream-1600`, `colattao-menu-hero-4x5`, optional `colattao-ambient` | header logo + a hero/section image; item photos via owner uploads |
| `/owner/colattao` (owner portal) | small `colattao-logo-*` header accent | subtle; keep dashboard utilitarian |
| QR print/poster | regenerated `colattao-qr-menu-*` (public) + `colattao-qr-owner-*` (private) | after domain lock + scan test |
| Admin `/customers` thumbnail | small `colattao-logo` avatar (optional) | admin-only; cosmetic |
| Social/OG for `/m/colattao` | `colattao-og-1200x630` | needs creation |

## 7. Image specs for repeatability
| Use | Ratio | Target px | Format | Budget |
|---|---|---|---|---|
| Mobile hero | 4:5 | 1080×1350 | WebP | ≤200 KB |
| Desktop hero | 16:9 | 1920×1080 | WebP | ≤300 KB |
| Menu card / item photo | 1:1 | 1080×1080 | WebP | ≤150 KB |
| Seasonal banner | 5:2 | 1600×640 | WebP | ≤200 KB |
| QR poster | 4:5 & 9:16 | 1080×1350 / 1080×1920 | PNG | crisp, ECC **H** |
| QR table tile | 1:1 | 1080×1080 | PNG | ECC H |
| Social / OG | 1.91:1 | 1200×630 | PNG/WebP | ≤200 KB |
| Owner portal header/accent | wide/transparent | 1600 wide | PNG-A | ≤120 KB |

(The app uses plain `<img>`, so ship already-compressed WebP; no runtime optimizer.)

## 8. Recommended per-asset action
- **Copy + rename:** Colattao logos (cream/white), coffee-pastry + atmosphere WebPs.
- **Compress:** `fina-calle-os-logo.png` (1.8 MB → WebP); any PNG hero over ~300 KB.
- **Regenerate:** all four QR assets for the new destinations (after domain lock).
- **Create:** OG image (1200×630); per-item photos via owner upload; optional Colattao menu hero.
- **Do not ship:** owner *reference* imagery, heavy campaign mockups (keep for campaigns).
- **Confirm rights:** owner cutout before any public placement.

## 9. Replication protocol (future restaurants)
1. **Required source assets:** transparent logo (≥1600 wide); 1 atmosphere/environment shot; optional confirmed owner portrait; (item photos come later via owner upload).
2. **Accepted formats:** logo = PNG with alpha; photos = WebP (or JPG → convert); QR = PNG.
3. **Naming:** `{restaurantId}-{purpose}-{ratio}-v{n}.{ext}`, lowercase/hyphenated, no vague names.
4. **Folder destination:** `APP/web/public/assets/{restaurantId}/` for brand chrome only; item photos live in Supabase Storage `menu-images`.
5. **Placement checklist:** menu header logo · menu hero · owner header accent · public QR (→`/m/{id}`) · owner QR (→`/owner/{id}`) · OG image · optional admin thumbnail.
6. **Audit checklist:** correct dims/ratio · under size budget · WebP where applicable · transparent logo · no vague filenames · QR encodes the **final** domain · scan-tested.
7. **Approval checklist:** client owns/approves imagery · no unlicensed/AI-invented menu text or prices · destinations verified · domain locked before print · brand matches venue.

## 10. Is implementation safe to do next?
**Partially — and only after approval + one prerequisite.**
- **Safe now (on approval):** copy + rename the Colattao logos and the two WebP visuals into `APP/web/public/assets/colattao/`, compress the heavy landing logo, and wire the logo into `/m/colattao` and `/owner/colattao` headers. These are brand chrome, no data exposure, no touched guardrails.
- **Blocked until domain lock (runbook G1):** generating/printing QR posters — they must encode the **final** production URL, or they'll need reprinting.
- **Owner-driven, not repo work:** per-item menu photos (uploaded via the dashboard).
- **Needs creation:** OG image.

Recommended order if approved: (1) ship logo + hero chrome to `/m/colattao` and
`/owner/colattao`; (2) lock domain; (3) regenerate + scan-test QR; (4) add OG image;
(5) owner uploads item photos during Colattao verification. No second restaurant
until Colattao is verified.
