# Vital Vibes footer and counter review — 2026-10-15

Local isolated draft from main `77815b07d398ecf7af19b251b3056fd8200a09cb` in branch `codex/vital-vibes-footer-20261015`.

## Scope
- Remove visible generation terminology; keep illustrative appearance and unconfirmed menu/ingredients/allergen notices.
- Authentic existing Fina Calle emblem and official homepage link. Rights line: “Diseño y software del sitio” and “© [current UTC build year] Fina Calle. Todos los derechos reservados.” Customer branding/products are not claimed.
- Document standard for future builds only. Existing customer routes and shared footer/component remain untouched.
- New generated photorealistic terrazzo/forest-green ribbed counter material, optimized 1600×534 WebP, 79,188 bytes. Original decorative fruit/leaf line art replaces loops without asserting actual product ingredients. Remove cream arch/tan circle.
- Explicitly reset `details.ingredient-block` when opening each category.

## Verification
- Scoped route/data/asset/noindex/CSP selftest: pass, seven categories and 51 unchanged menu entries/image mappings.
- Scoped ESLint: pass. Next webpack production build and TypeScript: pass, 54 static pages.
- Chrome responsive checks: 320×740, 390×768, 390×844, 768×768, 1440×768, 1440×1000. No horizontal overflow, clipped product artwork, failed assets or JavaScript errors. Main/footer controls at least 44 px. Reduced motion emulated.
- Actual authentic footer image decode, official link, current year and keyboard outline: pass.
- Expanded item remains illustrative, lazy image decodes, recipe/allergen notice remains. About text retains owner-confirmation needs. No visible AI/IA wording.
- Regression: expand ingredients in Protein Shakes, Escape/focus return, open Special Drinks → ingredients closed. Native item disclosure still opens.
- All 102 item-image/thumbnail assets, recovered customer logo, artwork mappings, menu data, shared footer, package files unchanged against base.
- Before/after at matching 390×768 inspected; narrow/mobile/desktop screenshots visually inspected. Physical device and screen-reader testing not claimed.

## Evidence and release boundary
Task workspace evidence: `vital-vibes-footer/evidence/qa-results.json`, `before-390x768.png`, `home-390x768.png`, `footer-390x768.png`, other six-viewport captures, expanded item/About captures. Raw counter and exact generation prompt/hash: `vital-vibes-footer/counter-raw.png` and `asset-provenance.json`; raw PNG excluded from public/repository payload.

Prepared and verified locally. No new public push/PR/merge/deploy or remote CI. AGENTS states “never push to main; open a branch and let Anthony approve the PR” and “never ... publish/send ... ship to production. Prep to the line.” Prior approval for PR341 was fulfilled; this revision awaits specific release authorization. No automatic approval rejection occurred. No spend, installs, new services, outreach or retroactive customer rollout. Temporary browser/server stopped; isolated worktree retained.
