# Fina Calle — Skills Roadmap (Claude capabilities to lean on)

Goal: pick the skills that maximize Anthony's leverage as a solo founder running an
Instagram-first newsroom + a Next.js production app + payments R&D (PayBridge) + the
Colattao white-label café platform. Ordered by impact-to-effort.

## Tier 1 — Remove friction from daily flow (do first)
- **fewer-permission-prompts** — scans for safe, repeated commands and allowlists them so the watchdog and daily work stop pausing on approvals. Directly fixes the git-push prompt problem.
- **update-config** — sets up hooks ("whenever X, do Y"), permissions, env. This is how recurring automations become hands-off. Pairs with the watchdog initiative.
- **claude-api** — the newsroom pipeline runs on Claude. This skill adds prompt caching (cost cut), model migration, and tuning. Biggest recurring-cost lever in the product.

## Tier 2 — Content production at scale (his actual output)
- **adobe-create-social-variations** — one source -> many Instagram-ready variants.
- **adobe-resize-photos-and-videos** — reformat to IG feed/story/reel dimensions fast.
- **adobe-batch-edit-photos** — consistent look across a batch (matches editorial standard).
- **canvas-design** — cinematic mobile front pages, his stated visual signature.

## Tier 3 — Protect the production app + the money path
- **security-review** — PayBridge touches payments; run before anything ships near money.
- **code-review** / **simplify** — keep APP/web reliable; priority is stabilize > simplify.
- **verify** / **run** — prove a change works in the real app before shipping.

## Tier 4 — Business / scale documents
- **pptx**, **docx**, **xlsx**, **pdf** — investor decks, franchise docs (Franchise Certainty),
  café-platform operating models and tier sheets for Colattao.

## Suggested adoption order
1. fewer-permission-prompts + update-config (one session) -> unblocks unattended automation.
2. claude-api pass over the newsroom pipeline -> caching + cost.
3. Wire adobe-* + canvas-design into the front-page production loop.
4. security-review gate on PayBridge before any live payment code.
