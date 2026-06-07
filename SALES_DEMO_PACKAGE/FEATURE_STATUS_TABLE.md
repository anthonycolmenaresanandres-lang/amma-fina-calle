# Feature Status Table

> Honesty tool. Only verified facts from company files + the six owner-verified live URLs.
> If something isn't proven, it's **Unknown/Unverified** — not "live." Do not invent.

Legend: **Live** = verified working in production · **Demo/R&D** = real but labeled research/demo ·
**Coming soon** = part of the offer/setup, not visible-live yet · **Future module** = planned, not built ·
**Unknown/Unverified** = not confirmed — do not claim.

---

## ✅ Live (verified)
| Feature | Evidence |
|---|---|
| Fina Calle OS platform + custom domain + SSL | `https://finacalleos.com` 200/HTTPS; FINACALLEOS_DOMAIN_OPERATIONS.md |
| `www` → root redirect (308) | FINACALLEOS_DOMAIN_OPERATIONS.md |
| Live digital menu for a real client (Colattao): items, prices, hours, promos | `/m/colattao` owner-verified PASS; route reads menu/categories/hours/promos |
| Owner portal **secure sign-in** (per-restaurant, email) | `/owner/colattao` owner-verified PASS; OwnerLogin + auth gate in code |
| Owner self-edit dashboard (menu items, prices, promos) for an authorized, signed-in owner | `/owner/[id]` OwnerDashboard in code (behind login) |
| Branded mini-game — **Penalty Shootout V1**, playable (3 keepers, 5 shots) | `/penalty-shootout` merged (PR #6, ac6f6cf) + owner-verified PASS |
| Second playable game demo — Conquest | `/conquest` (homepage CTA "Play Conquest Demo"; in production build) |
| Build/update request intake | `/request-update` (homepage CTA "Request a Build"; live route) |
| R&D page (honest roadmap) | `/rd` owner-verified PASS |

## 🧪 Demo / R&D (real, but label as research/demo — not a finished client product)
| Item | Note |
|---|---|
| Penalty Shootout positioning | Playable **demo of the game engine / game R&D**; a client version would be brand-skinned. (GAME_LIBRARY/PENALTY_SHOOTOUT.md: "Playable V1.") |
| Per-client branded game **skin** (e.g. Colattao palette) | Concept/next-step, not built (PENALTY_SHOOTOUT.md "Suggested next steps"). |
| PayBridge (payment-options connector) | **R&D only.** Explicitly *not a lender, not an approval party, not a live payment system* (`/rd`). Never sell as payments. |
| Franchise Certainty, PermitReady, LA72 | R&D prototypes on `/rd`. Not live products. |

## 🔜 Coming soon (in the written offer / part of setup — not visible-live today)
| Item | Source |
|---|---|
| QR signage flow / printed QR stands / sticker design | PRICING_AND_OFFER.md §1, §3 (signage/stickers are setup/upsell) |
| Feedback box for customer comments | PRICING_AND_OFFER.md §1 (NOT present on live `/m/colattao` today) |
| Basic anonymous analytics (traffic-level) | PRICING_AND_OFFER.md §1 (not verified visible-live; treat as setup deliverable) |
| Owner presentation page | Listed in offer / old app; not a live finacalleos.com route today |
| Monthly analytics report; seasonal game-copy updates | PRICING_AND_OFFER.md §3 upsells |

## 🧱 Future module (planned, not built)
| Item | Source |
|---|---|
| Loyalty / rewards expansion | PRICING_AND_OFFER.md §3; MODULE_LIBRARY.md |
| Hosted billing links | MODULE_LIBRARY.md |
| Website Concept module | MODULE_LIBRARY.md |
| Online ordering / checkout (e.g. Square "later, only if approved") | OWNER_DEMO_SCRIPT_ES §5 — future, owner-approved only |

## ❓ Unknown / Unverified (do NOT claim either way)
- Whether the feedback box & anonymous analytics are switched on in production *right now*.
- Whether Colattao's owner has activated their owner login.
- PayBridge availability/timeline (it's research).
- Any prospect-specific custom feature before it's scoped.

## 🚫 Explicitly NOT offered as-is (per PRICING_AND_OFFER.md §5 + rules)
- Payment processing setup · POS integration · backend loyalty database
- Full website rebuild · AI automation (as a live product) · guaranteed sales
- Customer personal-data collection (unless separately scoped)

---

### Pricing (verified — PRICING_AND_OFFER.md)
- **Starter:** setup $300–$500 · monthly $35–$75
- **Premium:** setup $750–$1,200 · monthly $100–$200
- **Custom:** quote-based
- **Pilot (first-client friendly):** low or free setup + ~$50/month
- **Monthly maintenance includes:** small menu/copy updates, uptime checks, QR link support, basic owner support.
