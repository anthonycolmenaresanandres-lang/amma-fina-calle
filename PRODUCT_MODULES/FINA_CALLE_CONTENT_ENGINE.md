# Fina Calle OS — Content Engine (Test Idea)

> Status: **Test surface shipped** on branch `claude/news-content-generation-test-G7HWE` (PR #3). Isolated, removable, no live routes touched.

## The Idea

Reframe the premium Fina Calle OS brand as a **content-generation brand**: a
named set of prompt systems that take **one product idea** and spin it into a
month of Instagram-ready content — hooks, carousels, captions, Reel scripts,
and DM flows. Warm, human, on-brand. Reuses the existing dark + champagne-gold
design language so it reads as a sibling of the live site, not a foreign skin.

Origin: reference Instagram carousels (the "content generation formula" brand)
provided by the founder. This is a brand/positioning experiment, not yet a
committed product line.

## Where It Lives (Code)

Isolated test route — does **not** modify any live route:

- `APP/web/src/app/content-engine/page.tsx` — hero, stat row, systems section, brand footer
- `APP/web/src/app/content-engine/PromptSystemGrid.tsx` — client island: copy-to-clipboard cards, gold-highlighted `[input]` tokens
- `APP/web/src/app/content-engine/promptSystems.ts` — the prompt-system catalog (single source of truth)

Reachable only by direct URL (`/content-engine`); not linked from navigation.

## The 7 Prompt Systems

1. The Digital Product Idea Generator — niche → 5 ranked, sellable product ideas
2. The Scroll-Stopping Hook Vault — 20 thumb-stopping openers *(authored to complete the set; not from the source carousels)*
3. The Instagram Bio Converter — 5 warm, non-pushy selling bios
4. The Carousel Content Machine — 9-slide carousel that sells without feeling like an ad
5. The Sales Caption Writer — scroll-stopping caption, no salesy tone
6. The Story Selling Script — 60-second Reel script via storytelling
7. The DM Automation Sequence — 3-message flow that warms a comment into a buyer

## Design

- Base `#030405`, accent champagne gold `#d8b36d`
- Radial-gradient + fine-grid ambient layers, glass cards, uppercase tracked labels
- Same Instagram footer CTA as the live landing page
- Each card highlights fill-in `[variables]` and copies the full prompt to clipboard

## Verification (as shipped)

`next build` ✅ (prerenders static, all live routes unchanged) · `eslint` ✅ ·
TypeScript ✅ · runtime smoke test ✅ · Vercel preview deploy **Ready** ✅.

## Open Questions / Next Steps

- Replace system #02 with the real source prompt if one exists.
- Decide whether Content Engine becomes a real product module, a marketing
  surface, or stays a discarded experiment.
- If kept: decide navigation/linking (currently unlisted), and whether to
  expand the catalog beyond the initial 7.
