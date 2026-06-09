# Colattanini — Print Asset Regeneration Prompts (ChatGPT image gen)

High-resolution regeneration of the two official Colattanini print pieces — the
**collector album page** and the **sticker giveaway sheet** — in the approved
style, with the canonical badge numbers **CHURRO LATTE #10 · CAPPUCCINO #7 ·
MATCHA LEMONADE #9** (same numbers on the stickers AND the album slots, so the
collect-and-stick mechanic lines up).

> Why regenerate: the first official exports were ~1080 px, which is soft when
> scaled to a full A4/Letter page. Ask for the **largest square/portrait the
> model allows** (target ≥2500 px on the short side), then Claude crops/sizes,
> adds bleed/trim, and exports the 300-DPI PDFs.

## Guardrails (always)
- **Non-human mascots only** — the "players" are anthropomorphic drink cups/glasses.
- No FIFA / World Cup / club / real-person / real-face references.
- **Promise nothing on the page** — no "free sticker", "one per order", prices,
  or guarantees anywhere. The album bottom stays clean.
- The wordmark is the **Colattao** logo (script, with steam swirl + smile swoosh
  under it). If exact logo fidelity matters, leave a clean dark space for the
  logo and Claude will overlay the approved master logo file instead of trusting
  the AI rendering.

## Shared style guide (paste at the top of either prompt)
> Vintage Panini-style soccer **trading-card sticker** set called **COLATTANINI**
> for the coffee brand **Colattao**. Warm, slightly retro, clean vector-ish
> illustration. Card anatomy, top to bottom:
> - **Top band:** solid dark espresso-brown (#1f140b). A maroon-red **circular
>   badge with a thin gold ring** at the top-left holding a **white bold number**.
>   Centered/right: the cream **"Colattao"** script wordmark with a small coffee
>   **steam swirl** above and a **smile swoosh** underline beneath it.
> - **Body:** soft tan→cream vertical gradient with the **mascot** centered — an
>   anthropomorphic drink with a cute simple face, little arms, legs in striped
>   socks and soccer boots; one mascot rests a foot on a **soccer ball**.
> - **Bottom band:** same dark espresso-brown with the drink **name in gold/cream
>   serif ALL-CAPS**, and a small "COLATTAO  F C" line under it.
> - Thin **gold border**, rounded corners, a white die-cut keyline around the card.
>
> **The three mascots (always these, same numbers):**
> - **#10 CHURRO LATTE** — tall clear glass, layered caramel/cream coffee, swirled
>   whipped-cream top dusted with cinnamon; warm brown/tan kit.
> - **#7 CAPPUCCINO** — blue-and-white **delft porcelain** cup on a saucer, floral
>   blue pattern, whipped-cream top; navy boots, white/blue kit.
> - **#9 MATCHA LEMONADE** — green ribbed tumbler, bright matcha green with a
>   **lemon slice** and **mint** garnish; green kit, green/white socks.

---

## Prompt A — Sticker sheet (the giveaway)
> [paste Shared style guide]
>
> Lay out a **kiss-cut sticker sheet**: a **3 columns × 3 rows grid** of these
> cards on a **plain white background** with even white gutters between them
> (room for kiss-cut). Each **column** is one mascot, repeated down all three
> rows, so the sheet has **3× CHURRO LATTE #10, 3× CAPPUCCINO #7, 3× MATCHA
> LEMONADE #9** (9 identical-per-column cards total). All nine cards identical in
> size and framing. Portrait orientation, ~3:4. No text anywhere except the card
> labels and numbers. **Highest resolution available (≥2500 px wide).**

## Prompt B — Collector album page (blank, to stick onto)
> [paste Shared style guide]
>
> Design a **single-page collector album** titled **COLATTANINI** on a **cream
> marbled-paper** background inside a **gold double-line frame** with small **trim
> cross-marks** at the corners. Top: a dark espresso-brown **header banner** with a
> small **Colombian flag chip** in each top corner, the cream **"Colattao"** script
> logo (steam swirl + smile swoosh) centered, **"COLATTANINI"** in large gold serif
> caps under it, and a thin subtitle **"OFFICIAL STICKER ALBUM · THE STRIKERS"**.
> Below the header, **three empty sticker slots** shaped like the cards (same dark
> top band with numbered badge + Colattao logo, same dark bottom name band reading
> the drink name + "COLATTAO  F C"), but the body shows only a **faint brown
> silhouette** of that mascot as a placement guide. Slots: **#10 CHURRO LATTE** and
> **#7 CAPPUCCINO** side-by-side on the top row, **#9 MATCHA LEMONADE** centered
> below them. **Leave the bottom of the page clean — no promotional text, no
> promises, no prices.** Portrait A4 proportions (~3:4.24). **Highest resolution
> available (≥2500 px wide).**

---

## After ChatGPT exports (Claude does this)
1. Verify it's a flat opaque export (no fake checkerboard); confirm numbers read
   **10 / 7 / 9** on both pieces.
2. Album → scale to **A4 + 3 mm bleed (2550×3578)** and a Letter-fit variant;
   sheet → center on **A4 (2480×3508)** and **Letter (2550×3300)** with white margins.
3. Re-cut the 3 individual die-cut stickers from the sheet (#10 / #7 / #9).
4. Export all sheet/album **PDFs at 300 DPI**; phone QA → merge.
