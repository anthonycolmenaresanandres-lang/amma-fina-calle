# Client Launch Checklist (White-Label Rollout)

Use this checklist every time you launch a new client version of the Cafe Rush system.

## 1. Client Intake
- [ ] Confirm business name (public-facing and internal slug).
- [ ] Collect official logo files (PNG/SVG, transparent background preferred).
- [ ] Confirm brand colors (primary, secondary, background, text, accent).
- [ ] Collect menu/items and pricing.
- [ ] Confirm desired game tone/voice (playful, premium, family, etc.).
- [ ] Confirm contact email for owner updates.
- [ ] Confirm desired domain/subdomain.

## 2. Asset Preparation
- [ ] Confirm logo path under `public/assets/<client>/logo/...`.
- [ ] Prepare gameplay background image.
- [ ] Prepare good item images (3+ recommended).
- [ ] Prepare bad item image (clear negative visual).
- [ ] Prepare sticker concepts (print/social promo style).
- [ ] Prepare QR signage files (PNG/PDF print-ready versions).

## 3. Theme Config Update
- [ ] Update [src/config/theme.ts](C:/Users/antho/OneDrive/Desktop/Colattao%20Rush/src/config/theme.ts).
- [ ] Update brand values (`name`, `displayName`, colors, fonts, logo path).
- [ ] Update game copy (`title`, `subtitle`, `winMessage`, milestone line).
- [ ] Update rotating loss messages to client-appropriate voice.
- [ ] Update all asset paths to new client assets.
- [ ] Update UI labels/disclaimer text as needed.

## 4. Menu Update
- [ ] Update [src/data/colattaoMenu.ts](C:/Users/antho/OneDrive/Desktop/Colattao%20Rush/src/data/colattaoMenu.ts) or future client menu data file.
- [ ] Verify prices.
- [ ] Verify categories.
- [ ] Verify hours/location.

## 5. Privacy and Analytics
- [ ] Confirm no personal customer data collection is introduced.
- [ ] Confirm Vercel Analytics wording remains accurate.
- [ ] Update owner presentation/privacy copy if needed.

## 6. QA Checklist
- [ ] Run `npm.cmd run build`.
- [ ] Test `/` (game start, gameplay, win/loss, pass flow).
- [ ] Test `/menu`.
- [ ] Test `/owner-presentation`.
- [ ] Test feedback box behavior.
- [ ] Test QR codes resolve correctly.
- [ ] Test on phone (portrait, readability, tap targets).

## 7. Deployment
- [ ] Commit final client changes.
- [ ] Push to GitHub.
- [ ] Confirm Vercel deploy succeeds.
- [ ] Confirm production URL is live and correct.
- [ ] Generate final QR files for production URL.

## 8. Client Handoff
- [ ] Send live links.
- [ ] Send print files (QR/stickers/signage).
- [ ] Explain update request process (what to send, where, expected turnaround).
- [ ] Collect first feedback batch and log revisions.
