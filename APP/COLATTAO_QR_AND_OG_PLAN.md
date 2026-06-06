# Colattao QR + Open Graph Plan — Fina Calle Client OS

Planning only. **No QR codes generated, no app/Supabase/data changes.** This
defines exactly what to produce once the production **domain is locked** (runbook
gap G1) and migrations `0002`–`0004` are verified live.

Supersedes the old destinations in
`ASSET_REGISTRY/COLATTAO/QR_DESTINATIONS.md` (which point at
`colattao-cafe-rush.vercel.app`) — the Client OS uses the routes below instead.

---

## 1. Final URLs the QR codes must encode

Let **`{DOMAIN}`** = the locked production origin (custom domain preferred, e.g.
`https://colattao.finacalle.com`; otherwise the stable `*.vercel.app`). It must
equal `NEXT_PUBLIC_APP_URL` so magic-link redirects and QR targets agree.

| QR | Encodes | Audience |
|---|---|---|
| **Public customer QR** | `{DOMAIN}/m/colattao` | Diners |
| **Owner staff QR** | `{DOMAIN}/owner/colattao` | Owner / staff |

Do not encode `vercel.app` preview URLs or anything with a deployment hash —
those rotate. Use the final stable origin only.

## 2. Public customer QR vs owner staff QR

| | Public customer QR | Owner staff QR |
|---|---|---|
| Destination | `/m/colattao` (read-only menu) | `/owner/colattao` (magic-link gated) |
| Who | Diners | Owner/manager |
| Secret? | No | **No** — auth is the emailed link, so the QR itself carries no secret; a photo of it is harmless |
| Placement | Customer-visible (tables, window, counter) | Discreet/staff-only (back office, under counter) so customers don't scan it by mistake |
| Volume | Many (one per table + window) | One or two |
| Reprint trigger | Domain change | Domain change |

## 3. Print specs (both QR types)

- **Error correction: level H** (~30%) — survives scuffs, smudges, partial logo overlay.
- **Quiet zone:** ≥ 4 modules of clear margin on all sides.
- **Contrast:** dark code on light background; avoid low-contrast or inverted unless scan-tested.
- **Finish:** **matte** laminate — gloss causes glare that breaks scans under café lighting.
- **Min physical size:** rule of thumb scan distance ≈ 10× the QR's printed width. Table tent QR ≥ 2.5–3 cm; wall/window poster QR ≥ 5–8 cm.
- **Source resolution:** generate at ≥ 1080 px; export print at 300 DPI, CMYK for professional print.
- **Center logo:** optional, only with ECC H **and** a passing scan test; keep it ≤ ~20% of the code area.
- **Mandatory:** scan-test the **printed** piece (not just screen) on both iOS and Android before mounting.

## 4. Placement recommendations inside Colattao

**Public (`/m/colattao`):**
- Table tents / table stickers (primary).
- Window decal near the entrance (passersby).
- Counter / register card.
- Receipt footer (if POS allows a printed URL/QR).

**Owner (`/owner/colattao`):**
- Back office or under-counter card, **firmly mounted**, staff-only.
- Not on customer-facing surfaces.

## 5. Open Graph (social/link preview) image

For when `/m/colattao` is shared (text, social, messaging):
- **Size:** 1200 × 630 px (1.91:1). **Format:** PNG or WebP, **≤ 200 KB**.
- **Safe margins:** keep logo/text ~80 px from edges (platform cropping).
- **Composition:** Colattao logo + short tagline (e.g. "Scan. Sip. Colattao.") on
  the dark premium gradient, optional ambient photo behind at low opacity.
- **Wire-in (later, app change — not now):** export metadata `openGraph.images`
  for `/m/[id]`, keyed by the brand resolver like the existing chrome. One file
  per restaurant: `colattao-og-1200x630-v1.png`.

## 6. Assets to reuse from `public/assets/colattao/`

| Need | Reuse |
|---|---|
| QR poster branding | `colattao-logo-cream-1600.png` (light bg) / `colattao-logo-white-1600.png` (dark bg) |
| QR poster / OG background | `colattao-ambient-9x16-v1.webp` (vertical poster), `colattao-menu-hero-4x5-v1.webp` (square-ish) |
| OG logo | `colattao-logo-white-1600.png` on the dark gradient |

The **QR code graphic itself is generated fresh** (encodes the new URL) — it is
never reused from the old `qr_v1` set. Compose the new QR onto a branded poster
using the logo/ambient assets above.

## 7. Approval checklist before generating any QR code

- [ ] Production **domain locked**; `NEXT_PUBLIC_APP_URL` set to it.
- [ ] Migrations `0002`–`0004` run; `/m/colattao` and `/owner/colattao` **live and working**.
- [ ] Real Colattao owner email in `owner_emails`; magic-link sign-in confirmed.
- [ ] Destinations **manually opened and verified** (not assumed).
- [ ] QR generated at ECC **H**, with quiet zone + contrast.
- [ ] **Printed** piece scan-tested on iOS + Android.
- [ ] Owner QR placement is staff-only; public QR placement is customer-facing.
- [ ] New destination records added to `QR_DESTINATIONS.md` (status verified), old
      cafe-rush records marked superseded.

## 8. Future replication rules (other restaurants)

For each new restaurant `{id}` (only after Colattao is fully verified):
- **Two QR codes:** public → `{DOMAIN}/m/{id}`, owner → `{DOMAIN}/owner/{id}`.
- **Same print specs** (ECC H, quiet zone, matte, scan-tested) as §3.
- **Naming:** `{id}-qr-menu-poster-4x5-v1.png`, `{id}-qr-menu-tile-1x1-v1.png`,
  `{id}-qr-owner-tile-1x1-v1.png` (lowercase, hyphenated).
- **Storage:** generated QR + posters under
  `ASSET_REGISTRY/{ID}/normalized/qr_v2/` (v2 = Client OS destinations); brand
  chrome stays in `APP/web/public/assets/{id}/`.
- **Registry:** add verified destination records to the restaurant's
  `QR_DESTINATIONS.md`; never invent a path or encode a preview URL.
- **One OG image** per restaurant: `{id}-og-1200x630-v1.png`, wired via the brand
  resolver.
- **Gate:** no QR/print until that restaurant's `/m/{id}` + `/owner/{id}` are live
  and the domain is locked.

---

## Next safest step
**Lock the production domain** and set `NEXT_PUBLIC_APP_URL` to it. That single
decision unblocks both QR generation and the OG image, and prevents costly
reprints. Until the domain is locked and migrations `0002`–`0004` are verified,
no QR/OG production should start — this remains documentation only.
