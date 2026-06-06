# Runway Static Poster Animation Prompt

## Purpose

Reusable Runway prompt for animating an approved static Colattao poster while preserving the exact layout, logo, QR, text, and premium brand direction.

Use this prompt with:

```txt
C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle\ASSET_REGISTRY\COLATTAO\normalized\mockups_v2
```

## Primary Prompt

```txt
Animate this static Colattao 9:16 poster into a premium short café reveal.

Preserve the exact poster layout, Colattao logo, QR code, CTA text, secondary text, colors, and composition.

Keep the product-first image as the hero. Add only subtle cinematic motion: gentle warm light movement, slight depth/parallax in the coffee and pastry image, very soft glow on the gold border, and restrained café atmosphere.

Do not change or rewrite any text.
Do not alter the QR code.
Do not blur, warp, redraw, replace, or regenerate the Colattao logo.
Do not add new copy.
Do not add rewards, discounts, coupons, win language, percentages, prices, or legal text.
Do not mention a website.

Keep the CTA exactly:
Scan for Full Menu

Keep the secondary line exactly:
View the menu while you wait.

Visual tone: premium espresso, cream, antique gold, warm café lighting, restrained luxury, mobile-first readability.

Output should feel like a polished Digital Menu launch poster gently coming alive, not a chaotic ad.
```

## Negative Prompt / Rejection Rules

```txt
Do not modify the QR pattern.
Do not invent a new QR code.
Do not change the destination.
Do not transform the Colattao logo into a different logo.
Do not stylize the text.
Do not misspell Colattao.
Do not add website language.
Do not add discount, reward, coupon, win, percentage, pricing, or giveaway language.
Do not add extra badges or stickers.
Do not add owner imagery.
Do not make the poster noisy, crowded, neon, cartoonish, or generic.
```

## Review Checklist After Runway Output

- CTA still reads exactly `Scan for Full Menu`.
- Secondary line still reads exactly `View the menu while you wait.`
- QR remains visually intact and readable.
- Colattao logo remains unchanged.
- No forbidden promotional language appears.
- Digital Menu context is preserved.
- Product-first hierarchy remains clear.
- Motion is subtle and premium.
- Output is internal-preview only until human approval.

## Usage Notes

- Use `normalized\mockups_v2` first.
- Use `normalized\overlays_v1` only as logo/QR preservation reference.
- Use `normalized\qr_v1` only as QR preservation reference.
- Use `normalized\environment_product_v1` only if Runway needs extra product or cafe atmosphere reference.
- Do not use `normalized\owner_v1` unless the campaign explicitly needs owner support; owner identity remains V1 partial.
